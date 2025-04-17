import { AppError } from '../utils/appError';
import { PortfolioAssetManager } from './portfolioAssetManager';

export class TransactionTypeHandler {
  static async handleBuyTransaction(
    asset: any,
    portfolioData: any,
    amount: number,
    price: number,
  ) {
    const assetId = asset._id.toString();
    const existingAssetIndex = PortfolioAssetManager.findAssetInPortfolio(
      portfolioData.assets,
      assetId,
    );

    if (existingAssetIndex === -1) {
      PortfolioAssetManager.addNewAssetToPortfolio(
        portfolioData,
        asset,
        amount,
        price,
      );
    } else {
      PortfolioAssetManager.updateExistingAsset(
        portfolioData,
        existingAssetIndex,
        amount,
        price,
      );
    }
  }

  static async handleSellTransaction(
    asset: any,
    portfolioData: any,
    amount: number,
  ) {
    const assetId = asset._id.toString();
    const existingAssetIndex = PortfolioAssetManager.findAssetInPortfolio(
      portfolioData.assets,
      assetId,
    );

    if (existingAssetIndex === -1) {
      throw new AppError(
        'Asset not found in portfolio for sell transaction',
        400,
      );
    }

    PortfolioAssetManager.reduceAssetAmount(
      portfolioData,
      existingAssetIndex,
      amount,
    );
  }

  static async handleTransferTransaction(
    asset: any,
    portfolioData: any,
    amount: number,
    price: number,
    type: string,
  ) {
    if (type === 'buy') {
      await this.handleBuyTransaction(asset, portfolioData, amount, price);
    } else if (type === 'sell') {
      await this.handleSellTransaction(asset, portfolioData, amount);
    } else {
      throw new AppError('Invalid transaction type', 400);
    }
  }
}
