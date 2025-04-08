// src/models/portfolioModel.ts
import { Schema, model } from 'mongoose';
import { IPortfolio } from '../types/portfolio';

export const portfolioSchema = new Schema<IPortfolio>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for your portfolio'],
    },
    description: {
      type: String,
    },
    portfolioAvatar: {
      type: String,
    },
    type: {
      type: String,
      enum: ['crypto', 'stocks', 'cash', 'trading', 'custom'],
      required: [true, 'Please provide a type for your portfolio'],
    },
    walletAddress: {
      type: String,
    },
    hasAsset: {
      type: Boolean,
      default: false,
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an owner for your portfolio'],
    },
    assets: [
      {
        assetData: {
          type: Schema.Types.ObjectId,
          ref: 'Asset',
        },
        amount: Number,
        averageBuyPrice: Number,
      },
    ],
    trackerMode: {
      type: String,
      enum: ['manual', 'wallet', 'exchange'],
      default: 'manual',
    },
    settings: {
      displayCurrency: {
        type: String,
        default: 'USD',
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      notificationPreferences: {
        priceAlerts: {
          type: Boolean,
          default: false,
        },
        mobileNotifications: {
          type: Boolean,
          default: false,
        },
      },
      privacySettings: {
        isPublic: {
          type: Boolean,
          default: false,
        },
        showAmounts: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Portfolio = model<IPortfolio>('Portfolio', portfolioSchema);
