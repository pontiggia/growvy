import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolioController';
import { protect, restrictTo, isPortfolioOwner } from '../middlewares/auth';

export const portfolioRoutes = Router();

portfolioRoutes.use(protect);

portfolioRoutes
  .route('/')
  .get(restrictTo('superadmin'), PortfolioController.getPortfolios)
  .post(PortfolioController.createPortfolio);

portfolioRoutes
  .route('/:id')
  .get(isPortfolioOwner, PortfolioController.getPortfolioById)
  .patch(isPortfolioOwner, PortfolioController.updatePortfolio)
  .delete(isPortfolioOwner, PortfolioController.deletePortfolio);

portfolioRoutes.get('/public/:id', PortfolioController.getPublicPortfolio);
