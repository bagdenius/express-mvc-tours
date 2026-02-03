import { model, Schema } from 'mongoose';
import slugify from 'slugify';

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

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: { type: String },
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
    secretTour: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function () {
  this.slug = slugify.default(this.name, { lower: true });
});

tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
});

tourSchema.post(/^find/, function (result, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

export const Tour = model('Tour', tourSchema);
