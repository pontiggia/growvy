import { IUser } from './user'; // Ajusta la ruta según donde tengas definido IUser

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
