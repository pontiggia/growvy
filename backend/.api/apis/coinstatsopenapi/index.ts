import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'coinstatsopenapi/1.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         Get comprehensive data about all cryptocurrencies:
   * - Price, market cap, and volume
   * - Price changes (1h, 24h, 7d)
   * - Supply information
   * - Trading metrics
   * - Social links and metadata
   *
   * Optional Parameters:
   * - currency: Price display currency (default: USD)
   * - limit & skip: Pagination controls
   * - includeRiskScore: Add risk analysis data
   * - categories: Filter by coin categories
   * - blockchains: Filter by blockchain networks
   *
   * Sorting Options:
   * - sortBy: rank, price, volume, etc.
   * - sortDir: asc or desc</hr>
   *
   */
  getCoins(metadata?: types.GetCoinsMetadataParam): Promise<FetchResponse<200, types.GetCoinsResponse200>> {
    return this.core.fetch('/coins', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Returns detailed information about a specific cryptocurrency using coinId. </hr>
   *
   */
  getCoinById(metadata: types.GetCoinByIdMetadataParam): Promise<FetchResponse<200, types.GetCoinByIdResponse200>> {
    return this.core.fetch('/coins/{coinId}', 'get', metadata);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         Returns historical chart data for a specific cryptocurrency using coinId.</hr>
   *
   */
  getCoinChartById(metadata: types.GetCoinChartByIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/coins/{coinId}/charts', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         Returns the historical average price of a specific cryptocurrency for a given
   * date. </hr>
   *
   */
  getCoinAvgPrice(metadata: types.GetCoinAvgPriceMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/coins/price/avg', 'get', metadata);
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         Returns historical price data for a specific cryptocurrency on a selected
   * exchange.</hr>
   *
   */
  getCoinExchangePrice(metadata: types.GetCoinExchangePriceMetadataParam): Promise<FetchResponse<200, types.GetCoinExchangePriceResponse200>> {
    return this.core.fetch('/coins/price/exchange', 'get', metadata);
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         Returns a list of supported cryptocurrency exchanges available on
   * CoinStats.</hr>
   *
   */
  getTickerExchanges(): Promise<FetchResponse<200, types.GetTickerExchangesResponse200>> {
    return this.core.fetch('/tickers/exchanges', 'get');
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         Returns a list of tickers for a specific cryptocurrency across multiple
   * exchanges.</hr>
   *
   */
  getTickerMarkets(metadata?: types.GetTickerMarketsMetadataParam): Promise<FetchResponse<200, types.GetTickerMarketsResponse200>> {
    return this.core.fetch('/tickers/markets', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Returns the list of blockchains supported by CoinStats.</hr>
   *
   */
  getBlockchains(): Promise<FetchResponse<200, types.GetBlockchainsResponse200>> {
    return this.core.fetch('/wallet/blockchains', 'get');
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         Get cryptocurrency balances for any blockchain wallet:
   * - Token balances across multiple networks
   * - NFT holdings
   * - Current USD values
   * - Historical transactions
   *
   * Required:
   * - address: Wallet address to query
   * - connectionId: Blockchain network(s) to check
   *   - Single network (e.g., "ethereum")
   *   - Multiple networks ("ethereum,polygon")
   *   - "all" for all supported networks
   *
   * Features:
   * - Multi-chain support
   * - ERC20 token detection
   * - NFT balance tracking
   * - Historical data access</hr>
   *
   */
  getWalletBalance(metadata: types.GetWalletBalanceMetadataParam): Promise<FetchResponse<200, types.GetWalletBalanceResponse200>> {
    return this.core.fetch('/wallet/balance', 'get', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         Returns the balance data for a provided wallet address across all CoinStats-EVM
   * compatible supported networks. You can choose to query individual networks or all
   * available networks at a fixed cost of 400 credits. Each network query costs 40
   * credits.</hr>
   *
   */
  getWalletBalances(metadata: types.GetWalletBalancesMetadataParam): Promise<FetchResponse<200, types.GetWalletBalancesResponse200>> {
    return this.core.fetch('/wallet/balances', 'get', metadata);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         Returns the syncing status of the provided wallet address with the blockchain
   * network.</hr>
   *
   */
  getWalletSyncStatus(metadata: types.GetWalletSyncStatusMetadataParam): Promise<FetchResponse<200, types.GetWalletSyncStatusResponse200>> {
    return this.core.fetch('/wallet/status', 'get', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         Returns transaction data for a specific wallet address.
   * Note: Make sure to synchronize the transactions first by calling PATCH /transactions to
   * ensure accurate and up-to-date information.</hr>
   *
   */
  getWalletTransactions(metadata: types.GetWalletTransactionsMetadataParam): Promise<FetchResponse<200, types.GetWalletTransactionsResponse200>> {
    return this.core.fetch('/wallet/transactions', 'get', metadata);
  }

  /**
   * <b> 50 credits per request </b>
   *             <hr>
   *         Cost per network: 50 credits. Selecting all networks: 500 credits. Initiates the
   * syncing process to update transaction data for a specific wallet. By sending a PATCH
   * request with the wallet address as a parameter, you trigger the syncing process to
   * retrieve the latest transaction data for the wallet.</hr>
   *
   */
  transactionsSync(metadata: types.TransactionsSyncMetadataParam): Promise<FetchResponse<200, types.TransactionsSyncResponse200>> {
    return this.core.fetch('/wallet/transactions', 'patch', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         Cost per network: 40 credits. Selecting all networks: 400 credits. "Returns
   * wallet chart data for specific time ranges displayed on the CoinStats website.
   * Note: Make sure transactions are synced first by calling PATCH /transactions to retrieve
   * accurate chart data."</hr>
   *
   */
  walletChart(metadata: types.WalletChartMetadataParam): Promise<FetchResponse<200, types.WalletChartResponse200>> {
    return this.core.fetch('/wallet/chart', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Returns a list of exchange portfolio connections supported by CoinStats.</hr>
   *
   */
  getExchanges(): Promise<FetchResponse<200, types.GetExchangesResponse200>> {
    return this.core.fetch('/exchange/support', 'get');
  }

  /**
   * <b> 10 credits per request </b>
   *             <hr>
   *         Get your cryptocurrency exchange balances:
   * - Real-time balance information
   * - All coins and tokens in your account
   * - Current value in USD and BTC
   * - Available and locked amounts
   *
   * Required:
   * - connectionId: Exchange identifier (e.g., "binance", "coinbase")
   * - connectionFields: Exchange API credentials
   *   - apiKey: Your exchange API key
   *   - apiSecret: Your exchange API secret
   *
   * Security Note:
   * - Use read-only API keys when possible
   * - Keep your API credentials secure
   * - Enable IP restrictions on exchange side</hr>
   *
   */
  getExchangeBalance(body: types.GetExchangeBalanceBodyParam): Promise<FetchResponse<200, types.GetExchangeBalanceResponse200>> {
    return this.core.fetch('/exchange/balance', 'post', body);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         Returns the syncing status of the exchange portfolio, indicating whether the
   * portfolio is fully synced with the exchange or still in progress.</hr>
   *
   */
  getExchangeSyncStatus(metadata: types.GetExchangeSyncStatusMetadataParam): Promise<FetchResponse<200, types.GetExchangeSyncStatusResponse200>> {
    return this.core.fetch('/exchange/status', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         Returns transaction data for a specific exchange by portfolioId.
   * Note: Make sure the exchange is synced first by calling  PATCH /sync for up to date
   * infromation.</hr>
   *
   */
  getExchangeTransactions(metadata: types.GetExchangeTransactionsMetadataParam): Promise<FetchResponse<200, types.GetExchangeTransactionsResponse200>> {
    return this.core.fetch('/exchange/transactions', 'get', metadata);
  }

  /**
   * <b> 50 credits per request </b>
   *             <hr>
   *         Returns exchange chart data for specific time ranges displayed on the CoinStats
   * website.
   * Note: Make sure the exchange is synced first by calling  PATCH /sync for up to date
   * infromation.</hr>
   *
   */
  getExchangeChart(metadata: types.GetExchangeChartMetadataParam): Promise<FetchResponse<200, types.GetExchangeChartResponse200>> {
    return this.core.fetch('/exchange/chart', 'get', metadata);
  }

  /**
   * <b> 20 credits per request </b>
   *             <hr>
   *         Initiates the syncing process for the given exchange portfolio by
   * portfolioId.</hr>
   *
   */
  exchangeSyncStatus(metadata: types.ExchangeSyncStatusMetadataParam): Promise<FetchResponse<200, types.ExchangeSyncStatusResponse200>> {
    return this.core.fetch('/exchange/sync', 'patch', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Get detailed information about fiat currencies:
   * - Complete list of supported fiat currencies
   * - Current exchange rates
   * - Currency symbols and names
   * - Associated images/icons
   *
   * Use this data to:
   * - Convert cryptocurrency values to fiat
   * - Display fiat currency information
   * - Access currency metadata</hr>
   *
   */
  getFiatCurrencies(): Promise<FetchResponse<200, types.GetFiatCurrenciesResponse200>> {
    return this.core.fetch('/fiats', 'get');
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         Get the most popular NFT collections right now:
   * - Top trending collections by volume and activity
   * - Floor prices and market caps
   * - Collection statistics and metadata
   * - Trading volume and price trends
   *
   * Results are sorted by:
   * - Recent sales volume
   * - Market activity
   * - Social engagement
   * - Price movement</hr>
   *
   */
  getTrendingNfts(metadata?: types.GetTrendingNftsMetadataParam): Promise<FetchResponse<200, types.GetTrendingNftsResponse200>> {
    return this.core.fetch('/nft/trending', 'get', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         Returns a list of NFT assets owned by a wallet address.</hr>
   *
   */
  getNftsByWallet(metadata: types.GetNftsByWalletMetadataParam): Promise<FetchResponse<200, types.GetNftsByWalletResponse200>> {
    return this.core.fetch('/nft/wallet/{address}/assets', 'get', metadata);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         Returns detailed information about an NFT collection using
   * collectionAddress.</hr>
   *
   */
  getNftCollectionByAddress(metadata: types.GetNftCollectionByAddressMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionByAddressResponse200>> {
    return this.core.fetch('/nft/collection/{collectionAddress}', 'get', metadata);
  }

  /**
   * <b> 8 credits per request </b>
   *             <hr>
   *         Returns the list of NFT assets associated with NFT Collection by
   * collectionAddress.</hr>
   *
   */
  getNftCollectionAssetsByAddress(metadata: types.GetNftCollectionAssetsByAddressMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionAssetsByAddressResponse200>> {
    return this.core.fetch('/nft/{collectionAddress}/assets', 'get', metadata);
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         Returns detailed information about a specific NFT asset.</hr>
   *
   */
  getNftCollectionAssetByTokenid(metadata: types.GetNftCollectionAssetByTokenidMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionAssetByTokenidResponse200>> {
    return this.core.fetch('/nft/{collectionAddress}/asset/{tokenId}', 'get', metadata);
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         Returns the list of news sources.</hr>
   *
   */
  getNewsSources(): Promise<FetchResponse<200, types.GetNewsSourcesResponse200>> {
    return this.core.fetch('/news/sources', 'get');
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         Returns the list of cryptocurrency news articles with pagination.</hr>
   *
   */
  getNews(metadata?: types.GetNewsMetadataParam): Promise<FetchResponse<200, types.GetNewsResponse200>> {
    return this.core.fetch('/news', 'get', metadata);
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         Returns cryptocurrency news articles based on a specific type.</hr>
   *
   */
  getNewsByType(metadata: types.GetNewsByTypeMetadataParam): Promise<FetchResponse<200, types.GetNewsByTypeResponse200>> {
    return this.core.fetch('/news/type/{type}', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Returns a news article by id.</hr>
   *
   */
  getNewsById(metadata: types.GetNewsByIdMetadataParam): Promise<FetchResponse<200, types.GetNewsByIdResponse200>> {
    return this.core.fetch('/news/{id}', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Get current global cryptocurrency market data:
   * - Total market capitalization
   * - 24h trading volume
   * - Bitcoin dominance
   * - Market trends and indicators
   *
   * This data provides a high-level overview of the entire crypto market's current
   * state.</hr>
   *
   */
  getMarketCap(): Promise<FetchResponse<200, types.GetMarketCapResponse200>> {
    return this.core.fetch('/markets', 'get');
  }

  /**
   * <b> 8 credits per request </b>
   *             <hr>
   *         Get detailed information about all coins in your portfolio, including:
   * - Current holdings and their USD value
   * - Profit/Loss (PnL) information
   * - Performance metrics and statistics
   * - Risk assessment scores (optional)
   *
   * Required:
   * - shareToken: Get this from your CoinStats portfolio page by clicking "Share" and
   * copying the token from the share URL
   *
   * Optional Parameters:
   * - skip & limit: Control the number of results per page
   * - includeRiskScore: Set to "true" to include risk metrics
   *
   * Note: This endpoint is only available for users with a Degen plan subscription.</hr>
   *
   */
  getPortfolioCoins(metadata: types.GetPortfolioCoinsMetadataParam): Promise<FetchResponse<200, types.GetPortfolioCoinsResponse200>> {
    return this.core.fetch('/portfolio/coins', 'get', metadata);
  }

  /**
   * <b> 10 credits per request </b>
   *             <hr>
   *         Get historical performance data to visualize your portfolio's growth over time:
   * - Total portfolio value at different time points
   * - Performance metrics for various time ranges
   * - Historical Profit/Loss (PnL) data
   *
   * Required:
   * - shareToken: Get this from your CoinStats portfolio page by clicking "Share" and
   * copying the token from the share URL
   *
   * Optional:
   * - type: Specify the time range for the chart data (e.g., "24h", "1w", "1m", "1y")
   *
   * Note: This endpoint is only available for users with a Degen plan subscription.</hr>
   *
   */
  getPortfolioChart(metadata: types.GetPortfolioChartMetadataParam): Promise<FetchResponse<200, types.GetPortfolioChartResponse200>> {
    return this.core.fetch('/portfolio/chart', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         Get a detailed history of all transactions in your portfolio:
   * - Complete list of buy/sell operations
   * - Transaction dates and amounts
   * - Price information at time of transaction
   * - Supports pagination for viewing large transaction sets
   *
   * Required:
   * - shareToken: Get this from your CoinStats portfolio page by clicking "Share" and
   * copying the token from the share URL
   *
   * Optional:
   * - skip & limit: Control the number of transactions per page
   * - currency: Specify the currency for price values
   * - from & to: Filter transactions by date range
   *
   * Note: This endpoint is only available for users with a Degen plan subscription.</hr>
   *
   */
  getPortfolioTransactions(metadata: types.GetPortfolioTransactionsMetadataParam): Promise<FetchResponse<200, types.GetPortfolioTransactionsResponse200>> {
    return this.core.fetch('/portfolio/transactions', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         Add a new transaction to your manual portfolio:
   * - Support for buy, sell, and transfer operations
   * - Automatically updates your portfolio holdings
   * - Validates transaction data before recording
   * - Returns the details of the created transaction
   *
   * Required:
   * - shareToken: Get this from your CoinStats portfolio page
   * - Transaction details in request body:
   *   - coinId: The cryptocurrency's identifier
   *   - count: Amount (negative for sells)
   *   - date: Transaction timestamp (optional)
   *   - price: Price at time of transaction (optional)
   *
   * Optional:
   * - notes: Add personal notes to the transaction
   * - currency: Specify currency for price (default: USD)
   *
   * Note: This endpoint is only available for users with a Degen plan subscription.</hr>
   *
   */
  addPortfolioTransaction(body: types.AddPortfolioTransactionBodyParam, metadata: types.AddPortfolioTransactionMetadataParam): Promise<FetchResponse<200, types.AddPortfolioTransactionResponse200>> {
    return this.core.fetch('/portfolio/transaction', 'post', body, metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         Get a complete list of supported fiat currencies:
   * - Returns all currencies supported by CoinStats
   * - Includes currency codes and exchange rates
   * - Use these currency codes in other API endpoints
   *
   * Example Response:
   * - USD: US Dollar
   * - EUR: Euro
   * - GBP: British Pound
   * - And many more...</hr>
   *
   */
  getCurrencies(): Promise<FetchResponse<200, types.GetCurrenciesResponse200>> {
    return this.core.fetch('/currencies', 'get');
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { AddPortfolioTransactionBodyParam, AddPortfolioTransactionMetadataParam, AddPortfolioTransactionResponse200, ExchangeSyncStatusMetadataParam, ExchangeSyncStatusResponse200, GetBlockchainsResponse200, GetCoinAvgPriceMetadataParam, GetCoinByIdMetadataParam, GetCoinByIdResponse200, GetCoinChartByIdMetadataParam, GetCoinExchangePriceMetadataParam, GetCoinExchangePriceResponse200, GetCoinsMetadataParam, GetCoinsResponse200, GetCurrenciesResponse200, GetExchangeBalanceBodyParam, GetExchangeBalanceResponse200, GetExchangeChartMetadataParam, GetExchangeChartResponse200, GetExchangeSyncStatusMetadataParam, GetExchangeSyncStatusResponse200, GetExchangeTransactionsMetadataParam, GetExchangeTransactionsResponse200, GetExchangesResponse200, GetFiatCurrenciesResponse200, GetMarketCapResponse200, GetNewsByIdMetadataParam, GetNewsByIdResponse200, GetNewsByTypeMetadataParam, GetNewsByTypeResponse200, GetNewsMetadataParam, GetNewsResponse200, GetNewsSourcesResponse200, GetNftCollectionAssetByTokenidMetadataParam, GetNftCollectionAssetByTokenidResponse200, GetNftCollectionAssetsByAddressMetadataParam, GetNftCollectionAssetsByAddressResponse200, GetNftCollectionByAddressMetadataParam, GetNftCollectionByAddressResponse200, GetNftsByWalletMetadataParam, GetNftsByWalletResponse200, GetPortfolioChartMetadataParam, GetPortfolioChartResponse200, GetPortfolioCoinsMetadataParam, GetPortfolioCoinsResponse200, GetPortfolioTransactionsMetadataParam, GetPortfolioTransactionsResponse200, GetTickerExchangesResponse200, GetTickerMarketsMetadataParam, GetTickerMarketsResponse200, GetTrendingNftsMetadataParam, GetTrendingNftsResponse200, GetWalletBalanceMetadataParam, GetWalletBalanceResponse200, GetWalletBalancesMetadataParam, GetWalletBalancesResponse200, GetWalletSyncStatusMetadataParam, GetWalletSyncStatusResponse200, GetWalletTransactionsMetadataParam, GetWalletTransactionsResponse200, TransactionsSyncMetadataParam, TransactionsSyncResponse200, WalletChartMetadataParam, WalletChartResponse200 } from './types';
