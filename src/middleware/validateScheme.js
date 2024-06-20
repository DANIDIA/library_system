import { schemeFieldTypesEnum } from '../schemas/shared/schemeFieldTypesEnum.js';
import { allRecordsExist, recordExist } from '../helpers/index.js';

export function validateScheme(scheme) {
  return async (req, res, next) => {
    for (const requestObjectName of Object.keys(scheme)) {
      await checkObjectConfigs(
        res,
        req[requestObjectName],
        scheme[requestObjectName]
      );
    }

    next();
  };
}

async function checkObjectConfigs(res, objectToCheck, schemeConfigs) {
  for (const pair of Object.entries(schemeConfigs)) {
    const fieldName = pair[0];
    const config = pair[1];

    for (const configCheck of RequestFieldConfigsCheckers) {
      if (configCheck[Symbol.toStringTag] === 'AsyncFunction') {
        if (!(await configCheck(res, fieldName, objectToCheck, config))) return;
      }

      if (!configCheck(res, fieldName, objectToCheck, config)) return;
    }
  }
}

const RequestFieldConfigsCheckers = [
  requireConfigCheck,
  typeConfigCheck,
  minValueConfigCheck,
  minMaxLengthConfigCheck,
  checkAsIdConfigCheck,
  validatorConfigCheck,
];

function requireConfigCheck(res, fieldName, body, { required }) {
  if (!Object.hasOwn(body, fieldName) && required) {
    res.statusMessage = `A field '${fieldName}' is required`;
    res.status(400).send();
    return false;
  }

  return true;
}

function typeConfigCheck(res, fieldName, body, { type }) {
  if (!Object.hasOwn(body, fieldName)) return true;

  const fieldValue = body[fieldName];

  if (type === schemeFieldTypesEnum.NUMBER_ARRAY) {
    if (
      !Array.isArray(fieldValue) ||
      !fieldValue.every((value) => typeof value === 'number')
    ) {
      res.statusMessage = `There are non-numeric values in '${fieldName}' array`;
      res.status(400).send();
      return false;
    }
  }

  if (typeof fieldValue !== type) {
    res.statusMessage = `The field '${fieldName}' has invalid type'`;
    res.status(400).send();
    return false;
  }

  return true;
}

function minValueConfigCheck(res, fieldName, body, { type, minValue }) {
  if (!Object.hasOwn(body, fieldName)) return true;

  const fieldValue = body[fieldName];

  if (type === schemeFieldTypesEnum.NUMBER && fieldValue < minValue) {
    res.statusMessage = `Field '${fieldName}' cannot be less than ${minValue}`;
    res.status(400).send();
    return true;
  }

  return true;
}

function minMaxLengthConfigCheck(
  res,
  fieldName,
  body,
  { type, minLength, maxLength }
) {
  if (!Object.hasOwn(body, fieldName)) return true;

  const fieldValue = body[fieldName];

  if (schemeFieldTypesEnum.getSequentialTypes().includes(type)) {
    if (fieldValue.length < minLength) {
      res.statusMessage = `Value in field '${fieldName}' is too short`;
      res.status(400).send();
      return false;
    }
    if (fieldValue.length > maxLength) {
      res.statusMessage = `Value in field '${fieldName}' is too long`;
      res.status(400).send();
      return false;
    }
  }

  return true;
}

async function checkAsIdConfigCheck(res, fieldName, body, { type, checkAsID }) {
  if (!Object.hasOwn(body, fieldName)) return true;

  const fieldValue = body[fieldName];

  if (checkAsID) {
    if (type === schemeFieldTypesEnum.NUMBER_ARRAY) {
      if (!(await allRecordsExist(checkAsID.tableForCheck, ...fieldValue))) {
        res.statusMessage = 'Some IDs/ID in array do not exist';
        res.status(400).send();
        return false;
      }
    }

    if (!(await recordExist(fieldValue, checkAsID.tableForCheck))) {
      res.statusMessage = `ID '${fieldValue}' does not exist`;
      res.status(400).send();
      return false;
    }
  }

  return true;
}

function validatorConfigCheck(res, fieldName, body, { validator }) {
  if (!Object.hasOwn(body, fieldName)) return true;

  const fieldValue = body[fieldName];

  if (validator && !validator(fieldValue, res)) {
    res.statusMessage = `Value of field '${fieldName}' is invalid`;
    res.status(400).send();
    return false;
  }

  return true;
}
