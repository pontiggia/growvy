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
      const walletData = await this.handleWalletPortfolio(walletAddress);
      const connectionId = walletData.pop();
      portfolio.assets = walletData;
      portfolio.hasAsset = true;
      await portfolio.save();

      BlockchainService.processWalletTransactions(
        walletAddress,
        portfolio._id.toString(),
        userId.toString(),
        connectionId.blockchain,
      )
        .then(() =>
          console.log(
            `Background transaction processing completed for portfolio ${portfolio._id}`,
          ),
        )
        .catch((err) =>
          console.error(
            `Error in background transaction processing for portfolio ${portfolio._id}:`,
            err,
          ),
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

  private static async handleWalletPortfolio(address: string) {
    const walletBalances = await BlockchainService.getWalletBalance(address);
    return walletBalances;
  }
}
