import coinstatsopenapi from '@api/coinstatsopenapi';
import { config } from '../config/config';
import { AssetsService } from './assetsService';

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

  static async getWalletTransactions(
    walletAddress: string,
    connectionId: string,
  ) {
    try {
      console.log('Sync start');
      await this.syncWalletTransactions(walletAddress);

      coinstatsopenapi
        .getWalletTransactions({
          address: walletAddress,
          connectionId: connectionId,
        })
        .then(({ data }) => console.log(data))
        .catch((err) => console.error(err));
      console.log('trans completed');
    } catch (error) {
      throw new Error('Error fetching wallet transactions');
    }
  }

  private static async syncWalletTransactions(walletAddress: string) {
    try {
      await coinstatsopenapi.transactionsSync({
        address: walletAddress,
        connectionId: 'all',
      });
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

    return enhancedBalances;
  }

  private static async standardizeTransactionData(transactionData: any) {
    const transactions = transactionData[0].transactions;
    return transactions;
  }
}
