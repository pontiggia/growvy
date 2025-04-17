import { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  assetId: Schema.Types.ObjectId;
  type: 'buy' | 'sell' | 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  price?: number;
  fees?: number;
  date: Date;
  portfolio: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionDTO {
  assetId: Schema.Types.ObjectId;
  type: 'buy' | 'sell' | 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  price?: number;
  fees?: number;
  portfolio: Schema.Types.ObjectId;
  date: Date;
  notes?: string;
}

export interface UpdateTransactionDTO {
  amount: number;
  price?: number;
  fees?: number;
  date: Date;
  notes?: string;
}

export interface IWalletTransaction extends Document {
  type: 'Sent' | 'Received' | 'Trade';
  chain?: string;
  icon: string;
  date: Date;
  symbol: string;
  amount: number;
  fee: number;
  hashUrl?: string;
  portfolio: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}
