const submitForm = event => {
  event.preventDefault();
  const appName = event.target.appName.value;
  const email = event.target.email.value;

  fetch('/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appName, email })
  })
    .then(response => response.json())
    .then(renderResponse)
    .catch(error => console.log(error));

  appName.value = '';
  email.value = '';
};

const renderResponse = (response) => {
  document.querySelector('#responseDiv').innerHTML += response.token || response.error;
}

document.querySelector('form').addEventListener('submit', submitForm);
