import { createHash, randomBytes } from 'node:crypto';

import { compare, hash } from 'bcrypt';
import {
  type HydratedDocumentFromSchema,
  model,
  Query,
  Schema,
} from 'mongoose';
import validator from 'validator';

const userSchema = new Schema(
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
    photo: { type: String, default: 'default.jpg' },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    password: {
      type: String,
      minlength: [8, 'Password should be at least 8 characters'],
      required: [true, 'Please enter a password'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (confirm: string) {
          return this.password === confirm;
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
      isPasswordChangedAfter(jwtTimestamp: number) {
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
    statics: {
      async isCorrectPassword(password: string, encrypted: string) {
        return await compare(password, encrypted);
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await hash(this.password, 12);
  this.passwordConfirm = undefined!;
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.pre<UserQuery>(/^find/, function () {
  this.find({ isActive: { $ne: false } });
});

export type UserDocument = HydratedDocumentFromSchema<typeof userSchema>;
export type UserQuery = Query<
  UserDocument[] | UserDocument | null,
  UserDocument
>;
export const User = model('User', userSchema);
