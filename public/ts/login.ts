import axios, { isAxiosError } from 'axios';

export async function login(email: string, password: string) {
  try {
    const response = await axios({
      method: 'POST',
      url: `http://localhost:8000/api/v1/users/login`,
      data: { email, password },
    });
    if (response.data.status === 'success') {
      alert('Logged in successfully!');
      location.assign('/');
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.message);
      const serverMessage = error.response?.data.message;
      if (serverMessage) {
        console.warn(serverMessage);
        alert(serverMessage);
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}
