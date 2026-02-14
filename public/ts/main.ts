import '../css/style.css';

import { login, logout } from './login.ts';
import { displayMap } from './mapbox.ts';
import { updateProfile } from './update-profile.ts';

// helpers
const getInputValue = (id: string) =>
  (document.getElementById(id) as HTMLInputElement).value;

const getInputFiles = (id: string) =>
  (document.getElementById(id) as HTMLInputElement).files;

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
    const formData = new FormData();
    formData.append('name', getInputValue('name'));
    formData.append('email', getInputValue('email'));
    const files = getInputFiles('upload-profile-photo');
    if (files?.length) formData.append('photo', files[0]);
    await updateProfile(formData, 'profile');
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
  const formData = new FormData();
  formData.append('currentPassword', getInputValue('current-password'));
  formData.append('password', getInputValue('password'));
  formData.append('passwordConfirm', getInputValue('password-confirm'));
  await updateProfile(formData, 'password');
  if (button) button.innerHTML = 'Save password';
  changePasswordForm.reset();
});
