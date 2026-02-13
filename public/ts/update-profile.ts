import axios, { isAxiosError } from 'axios';

import { showAlert } from './alert.ts';

type updateProfileParams =
  | { name: string; email: string; type: 'profile' }
  | {
      currentPassword: string;
      password: string;
      passwordConfirm: string;
      type: 'password';
    };

export async function updateProfile(data: updateProfileParams) {
  try {
    const response = await axios({
      method: 'PATCH',
      url:
        data.type === 'password'
          ? '/api/v1/users/change-password'
          : '/api/v1/users/update-profile',
      data,
    });
    if (response.data.status === 'success') {
      showAlert(
        'success',
        `${data.type[0].toUpperCase() + data.type.slice(1)} updated!`,
      );
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
