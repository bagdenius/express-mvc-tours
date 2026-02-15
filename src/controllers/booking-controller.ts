import type { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';

import { Booking } from '../models/booking-model.ts';
import { Tour } from '../models/tour-model.ts';
import { User } from '../models/user-model.ts';
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
      success_url: `${request.protocol}://${request.get('host')}/profile/bookings`,
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

const createBookingCheckout = async (session: Stripe.Checkout.Session) => {
  const user = (await User.findOne({ email: session.customer_email }))!._id;
  const tour = session.client_reference_id!;
  const price = session.line_items!.data[0].amount_total / 100;
  await Booking.create({ user, tour, price });
};

export const webhookCheckoutCompleted = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const signature = request.header('stripe-signature');
  if (!signature)
    return next(new AppError('Stripe signature is not defined', 400));
  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_CHECKOUT_COMPLETED_WEBHOOK_SECRET,
    );
  } catch (error: any) {
    return response.status(400).send(`Webhook error: ${error.message}`);
  }
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);
  response.status(200).json({ received: true });
};

export const getBookings = getAll(Booking);
export const getBooking = getOne(Booking);
export const createBooking = createOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
