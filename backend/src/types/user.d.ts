import { Document } from 'mongoose';

export interface IUser extends Document {
  localId: number;
  email: string;
  phone: string;
  password: string;
  photo: string;
  passwordConfirm: string | undefined;
  firstName: string;
  lastName: string;
  nickname: string;
  role: string;
  verified: boolean;
  authProvider: string;
  createdAt: Date;
  updatedAt: Date;
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  photo: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  nickname: string;
  role: string;
  verified: boolean;
  authProvider: string;
}

export interface UpdateUserDTO {
  photo: string;
  firstName: string;
  lastName: string;
  nickname: string;
}

export interface SignupUser {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  nickname: string;
  photo?: string;
}
