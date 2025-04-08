import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { protect, restrictTo, isTransactionOwner } from '../middlewares/auth';

export const transactionRoutes = Router();

transactionRoutes.use(protect);

//transactionRoutes.get('/user', TransactionController.getTransactionsByUser);
transactionRoutes
  .route('/')
  .get(restrictTo('superadmin'), TransactionController.getTransactions)
  .post(TransactionController.createTransaction);

transactionRoutes
  .route('/:id')
  .get(restrictTo('superadmin'), TransactionController.getTransactionById)
  .patch(isTransactionOwner, TransactionController.updateTransaction)
  .delete(isTransactionOwner, TransactionController.deleteTransaction);
