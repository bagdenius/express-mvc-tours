import { createHash, randomBytes } from 'node:crypto';

import { compare, hash } from 'bcrypt';
import { model, Schema } from 'mongoose';
import validator from 'validator';

export interface IUser {
  name: string;
  email: string;
  photo: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  confirmPassword?: string;
  passwordChangedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
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
        this.resetPasswordToken = createHash('sha256')
          .update(resetToken)
          .digest('hex');
        this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
        // console.log(resetToken, this.resetPasswordToken);

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

export const User = model<IUser>('User', userSchema);
