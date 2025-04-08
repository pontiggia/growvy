import { User } from '../models/userModel';
import { CreateUserDTO, UpdateUserDTO } from '../types/user';
import { AppError } from '../utils/appError';

export class UserService {
  static async getUsers() {
    return User.find().select('-password');
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async createUser({
    nickname,
    email,
    password,
    passwordConfirm,
  }: CreateUserDTO) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('User already exists', 400);
    }

    return User.create({ nickname, email, password, passwordConfirm });
  }

  static async updateUser(
    id: string,
    { nickname, firstName, lastName, photo }: UpdateUserDTO,
  ) {
    await this.getUserById(id);
    const user = await User.findByIdAndUpdate(
      id,
      { nickname, firstName, lastName, photo },
      { new: true },
    );

    return user;
  }

  static async deleteUser(id: string) {
    const user = await this.getUserById(id);

    await user.deleteOne();
  }
}
