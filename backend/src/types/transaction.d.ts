import { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  assetId: Schema.Types.ObjectId;
  type: 'buy' | 'sell' | 'transfer' | 'deposit' | 'withdrawal';
  transactionFrom: 'local' | 'external';
  amount: number;
  price?: number;
  fees?: number;
  date: Date;
  direction?: 'incoming' | 'outgoing';
  portfolio: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionDTO {
  assetId: Schema.Types.ObjectId;
  type: 'buy' | 'sell' | 'transfer' | 'deposit' | 'withdrawal';
  transactionFrom: 'local' | 'external';
  amount: number;
  price?: number;
  fees?: number;
  direction?: 'incoming' | 'outgoing';
  portfolio: Schema.Types.ObjectId;
  date: Date;
  notes?: string;
}

export interface UpdateTransactionDTO {
  amount: number;
  price?: number;
  fees?: number;
  direction?: 'incoming' | 'outgoing';
  date: Date;
  notes?: string;
}
