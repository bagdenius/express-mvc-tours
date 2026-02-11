import {
  type InferHydratedDocTypeFromSchema,
  model,
  Query,
  Schema,
} from 'mongoose';
import slugify from 'slugify';

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour should have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name should have less or equal then 40 characters'],
      minlength: [4, 'Tour name should have more or equal then 4 characters'],
    },
    slug: { type: String, unique: true },
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
    averageRating: {
      type: Number,
      min: [1, 'Tour rating must be above 1.0'],
      max: [5, 'Tour rating must be below 5.0'],
      set: (value: number) => Math.round(value * 10) / 10,
    },
    ratingCount: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'Tour should have a price'] },
    discount: {
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
    guides: { type: [{ type: Schema.ObjectId, ref: 'User' }] },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, averageRating: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre<TourQuery>(/^find/, function () {
  this.populate({
    path: 'guides',
    select: 'name email role photo',
  });
});

tourSchema.pre('save', function () {
  this.slug = slugify.default(this.name, { lower: true });
});

tourSchema.pre<TourQuery>(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
});

// tourSchema.pre('aggregate', function () {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// });

export type TourDocument = InferHydratedDocTypeFromSchema<typeof tourSchema>;
export type TourQuery = Query<
  TourDocument[] | TourDocument | null,
  TourDocument
>;
export const Tour = model('Tour', tourSchema);
