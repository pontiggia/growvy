import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  static async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new Error('You are not logged in!');
      }
      const user = await UserService.getUserById(req.user.id);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new Error('You are not logged in!');
      }
      const user = await UserService.updateUser(req.user.id, req.body);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getUsers();
      res.status(200).json({ total: users.length, users });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const user = await UserService.updateUser(id, req.body);
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
