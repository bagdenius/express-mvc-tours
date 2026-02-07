import { type InferSchemaType, model, Query, Schema } from 'mongoose';
import slugify from 'slugify';

// export interface ITour {
//   name: string;
//   slug: string;
//   duration: number;
//   maxGroupSize: number;
//   difficulty: string;
//   ratingsAverage: number;
//   ratingsQuantity: number;
//   price: number;
//   priceDiscount: number;
//   summary: string;
//   description: string;
//   imageCover: string;
//   images: string[];
//   createdAt: Date;
//   startDates: Date[];
//   secretTour: boolean;
// }

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour should have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name should have less or equal then 40 characters'],
      minlength: [10, 'Tour name should have more or equal then 10 characters'],
    },
    slug: { type: String },
    duration: { type: Number, required: [true, 'Tour should have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour should have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour should have a difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Tour difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'Tour rating must be above 1.0'],
      max: [5, 'Tour rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'Tour should have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (discount: number) {
          return discount < this.price;
        },
        message:
          'Tour price discount ({VALUE}) should be less than regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'Tour should have a description'],
      trim: true,
    },
    description: { type: String, trim: true },
    imageCover: { type: String, required: true, trim: true },
    images: { type: [String] },
    createdAt: { type: Date, default: Date.now() },
    startDates: { type: [Date] },
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
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

tourSchema.pre(/^find/, function (this: Query<Tour, Tour>) {
  this.find({ secretTour: { $ne: true } });
});

tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

type Tour = InferSchemaType<typeof tourSchema>;

export const Tour = model<Tour>('Tour', tourSchema);
