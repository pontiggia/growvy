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
    direction?: string,
  ) {
    if (!direction) {
      throw new AppError('Missing transfer direction', 400);
    }

    if (direction === 'incoming') {
      await this.handleBuyTransaction(asset, portfolioData, amount, price);
    } else if (direction === 'outgoing') {
      await this.handleSellTransaction(asset, portfolioData, amount);
    } else {
      throw new AppError('Invalid transfer direction', 400);
    }
  }
}
