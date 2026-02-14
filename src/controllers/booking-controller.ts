import Stripe from 'stripe';

import { Tour } from '../models/tour-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const getCheckoutSession = catchAsync(
  async (request, response, next) => {
    const user = request.user!;
    const tour = await Tour.findById(request.params.tourId);
    if (!tour) return next(new AppError('Tour is not found', 404));
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${request.protocol}://${request.get('host')}#success`,
      cancel_url: `${request.protocol}://${request.get('host')}#cancel`,
      customer_email: user.email,
      client_reference_id: request.params.tourId as string,
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
