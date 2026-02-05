import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import validator from 'validator';

export interface IUser {
  name: string;
  email: string;
  photo: string;
  password: string;
  confirmPassword: string;
}

const userSchema = new Schema<IUser>({
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
  password: {
    type: String,
    minlength: [8, 'Password should be at least 8 characters'],
    required: [true, 'Please enter a password'],
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
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

export const User = model<IUser>('User', userSchema);
