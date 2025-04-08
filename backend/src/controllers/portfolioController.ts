import { Request, Response } from 'express';
import { PortfolioService } from '../services/portfolioService';

export class PortfolioController {
  static async getPortfolios(req: Request, res: Response) {
    try {
      const portfolios = await PortfolioService.getPortfolios();
      res.status(200).json({ total: portfolios.length, portfolios });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPortfolioById(req: Request, res: Response) {
    try {
      const portfolio = await PortfolioService.getPortfolioById(req.params.id);
      res.status(200).json({ portfolio });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPublicPortfolio(req: Request, res: Response) {
    try {
      const portfolio = await PortfolioService.getPublicPortfolio(
        req.params.id,
        req.user?._id as string | undefined,
      );
      res.status(200).json({ portfolio });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createPortfolio(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const portfolio = await PortfolioService.createPortfolio(
        req.body,
        userId as string,
      );
      res.status(201).json({ portfolio });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updatePortfolio(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const portfolio = await PortfolioService.updatePortfolio(id, req.body);
      res.status(200).json({ portfolio });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deletePortfolio(req: Request, res: Response) {
    try {
      await PortfolioService.deletePortfolio(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
