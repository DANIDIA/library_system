import emailValidatorLibrary from 'email-validator';

export function emailValidator(value, response) {
  if (emailValidatorLibrary.validate(value)) return true;

  response.statusMessage = 'Email is incorrect';
  response.status(400).send();
  return false;
}
