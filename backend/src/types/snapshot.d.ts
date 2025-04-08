import { Schema, Document } from 'mongoose';
import { Portfolio } from './portfolio';

export interface BalanceSnapshot extends Document {
  portfolioData: Portfolio;
  balance: number;
}
