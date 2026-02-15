export function showAlert(
  type: string,
  message: string,
  displayTime: number = 5,
) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body')?.insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, displayTime * 1000);
}

export function hideAlert() {
  const alertElement = document.querySelector('.alert');
  if (alertElement) alertElement.parentElement?.removeChild(alertElement);
}
