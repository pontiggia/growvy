// src/models/assetModel.ts
import { Schema, model } from 'mongoose';
import { IAsset } from '../types/assets';

const assetSchema = new Schema<IAsset>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the asset'],
    },
    symbol: {
      type: String,
      required: [true, 'Please provide a symbol for the asset'],
      unique: true,
      uppercase: true,
    },
    tradingPair: {
      type: String,
      required: [true, 'Please provide a trading pair for the asset'],
    },
    type: {
      type: String,
      required: [true, 'Please specify the type of the asset'],
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Asset = model<IAsset>('Asset', assetSchema);
