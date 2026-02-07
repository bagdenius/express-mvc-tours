import { createHash, randomBytes } from 'node:crypto';

import { compare, hash } from 'bcrypt';
import { model, Schema, Types } from 'mongoose';
import validator from 'validator';

export interface IUser {
  _id: Types.ObjectId;
  id: string;
  __v: number;
  name: string;
  email: string;
  photo: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  confirmPassword?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  isCorrectPassword(password: string, encrypted: string): Promise<boolean>;
  isPasswordChangedAfter(jwtTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [2, 'Name should be at least 2 characters long'],
      maxlength: [100, 'Name should be less than 100 characters long'],
      required: [true, 'Please enter your name'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'Please enter your email'],
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    photo: { type: String },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      minlength: [8, 'Password should be at least 8 characters'],
      required: [true, 'Please enter a password'],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (confirm: string) {
          return (this as IUser).password === confirm;
        },
        message: 'Passwords should match',
      },
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    methods: {
      isCorrectPassword: async (password: string, encrypted: string) =>
        await compare(password, encrypted),

      isPasswordChangedAfter: function (jwtTimestamp: number) {
        if (this.passwordChangedAt) {
          const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
          return jwtTimestamp < changedTimestamp;
        }
        return false;
      },

      createPasswordResetToken: function () {
        const resetToken = randomBytes(32).toString('hex');
        this.passwordResetToken = createHash('sha256')
          .update(resetToken)
          .digest('hex');
        this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        return resetToken;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

export const User = model<IUser>('User', userSchema);
