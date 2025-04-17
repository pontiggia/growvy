import coinstatsopenapi from '@api/coinstatsopenapi';
import { config } from '../config/config';
import { AssetsService } from './assetsService';
import { AppError } from '../utils/appError';
import { WalletTransaction } from '../models/walletTransactionModel';

coinstatsopenapi.auth(config.coinStatsKey);

export class BlockchainService {
  static async getWalletBalance(walletAddress: string) {
    try {
      const { data } = await coinstatsopenapi.getWalletBalances({
        address: walletAddress,
        networks: 'all',
      });
      const balances = this.standardizeBalanceData(data);
      return balances;
    } catch (error) {
      throw new Error('Error fetching wallet balance');
    }
  }

  static async processWalletTransactions(
    walletAddress: string,
    portfolioId: string,
    userId: string,
    connectionId: string,
  ) {
    await this.syncWalletTransactions(walletAddress);

    await new Promise((resolve) => setTimeout(resolve, 7000));

    const data = await this.getWalletTransactions(walletAddress, connectionId);
    const transactions = await this.standardizeTransactionData(
      data,
      portfolioId,
      userId,
    );
    // console.log('Standardized transactions:', transactions);
    await WalletTransaction.insertMany(transactions);
  }

  private static async getWalletTransactions(
    walletAddress: string,
    connectionId: string,
  ) {
    try {
      const result = await coinstatsopenapi.getWalletTransactions({
        address: walletAddress,
        connectionId: connectionId,
        limit: 25,
      });

      if (!result || !result.data) {
        throw new AppError('No transactions found', 404);
      }

      return result.data.result;
    } catch (error) {
      throw new Error('Error fetching wallet transactions');
    }
  }

  private static async syncWalletTransactions(walletAddress: string) {
    try {
      const { data } = await coinstatsopenapi.transactionsSync({
        address: walletAddress,
        connectionId: 'all',
      });
      console.log('Syncing wallet transactions:', data);
    } catch (error) {
      throw new Error('Error syncing wallet transactions');
    }
  }

  private static async standardizeBalanceData(walletData: any) {
    const data = walletData[0];
    const balances = data.balances;

    const enhancedBalances = await Promise.all(
      balances.map(async (balance: any) => {
        try {
          const asset = (await AssetsService.getAssetBySymbol(
            balance.symbol,
          )) as { _id: string } | null;

          return {
            amount: balance.amount,
            assetData: asset?._id.toString(),
          };
        } catch (error) {
          return {
            amount: balance.amount,
            assetData: null,
          };
        }
      }),
    );
    const blockchainData = {
      blockchain: data.blockchain,
    };
    enhancedBalances.push(blockchainData);

    return enhancedBalances;
  }

  private static async standardizeTransactionData(
    transactionData: any,
    portfolioId: string,
    userId: string,
  ) {
    if (!Array.isArray(transactionData)) {
      console.error('Expected array for transaction data');
      return [];
    }

    return transactionData
      .filter((tx) => {
        if (tx.transactions?.[0]?.items?.[0]?.nft) {
          return false;
        }

        if (tx.coinData?.count && Math.abs(tx.coinData.count) < 0.001) {
          return false;
        }

        if (!tx.coinData || !tx.coinData.symbol) {
          return false;
        }

        return true;
      })
      .map((tx) => {
        return {
          type: tx.type,
          date: new Date(tx.date),
          symbol: tx.coinData.symbol,
          amount: Math.abs(tx.coinData.count || 0),
          fee: tx.fee?.totalWorth || 0,
          chain: tx.fee?.coin?.symbol || '',
          icon: tx.mainContent.coinIcons[0],
          hashUrl: tx.hash?.explorerUrl,
          portfolio: portfolioId,
          user: userId,
        };
      });
  }
}
