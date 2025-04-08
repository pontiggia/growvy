import coinstatsopenapi from '@api/coinstatsopenapi';
import { config } from '../config/config';
import { AssetsService } from './assetsService';
import { AppError } from '../utils/appError';

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
    console.log('Wallet transactions data:', data);
  }

  private static async getWalletTransactions(
    walletAddress: string,
    connectionId: string,
  ) {
    try {
      const data = await coinstatsopenapi.getWalletTransactions({
        address: walletAddress,
        connectionId: connectionId,
        limit: 30,
      });

      if (!data) {
        throw new AppError('No transactions found', 404);
      }

      return data;
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

  private static async standardizeTransactionData(transactionData: any) {}
}
