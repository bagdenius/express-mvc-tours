import {
  type InferHydratedDocTypeFromSchema,
  model,
  Query,
  Schema,
} from 'mongoose';

const bookingSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user referenced to this booking'],
  },
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Please provide a tour referenced to this booking'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a total price of this booking'],
  },
  createdAt: { type: Date, default: new Date() },
  isPaid: { type: Boolean, default: true },
});

bookingSchema.pre<BookingQuery>(/^find/, function () {
  this.populate('user', 'name email photo').populate('tour', 'name');
});

export type BookingDocument = InferHydratedDocTypeFromSchema<
  typeof bookingSchema
>;
export type BookingQuery = Query<
  BookingDocument[] | BookingDocument | null,
  BookingDocument
>;
export const Booking = model('Booking', bookingSchema);
