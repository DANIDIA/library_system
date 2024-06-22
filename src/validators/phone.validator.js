import phoneNumberParser from 'libphonenumber-js';

export function phoneNumberValidator(value, response) {
  if (phoneNumberParser(value, 'PL').isValid()) {
    return true;
  }

  response.statusMessage = 'Invalid phone number';
  response.status(400).send();
  return false;
}
