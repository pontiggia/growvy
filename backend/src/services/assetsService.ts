import { Asset } from '../models/assetModel';
import { AppError } from '../utils/appError';
import { CreateAssetDTO } from '../types/assets';
import { PortfolioService } from './portfolioService';
import { TransactionTypeHandler } from './transactionTypeHandler';

export class AssetsService {
  static async getAssets() {
    return Asset.find();
  }

  static async getAssetById(assetId: string) {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    return asset;
  }

  static async getAssetBySymbol(symbol: string) {
    const asset = Asset.findOne({ symbol: symbol });
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    return asset;
  }

  static async createAsset(assetData: CreateAssetDTO) {
    const asset = await Asset.create(assetData);

    return asset;
  }

  static async updateAsset(id: string, assetData: CreateAssetDTO) {
    await this.getAssetById(id);
    const asset = await Asset.findByIdAndUpdate(id, assetData, {
      new: true,
    });

    return asset;
  }

  static async deleteAsset(id: string) {
    const asset = await this.getAssetById(id);
    await asset.deleteOne();
  }

  static async handleAssetPortfolio(data: any, id: string) {
    const asset = await this.getAssetById(id);
    const { amount, price, type, portfolio } = data;
    const portfolioData = await PortfolioService.getPortfolioById(portfolio);

    if (!portfolioData.assets) {
      portfolioData.assets = [];
    }

    switch (type) {
      case 'buy':
        await TransactionTypeHandler.handleBuyTransaction(
          asset,
          portfolioData,
          amount,
          price,
        );
        break;
      case 'sell':
        await TransactionTypeHandler.handleSellTransaction(
          asset,
          portfolioData,
          amount,
        );
        break;
      case 'transfer':
        await TransactionTypeHandler.handleTransferTransaction(
          asset,
          portfolioData,
          amount,
          price,
          type,
        );
        break;
      default:
        throw new AppError('Unsupported transaction type', 400);
    }

    portfolioData.markModified('assets');
    await portfolioData.save();
  }

  static async getAssetsBySymbols(symbols: string[]) {
    return Asset.find({ symbol: { $in: symbols } }, '_id symbol').lean();
  }
}
