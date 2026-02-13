import axios, { isAxiosError } from 'axios';

import { showAlert } from './alert.ts';

export async function updateProfile(name: string, email: string) {
  try {
    const response = await axios({
      method: 'PATCH',
      url: '/api/v1/users/update-profile',
      data: { name, email },
    });
    if (response.data.status === 'success') {
      showAlert('success', 'Profile updated!');
      location.reload();
    }
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
