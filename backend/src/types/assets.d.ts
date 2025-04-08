// types/assets.ts
import { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  name: string;
  symbol: string;
  tradingPair: string;
  type: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioAsset {
  assetData: Schema.Types.ObjectId;
  amount: number;
  averageBuyPrice: number;
}

export interface CreateAssetDTO {
  name: string;
  symbol: string;
  type: string;
  imageUrl?: string;
}
