import {
  type InferHydratedDocTypeFromSchema,
  model,
  Query,
  Schema,
  Types,
} from 'mongoose';

import { Tour } from './tour-model.ts';

const reviewSchema = new Schema(
  {
    text: {
      type: String,
      minlength: [3, 'Review text should be at least 3 characters long'],
      maxlength: [2000, 'Review text should be less than 2000 characters'],
      trim: true,
      required: [true, 'Please write a review'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating should be greater or equal than 1.0'],
      max: [5, 'Rating should be less or equal than 5.0'],
      required: [true, 'Please rate the tour'],
    },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Please select a tour'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please log in'],
    },
  },
  {
    statics: {
      async calculateAverageRating(tourId: Types.ObjectId) {
        const stats = await this.aggregate([
          { $match: { tour: tourId } },
          {
            $group: {
              _id: '$tour',
              ratingCount: { $sum: 1 },
              averageRating: { $avg: '$rating' },
            },
          },
        ]);
        if (stats.length)
          await Tour.findByIdAndUpdate(tourId, {
            averageRating: stats[0].averageRating,
            ratingCount: stats[0].ratingCount,
          });
        else
          await Tour.findByIdAndUpdate(tourId, {
            averageRating: undefined,
            ratingCount: 0,
          });
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre<ReviewQuery>(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

reviewSchema.post(/^findOneAnd/, async function (result, next) {
  if (result) await Review.calculateAverageRating(result.tour);
  next();
});

reviewSchema.post('save', async function (result, next) {
  await Review.calculateAverageRating(result.tour);
  next();
});

export type ReviewDocument = InferHydratedDocTypeFromSchema<
  typeof reviewSchema
>;
export type ReviewQuery = Query<
  ReviewDocument[] | ReviewDocument | null,
  ReviewDocument
>;
export const Review = model('Review', reviewSchema);
