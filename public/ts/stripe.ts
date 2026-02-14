import axios, { isAxiosError } from 'axios';

import { showAlert } from './alert.ts';

export async function bookTour(tourId: string) {
  try {
    const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    const { session } = response.data;
    window.location.href = session.url;
    showAlert('success', 'Redirecting to Stripe...');
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.message);
      const serverMessage = error.response?.data.message;
      if (serverMessage) {
        console.warn(serverMessage);
        showAlert('error', serverMessage);
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}
