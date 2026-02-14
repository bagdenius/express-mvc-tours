import type { UserDocument } from '../models/user-model.ts';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      files?: {
        imageCover?: Multer.File[];
        images?: Multer.File[];
      };
    }
  }
}

export {};
