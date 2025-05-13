import { Portfolio } from '../models/portfolioModel';
import { AppError } from '../utils/appError';
import { CreatePortfolioDTO, UpdatePortfolioDTO } from '../types/portfolio';
import { UserService } from './userService';
import { User } from '../models/userModel';
import { BlockchainService } from './blockchainService';

export class PortfolioService {
  static async getPortfolios() {
    return Portfolio.find();
  }

  static async getPortfolioById(portfolioId: string) {
    const portfolio = await Portfolio.findById(portfolioId).populate({
      path: 'assets.assetData',
    });
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    return portfolio;
  }

  static async getPublicPortfolio(portfolioId: string, userId?: string) {
    const portfolio = await Portfolio.findById(portfolioId).populate({
      path: 'assets.assetData',
    });

    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const isOwner =
      userId && portfolio.ownerId.toString() === userId.toString();

    if (!portfolio.settings?.privacySettings?.isPublic && !isOwner) {
      throw new AppError('This portfolio is private', 403);
    }

    if (
      !isOwner &&
      portfolio.settings?.privacySettings?.isPublic &&
      !portfolio.settings?.privacySettings?.showAmounts
    ) {
      const publicPortfolio = { ...portfolio.toObject() };

      if (publicPortfolio.assets) {
        publicPortfolio.assets = publicPortfolio.assets.map((asset) => ({
          assetData: asset.assetData,
          hasAsset: true,
          amount: 0,
          averageBuyPrice: 0,
        }));
      }

      return publicPortfolio;
    }

    return portfolio;
  }

  static async getPortfoliosByUser(userId: string) {
    await UserService.getUserById(userId);
    return Portfolio.find({ ownerId: userId });
  }

  static async createPortfolio(
    portfolioData: CreatePortfolioDTO,
    userId: string,
  ) {
    const { trackerMode, walletAddress } = portfolioData;

    const enhancedData = { ...portfolioData, ownerId: userId };
    const portfolio = (await Portfolio.create(enhancedData)) as any;

    if (trackerMode === 'wallet' && walletAddress) {
      const walletData = await BlockchainService.getWalletBalance(
        walletAddress,
      );
      const connectionId = walletData.blockchain;
      portfolio.assets = walletData.balances;
      portfolio.hasAsset = true;
      await portfolio.save();

      this.processWalletTransactionsBackground(
        walletAddress,
        portfolio._id.toString(),
        userId,
        connectionId,
      );
    }

    return portfolio;
  }

  static async updatePortfolio(id: string, portfolioData: UpdatePortfolioDTO) {
    await this.getPortfolioById(id);

    const portfolio = await Portfolio.findByIdAndUpdate(id, portfolioData, {
      new: true,
    });

    return portfolio;
  }

  static async deletePortfolio(id: string) {
    const portfolio = await this.getPortfolioById(id);
    await portfolio.deleteOne();
  }

  static async syncWalletPortfolio(
    portfolioId: string,
    userId: string,
  ): Promise<any> {
    const portfolio = await this.getPortfolioById(portfolioId);

    if (portfolio.trackerMode !== 'wallet' || !portfolio.walletAddress) {
      throw new AppError(
        'This portfolio is not a wallet portfolio or has no wallet address',
        400,
      );
    }

    if (portfolio.ownerId.toString() !== userId) {
      throw new AppError('You are not the owner of this portfolio', 403);
    }

    const walletData = await BlockchainService.getWalletBalance(
      portfolio.walletAddress,
    );
    const connectionId = walletData.blockchain;

    portfolio.assets = walletData.balances;
    portfolio.hasAsset = walletData.balances.length > 0;

    await portfolio.save();

    this.processWalletTransactionsBackground(
      portfolio.walletAddress,
      portfolioId,
      userId,
      connectionId,
    );

    return {
      status: 'Synced',
    };
  }

  private static processWalletTransactionsBackground(
    walletAddress: string,
    portfolioId: string,
    userId: string,
    connectionId: string,
  ): void {
    BlockchainService.processWalletTransactions(
      walletAddress,
      portfolioId,
      userId,
      connectionId,
    )
      .then(() =>
        console.log(
          `Background transaction processing completed for portfolio ${portfolioId}`,
        ),
      )
      .catch((err) =>
        console.error(
          `Error in background transaction processing for portfolio ${portfolioId}:`,
          err,
        ),
      );
  }
}
