import { AppError } from '../utils/appError';

export class PortfolioAssetManager {
  static findAssetInPortfolio(assets: any[], assetId: string): number {
    return assets.findIndex(
      (entry: any) => entry.assetData._id.toString() === assetId,
    );
  }

  static addNewAssetToPortfolio(
    portfolioData: any,
    asset: any,
    amount: number,
    price: number,
  ) {
    portfolioData.assets.push({
      assetData: asset._id,
      amount: amount,
      averageBuyPrice: price,
    });
  }

  static updateExistingAsset(
    portfolioData: any,
    existingAssetIndex: number,
    amount: number,
    price: number,
  ) {
    const existingEntry = portfolioData.assets[existingAssetIndex];
    const oldAmount = existingEntry.amount;
    const oldAverage = existingEntry.averageBuyPrice;
    const newTotalAmount = oldAmount + amount;
    const newAverage =
      (oldAverage * oldAmount + price * amount) / newTotalAmount;

    portfolioData.assets[existingAssetIndex].amount = newTotalAmount;
    portfolioData.assets[existingAssetIndex].averageBuyPrice = newAverage;
  }

  static reduceAssetAmount(
    portfolioData: any,
    existingAssetIndex: number,
    amount: number,
  ) {
    const existingEntry = portfolioData.assets[existingAssetIndex];

    if (existingEntry.amount < amount) {
      throw new AppError(
        'Insufficient asset balance for this transaction',
        400,
      );
    }

    portfolioData.assets[existingAssetIndex].amount =
      existingEntry.amount - amount;

    if (portfolioData.assets[existingAssetIndex].amount === 0) {
      portfolioData.assets.splice(existingAssetIndex, 1);
    }
  }
}
