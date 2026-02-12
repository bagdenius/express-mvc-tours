import '../css/style.css';

import { login } from './login.ts';
import { displayMap } from './mapbox.ts';

const mapElement = document.getElementById('map');
if (mapElement && mapElement.dataset.locations)
  displayMap(JSON.parse(mapElement.dataset.locations));

document.querySelector('.form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement)
    .value;
  login(email, password);
});
