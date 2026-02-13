import '../css/style.css';

import { login, logout } from './login.ts';
import { displayMap } from './mapbox.ts';
import { updateProfile } from './update-profile.ts';

// helpers
const getInputValue = (id: string) =>
  (document.getElementById(id) as HTMLInputElement).value;

// tour page map
const mapElement = document.getElementById('map');
if (mapElement && mapElement.dataset.locations)
  displayMap(JSON.parse(mapElement.dataset.locations));

// login form
document
  .querySelector('.form--login')
  ?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.querySelector('.btn--login');
    if (button) button.innerHTML = '<span class="spinner"></span>';
    const email = getInputValue('email');
    const password = getInputValue('password');
    await login(email, password);
    if (button) button.innerHTML = 'Login';
  });

// logout button
document.querySelector('.nav__el--logout')?.addEventListener('click', logout);

// update user profile data form
document
  .querySelector('.form-profile-data')
  ?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.querySelector('.btn--update-profile');
    if (button) button.innerHTML = '<span class="spinner"></span>';
    const name = getInputValue('name');
    const email = getInputValue('email');
    await updateProfile({ name, email, type: 'profile' });
    if (button) button.innerHTML = 'Save settings';
  });

// update user password form
const changePasswordForm = document.querySelector<HTMLFormElement>(
  '.form-user-password',
);
changePasswordForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('.btn--change-password');
  if (button) button.innerHTML = '<span class="spinner"></span>';
  const currentPassword = getInputValue('current-password');
  const password = getInputValue('password');
  const passwordConfirm = getInputValue('password-confirm');
  await updateProfile({
    currentPassword,
    password,
    passwordConfirm,
    type: 'password',
  });
  if (button) button.innerHTML = 'Save password';
  changePasswordForm.reset();
});
