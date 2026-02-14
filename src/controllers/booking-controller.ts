import Stripe from 'stripe';

import { Booking } from '../models/booking-model.ts';
import { Tour } from '../models/tour-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handler-factory.ts';

export const getCheckoutSession = catchAsync(
  async (request, response, next) => {
    const user = request.user!;
    const tour = await Tour.findById(request.params.tourId);
    if (!tour) return next(new AppError('Tour is not found', 404));
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // url is not secure now
      success_url: `${request.protocol}://${request.get('host')}/?user=${user._id}&tour=${tour._id}&price=${tour.price}`,
      cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
      customer_email: user.email,
      client_reference_id: tour.id,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://natours.dev/img/tours/${tour?.imageCover}`],
            },
            currency: 'usd',
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
    });
    response.status(200).json({ status: 'success', session });
  },
);

export const createBookingCheckout = catchAsync(
  async (request, response, next) => {
    // warn: temporary / unsecure
    const { user, tour, price } = request.query;
    if (!tour || !user || !price) return next();
    await Booking.create({ user, tour, price: +price });
    response.redirect(request.originalUrl.split('?')[0]);
  },
);

export const getBookings = getAll(Booking);
export const getBooking = getOne(Booking);
export const createBooking = createOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
