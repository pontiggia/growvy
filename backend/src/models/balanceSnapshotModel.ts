import { Schema, model } from 'mongoose';
import { BalanceSnapshot } from '../types/snapshot';

const balanceSnapshotSchema = new Schema<BalanceSnapshot>(
  {
    portfolioData: {
      type: Object,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const BalanceSnapshotModel = model<BalanceSnapshot>(
  'BalanceSnapshot',
  balanceSnapshotSchema,
);
