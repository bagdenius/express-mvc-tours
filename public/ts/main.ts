import '../css/style.css';

import { login, logout } from './login.ts';
import { displayMap } from './mapbox.ts';

// tour page map
const mapElement = document.getElementById('map');
if (mapElement && mapElement.dataset.locations)
  displayMap(JSON.parse(mapElement.dataset.locations));

// login form
document.querySelector('.form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement)
    .value;
  login(email, password);
});

// logout button
document.querySelector('.nav__el--logout')?.addEventListener('click', logout);
