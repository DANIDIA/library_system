import emailValidator from 'email-validator';
import phoneValidator from 'phone';

const CONFIG = {
  email: {
    fieldName: 'email',
    errorMessage: 'Email is incorrect',
    validator: emailValidator,
  },
  phoneNumber: {
    fieldName: 'phoneNumber',
    errorMessage: 'Phone number is incorrect',
    validator: phoneValidator,
  },
};

const validateContactDetails = (contactDetail, req, res) => {
  const { fieldName, errorMessage, validator } = CONFIG[contactDetail];

  if (
    Object.hasOwn(req.body, fieldName) &&
    !validator.validate(req.body[fieldName])
  ) {
    return res.status(400).send(errorMessage);
  }
};

export const validateEmail = (req, res) =>
  validateContactDetails('email', req, res);
export const validatePhoneNumber = (req, res) =>
  validateContactDetails('phoneNumber', req, res);
