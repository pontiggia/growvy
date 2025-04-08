import { Transaction } from '../models/transactionModel';
import { AppError } from '../utils/appError';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from '../types/transaction';
import { AssetsService } from './assetsService';
import { PortfolioAssetManager } from './portfolioAssetManager';
import { PortfolioService } from './portfolioService';
import { TransactionTypeHandler } from './transactionTypeHandler';

export class TransactionService {
  static async getTransactions() {
    return Transaction.find();
  }

  static async getTransactionById(transactionId: string) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  static async getTransactionsByUser(userId: string) {
    return Transaction.find({ user: userId });
  }

  static async createTransaction(
    transaction: CreateTransactionDTO,
    userId: string,
  ) {
    const { amount, price, type, portfolio, direction, assetId } = transaction;
    const portfolioData = await PortfolioService.getPortfolioById(
      portfolio.toString(),
    );

    if (portfolioData.ownerId.toString() !== userId.toString()) {
      throw new AppError('User does not own this portfolio', 403);
    }

    const enhancedTransaction = {
      ...transaction,
      user: userId,
    };
    const newTransaction = await Transaction.create(enhancedTransaction);

    await AssetsService.handleAssetPortfolio(
      { amount, price, type, portfolio, direction },
      assetId.toString(),
    );

    return newTransaction;
  }

  static async updateTransaction(
    id: string,
    updatedTransactionData: UpdateTransactionDTO,
  ) {
    const originalTransaction = await this.getTransactionById(id);

    if (originalTransaction.transactionFrom === 'external') {
      throw new AppError('Cannot update external transactions', 400);
    }

    const portfolioData = await PortfolioService.getPortfolioById(
      originalTransaction.portfolio.toString(),
    );

    const asset = await AssetsService.getAssetById(
      originalTransaction.assetId.toString(),
    );

    await this.revertTransactionEffect(
      originalTransaction,
      portfolioData,
      asset,
    );

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updatedTransactionData,
      { new: true },
    );

    if (!updatedTransaction) {
      throw new AppError('Failed to update transaction', 500);
    }

    await this.applyTransactionEffect(updatedTransaction, portfolioData, asset);

    portfolioData.markModified('assets');
    await portfolioData.save();

    return updatedTransaction;
  }

  static async deleteTransaction(id: string) {
    const transaction = await this.getTransactionById(id);

    if (transaction.transactionFrom === 'external') {
      throw new AppError('Cannot delete external transactions', 400);
    }

    const portfolioData = await PortfolioService.getPortfolioById(
      transaction.portfolio.toString(),
    );

    const asset = await AssetsService.getAssetById(
      transaction.assetId.toString(),
    );

    await this.revertTransactionEffect(transaction, portfolioData, asset);

    portfolioData.markModified('assets');
    await portfolioData.save();

    await transaction.deleteOne();

    return { success: true, message: 'Transaction deleted successfully' };
  }

  private static async revertTransactionEffect(
    transaction: any,
    portfolioData: any,
    asset: any,
  ) {
    const { type, amount, price, direction } = transaction;
    const assetId = asset._id.toString();

    switch (type) {
      case 'buy':
        const buyIndex = PortfolioAssetManager.findAssetInPortfolio(
          portfolioData.assets,
          assetId,
        );

        if (buyIndex >= 0) {
          PortfolioAssetManager.reduceAssetAmount(
            portfolioData,
            buyIndex,
            amount,
          );
        }
        break;

      case 'sell':
        const sellIndex = PortfolioAssetManager.findAssetInPortfolio(
          portfolioData.assets,
          assetId,
        );

        if (sellIndex >= 0) {
          PortfolioAssetManager.updateExistingAsset(
            portfolioData,
            sellIndex,
            amount,
            transaction.price || 0,
          );
        } else {
          PortfolioAssetManager.addNewAssetToPortfolio(
            portfolioData,
            asset,
            amount,
            transaction.price || 0,
          );
        }
        break;

      case 'transfer':
        if (direction === 'incoming') {
          const transferInIndex = PortfolioAssetManager.findAssetInPortfolio(
            portfolioData.assets,
            assetId,
          );

          if (transferInIndex >= 0) {
            PortfolioAssetManager.reduceAssetAmount(
              portfolioData,
              transferInIndex,
              amount,
            );
          }
        } else if (direction === 'outgoing') {
          const transferOutIndex = PortfolioAssetManager.findAssetInPortfolio(
            portfolioData.assets,
            assetId,
          );

          if (transferOutIndex >= 0) {
            PortfolioAssetManager.updateExistingAsset(
              portfolioData,
              transferOutIndex,
              amount,
              transaction.price || 0,
            );
          } else {
            PortfolioAssetManager.addNewAssetToPortfolio(
              portfolioData,
              asset,
              amount,
              transaction.price || 0,
            );
          }
        }
        break;

      default:
        throw new AppError(`Unsupported transaction type: ${type}`, 400);
    }
  }

  private static async applyTransactionEffect(
    transaction: any,
    portfolioData: any,
    asset: any,
  ) {
    const { type, amount, price, direction } = transaction;

    switch (type) {
      case 'buy':
        await TransactionTypeHandler.handleBuyTransaction(
          asset,
          portfolioData,
          amount,
          price || 0,
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
          price || 0,
          direction,
        );
        break;

      default:
        throw new AppError(`Unsupported transaction type: ${type}`, 400);
    }
  }
}
