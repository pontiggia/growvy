import { Schema, model } from 'mongoose';
import { IUser } from '../types/user';
import bcrypt from 'bcryptjs';
import { getNextSequenceValue } from '../utils/utils';

const userSchema = new Schema<IUser>(
  {
    localId: {
      type: Number,
      unique: true,
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (this: IUser, el: string) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
    },
    nickname: {
      type: String,
      required: [true, 'Please provide your nickname'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      default: 'local',
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre<IUser>('save', async function (NextFunction) {
  if (!this.isModified('password')) {
    return NextFunction();
  }

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  NextFunction();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre<IUser>('save', async function (NextFunction) {
  if (this.isNew) {
    this.localId = await getNextSequenceValue('users');
  }
  NextFunction();
});

export const User = model<IUser>('User', userSchema);
