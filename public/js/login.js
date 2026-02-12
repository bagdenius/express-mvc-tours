/* eslint-disable */

const formElement = document.querySelector('.form');

if (formElement) {
  async function login(email, password) {
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
      alert(error.response.data.message);
    }
  }

  formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
