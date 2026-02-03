import { model, Schema } from 'mongoose';

// export interface ITour {
//   _id: string;
//   name: string;
//   duration: number;
//   maxGroupSize: number;
//   difficulty: 'easy' | 'medium' | 'difficult';
//   ratingsAverage: number;
//   ratingsQuantity: number;
//   price: number;
//   summary: string;
//   description: string;
//   imageCover: string;
//   images: string[];
//   startDates: string[];
// }

const tourSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: { type: Number, required: [true, 'Tour must have a duration'] },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'Tour must have a difficulty'],
    trim: true,
  },
  ratingsAverage: { type: Number, default: 0 },
  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'Tour must have a price'] },
  priceDiscount: { type: Number },
  summary: {
    type: String,
    required: [true, 'Tour must have a description'],
    trim: true,
  },
  description: { type: String, trim: true },
  imageCover: { type: String, required: true, trim: true },
  images: { type: [String] },
  createdAt: { type: Date, default: Date.now() },
  startDates: { type: [Date] },
});

export const Tour = model('Tour', tourSchema);
