import axios, { isAxiosError } from 'axios';

import { showAlert } from './alert.ts';

export async function updateProfile(
  data: FormData,
  type: 'profile' | 'password' = 'profile',
) {
  try {
    const response = await axios({
      method: 'PATCH',
      url:
        type === 'password'
          ? '/api/v1/users/change-password'
          : '/api/v1/users/update-profile',
      data,
    });
    if (response.data.status === 'success') {
      showAlert('success', `${type[0].toUpperCase() + type.slice(1)} updated!`);
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
