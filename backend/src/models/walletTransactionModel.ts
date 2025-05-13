import { Schema, model } from 'mongoose';
import { IWalletTransaction } from '../types/transaction';

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: {
      type: String,
      required: [true, 'Please provide a type for the transaction'],
    },
    chain: {
      type: String,
    },
    icon: {
      type: String,
      required: [true, 'Please provide an icon for the transaction'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date for the transaction'],
    },
    symbol: {
      type: String,
      required: [true, 'Please provide a symbol for the transaction'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount for the transaction'],
    },
    fee: {
      type: Number,
      required: [true, 'Please provide a fee for the transaction'],
    },
    hashUrl: {
      type: String,
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
  },
  {
    timestamps: true,
  },
);

export const WalletTransaction = model<IWalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema,
);
