// src/server.ts
import { app } from './app';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { config } from './config/config';
import http from 'http';
import { MarketDataService } from './utils/marketDataService';

// Connect to MongoDB
const DB = config.databaseUrl.replace('<PASSWORD>', config.databasePassword);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.log(err);
  });

// Create HTTP server
const PORT = config.port;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server);

// Initialize market data service
const marketDataService = new MarketDataService();

// Set up default symbols when connected
marketDataService.on('connected', () => {
  // Track popular cryptocurrencies and stocks
  const defaultSymbols = [
    'BINANCE:BTCUSDT',
    // 'BINANCE:ETHUSDT',
    // 'NASDAQ:GOOGL',
    // 'NASDAQ:AAPL',
    // 'NASDAQ:MSFT',
  ];

  defaultSymbols.forEach((symbol) => {
    marketDataService.addSymbol(symbol);
  });
});

// Forward market data to connected clients
marketDataService.on('marketData', (data) => {
  // Emit to all connected clients
  io.emit('marketData', data);

  // Log for monitoring
  const { symbol, data: values } = data;
  //console.log(data);
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle client requests to add symbols
  socket.on('addSymbol', (symbol) => {
    marketDataService.addSymbol(symbol);
  });

  // Handle client requests to remove symbols
  socket.on('removeSymbol', (symbol) => {
    marketDataService.removeSymbol(symbol);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to market data service
marketDataService.connect();

// Start HTTP server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  marketDataService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
