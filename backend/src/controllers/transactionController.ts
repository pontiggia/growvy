import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';

export class TransactionController {
  static async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await TransactionService.getTransactions();
      res.status(200).json({ total: transactions.length, transactions });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getTransactionById(req: Request, res: Response) {
    try {
      const transaction = await TransactionService.getTransactionById(
        req.params.id,
      );
      res.status(200).json({ transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getTransactionsByUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Asegúrate de que _id se convierte correctamente a string
      const userId = req.user._id.toString();
      console.log('User ID:', userId);

      const transactions = await TransactionService.getTransactionsByUser(
        userId,
      );
      res.status(200).json({ total: transactions.length, transactions });
    } catch (error: any) {
      console.error('Error in getTransactionsByUser:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async createTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const transaction = await TransactionService.createTransaction(
        req.body,
        userId as string,
      );
      res.status(201).json({ transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTransaction(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const transaction = await TransactionService.updateTransaction(
        id,
        req.body,
      );
      res.status(200).json({ transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteTransaction(req: Request, res: Response) {
    try {
      await TransactionService.deleteTransaction(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
