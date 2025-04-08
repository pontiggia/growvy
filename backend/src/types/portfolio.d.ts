// types/portfolio.ts
import { Document, Schema } from 'mongoose';
import { PortfolioAsset } from './assets';

export type PortfolioType = 'crypto' | 'stocks' | 'cash' | 'trading' | 'custom';

export interface IPortfolio extends Document {
  name: string;
  description?: string;
  portfolioAvatar?: string;
  type: PortfolioType;
  walletAddress?: string;
  hasAsset: boolean;
  isMain: boolean;
  ownerId: Schema.Types.ObjectId;
  assets?: PortfolioAsset[];
  syncStatus?: string;
  lastSync?: Date;
  trackerMode: 'manual' | 'wallet' | 'exchange';
  settings?: {
    displayCurrency?: string;
    lastUpdated?: Date;
    notificationPreferences?: {
      priceAlerts?: boolean;
      mobileNotifications?: boolean;
    };
    privacySettings?: {
      isPublic?: boolean;
      showAmounts?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePortfolioDTO {
  name: string;
  description?: string;
  portfolioAvatar?: string;
  type: PortfolioType;
  walletAddress?: string;
  isMain: boolean;
  ownerId: Schema.Types.ObjectId;
  trackerMode: 'manual' | 'wallet' | 'exchange';
  settings?: {
    displayCurrency?: string;
    lastUpdated?: Date;
    notificationPreferences?: {
      priceAlerts?: boolean;
      mobileNotifications?: boolean;
    };
    privacySettings?: {
      isPublic?: boolean;
      showAmounts?: boolean;
    };
  };
}

export interface UpdatePortfolioDTO {
  name: string;
  description?: string;
  portfolioAvatar?: string;
  type: PortfolioType;
  isMain: boolean;
  syncStatus?: string;
  lastSync?: Date;
  settings?: {
    displayCurrency?: string;
    lastUpdated?: Date;
    notificationPreferences?: {
      priceAlerts?: boolean;
      mobileNotifications?: boolean;
    };
    privacySettings?: {
      isPublic?: boolean;
      showAmounts?: boolean;
    };
  };
}
