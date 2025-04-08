// src/services/marketDataService.ts
import WebSocket from 'ws';
import EventEmitter from 'events';
import { sendTVMessage, parseTradingViewMessage } from '../utils/socketParser';
import { config } from '../config/config';

export class MarketDataService extends EventEmitter {
  private socket: WebSocket | null = null;
  private sessionId: string = 'qs_snapshoter_basic-symbol-quotes_y8dXFHYaibE0';
  private reconnectDelay: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnectionActive: boolean = false;

  /**
   * Initialize market data connection to TradingView
   */
  public connect(): void {
    if (this.socket) {
      this.disconnect();
    }

    const wsUrl = 'wss://data.tradingview.com/socket.io/websocket';

    this.socket = new WebSocket(wsUrl, {
      origin: 'https://www.tradingview.com',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
        'Sec-Fetch-Dest': 'websocket',
        'Sec-Fetch-Mode': 'websocket',
        'Sec-Fetch-Site': 'same-site',
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Sets up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('open', () => {
      console.log('Market data connection established');
      this.isConnectionActive = true;

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Initialize session with TradingView
      this.initializeSession();

      // Emit connection event
      this.emit('connected');
    });

    this.socket.on('message', (data) => {
      const rawText = data.toString('utf8');
      const frames = parseTradingViewMessage(rawText);

      frames.forEach((frame) => {
        try {
          const json = JSON.parse(frame);

          // Handle quote snapshot data
          if (this.isQuoteData(json)) {
            const symbolData = json.p[1];
            const values = symbolData.v;

            // Skip bid/ask only updates
            if (this.isBidAskOnlyUpdate(values)) {
              return;
            }

            const quoteData = {
              symbol: symbolData.n,
              status: symbolData.s,
              sessionId: json.p[0],
              timestamp: new Date().toISOString(),
              data: values,
            };

            // Emit market data event
            this.emit('marketData', quoteData);
          }
        } catch (err) {
          // Ignore parsing errors for heartbeats and control messages
        }
      });
    });

    this.socket.on('error', (err) => {
      console.error('Market data connection error:', err);
      this.handleDisconnection();
    });

    this.socket.on('close', () => {
      console.log('Market data connection closed');
      this.handleDisconnection();
    });
  }

  /**
   * Initialize session with TradingView
   */
  private initializeSession(): void {
    if (!this.socket || !this.isConnectionActive) return;

    // Authenticate
    sendTVMessage(this.socket, {
      m: 'set_auth_token',
      p: [config.tradingViewJwt],
    });

    // Create quote session
    sendTVMessage(this.socket, {
      m: 'quote_create_session',
      p: [this.sessionId],
    });

    // Set fields to receive
    sendTVMessage(this.socket, {
      m: 'quote_set_fields',
      p: [
        this.sessionId,
        'ch',
        'chp',
        'lp',
        'lp_time',
        'volume',
        'bid',
        'ask',
        'timezone',
        'type',
        'update_mode',
        'ps_status',
        'ps_ticker',
        'ps_code',
        'ps_description',
        'ps_exchange',
        'ps_name',
      ],
    });
  }

  /**
   * Add a symbol to track
   * @param symbol Symbol to track (e.g., 'BINANCE:BTCUSDT')
   */
  public addSymbol(symbol: string): void {
    if (!this.socket || !this.isConnectionActive) {
      console.error('Cannot add symbol: not connected');
      return;
    }

    sendTVMessage(this.socket, {
      m: 'quote_add_symbols',
      p: [this.sessionId, symbol],
    });

    console.log(`Adding symbol: ${symbol}`);
  }

  /**
   * Remove a symbol from tracking
   * @param symbol Symbol to stop tracking (e.g., 'BINANCE:BTCUSDT')
   */
  public removeSymbol(symbol: string): void {
    if (!this.socket || !this.isConnectionActive) {
      console.error('Cannot remove symbol: not connected');
      return;
    }

    sendTVMessage(this.socket, {
      m: 'quote_remove_symbols',
      p: [this.sessionId, symbol],
    });

    console.log(`Removing symbol: ${symbol}`);
  }

  /**
   * Disconnect from TradingView
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.terminate();
      this.socket = null;
    }

    this.isConnectionActive = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Handle disconnection and auto-reconnect
   */
  private handleDisconnection(): void {
    this.isConnectionActive = false;

    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect to market data...');
        this.connect();
      }, this.reconnectDelay);
    }
  }

  /**
   * Check if message is quote data
   * @param json Parsed JSON message
   * @returns True if this is quote data
   */
  private isQuoteData(json: any): boolean {
    return (
      json.m === 'qsd' &&
      Array.isArray(json.p) &&
      json.p.length === 2 &&
      typeof json.p[1] === 'object' &&
      json.p[1].v
    );
  }

  /**
   * Check if update contains only bid/ask (should be filtered)
   * @param values Data values object
   * @returns True if this is a bid/ask-only update
   */
  private isBidAskOnlyUpdate(values: any): boolean {
    return (
      typeof values === 'object' &&
      !Array.isArray(values) &&
      values.bid !== undefined &&
      values.ask !== undefined &&
      values.lp === undefined &&
      values.volume === undefined &&
      values.lp_time === undefined
    );
  }
}
