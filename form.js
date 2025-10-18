const pwdPattern = /^(?=(.*[A-Z]){2,})(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{9,}$/;

const form = document.getElementById('pwdForm');
const status = document.getElementById('form-status');
const newpwd = document.getElementById('newpwd');
const confirm = document.getElementById('confirm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.textContent = '';
  status.className = 'status';

  const current = document.getElementById('current').value.trim();
  const newVal = newpwd.value.trim();
  const confirmVal = confirm.value.trim();
  const errors = [];

  if (!current) errors.push('Current password is required.');
  if (!pwdPattern.test(newVal)) errors.push('New password does not meet complexity requirements.');
  if (newVal !== confirmVal) errors.push('New password and confirmation do not match.');

  if (errors.length) {
    status.classList.add('error');
    status.innerHTML = `<strong>Please fix the following:</strong><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
    return;
  }

  status.classList.add('success');
  status.textContent = '✅ Success! Password changed and form submitted.';
});

document.getElementById('changeAddress').addEventListener('click', () => {
  const addr = document.getElementById('address');
  addr.value = '';
  addr.focus();
});
