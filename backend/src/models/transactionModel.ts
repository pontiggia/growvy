import { Schema, model } from 'mongoose';
import { ITransaction } from '../types/transaction';

const transactionSchema = new Schema<ITransaction>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    type: {
      type: String,
      enum: ['buy', 'sell', 'transfer', 'deposit', 'withdrawal'],
      required: [true, 'Please provide a type for the transaction'],
    },
    transactionFrom: {
      type: String,
      enum: ['local', 'external'],
      required: [true, 'Please provide a source for the transaction'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount for the transaction'],
    },
    price: {
      type: Number,
    },
    fees: {
      type: Number,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date for the transaction'],
    },
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: [true, 'Please provide a portfolio for the transaction'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user for the transaction'],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Transaction = model<ITransaction>(
  'Transaction',
  transactionSchema,
);
