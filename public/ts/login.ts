import axios, { isAxiosError } from 'axios';

import { showAlert } from './alert.ts';

export async function login(email: string, password: string) {
  try {
    const response = await axios({
      method: 'POST',
      url: `http://localhost:8000/api/v1/users/login`,
      data: { email, password },
    });
    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      location.assign('/');
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

export async function logout() {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout',
    });
    if (response.data.status === 'success') location.reload();
  } catch {
    showAlert('error', 'An error occured while logging out. Please try again.');
  }
}
