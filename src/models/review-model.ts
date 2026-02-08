import { type InferHydratedDocTypeFromSchema, model, Schema } from 'mongoose';

const reviewSchema = new Schema(
  {
    text: {
      type: String,
      minlength: [10, 'Review text should be at least 10 characters long'],
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
    author: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please log in'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type ReviewDocument = InferHydratedDocTypeFromSchema<
  typeof reviewSchema
>;
export const Review = model('Review', reviewSchema);
