import { schemeFieldTypesEnum } from '../schemas/shared/schemeFieldTypesEnum.js';
import { allRecordsExist, recordExist } from '../helpers/index.js';

export function validateScheme(scheme) {
  return async (req, res, next) => {
    for (const pair of Object.entries(scheme)) {
      const fieldName = pair[0];
      const config = pair[1];

      for (const configCheck of RequestFieldConfigsCheckers) {
        if (configCheck[Symbol.toStringTag] === 'AsyncFunction') {
          if (!(await configCheck(req, fieldName, config))) return;
        }

        if (!configCheck(req, fieldName, config)) return;
      }
    }

    next();
  };
}

const RequestFieldConfigsCheckers = [
  requireConfigCheck,
  typeConfigCheck,
  minMaxLengthConfigCheck,
  checkAsIdConfigCheck,
  validatorConfigCheck,
];

function requireConfigCheck(req, fieldName, { require }) {
  if (!Object.hasOwn(req.body, fieldName) && require) {
    req.statusMessage = `A field '${fieldName}' is required`;
    req.status(400).send();
    return false;
  }

  return true;
}

function typeConfigCheck(req, fieldName, { type }) {
  const fieldValue = req.body[fieldName];

  if (type === schemeFieldTypesEnum.NUMBER_ARRAY) {
    if (
      !Array.isArray(fieldValue) ||
      !fieldValue.every((value) => typeof value === 'number')
    ) {
      req.statusMessage = `There are non-numeric values in '${fieldName}' field`;
      req.status(400).send();
      return false;
    }
  }

  if (typeof fieldValue !== type) {
    req.statusMessage = `The '${fieldName} has invalid type'`;
    req.status(400).send();
    return false;
  }

  return true;
}

function minMaxLengthConfigCheck(
  req,
  fieldName,
  { type, minLength, maxLength }
) {
  const fieldValue = req.body[fieldName];

  if (schemeFieldTypesEnum.getSequentialTypes().includes(type)) {
    if (fieldValue < minLength) {
      req.statusMessage = '';
      req.status().send();
      return false;
    }
    if (fieldValue > maxLength) {
      req.statusMessage = '';
      req.status().send();
      return false;
    }
  }

  return true;
}

async function checkAsIdConfigCheck(req, fieldName, { type, checkAsID }) {
  const fieldValue = req.body[fieldName];

  if (checkAsID) {
    if (type === schemeFieldTypesEnum.NUMBER_ARRAY) {
      if (!(await allRecordsExist(checkAsID.tableForCheck, ...fieldValue))) {
        req.statusMessage = '';
        req.status().send();
        return false;
      }
    }

    if (!(await recordExist(fieldValue, checkAsID.tableForCheck))) {
      req.statusMessage = '';
      req.status().send();
      return false;
    }
  }

  return true;
}

function validatorConfigCheck(req, fieldName, { validator }) {
  const fieldValue = req.body[fieldName];

  if (validator && !validator(fieldValue, req)) {
    req.statusMessage = '';
    req.status().send();
    return false;
  }

  return true;
}
