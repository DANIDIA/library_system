import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';
import { dbTablesNamesEnum } from '../shared/index.js';
import { defaultPaginationScheme } from './pagination.schemas.js';
import { emailValidator, phoneNumberValidator } from '../validators/index.js';

export const defaultUsersScheme = Object.freeze({
  body: {
    name: defineSchemeField(schemeFieldTypesEnum.STRING).setMaxLength(30),
    surname: defineSchemeField(schemeFieldTypesEnum.STRING).setMaxLength(40),
    role: defineSchemeField(schemeFieldTypesEnum.NUMBER).setCheckAsID(
      dbTablesNamesEnum.ROLES
    ),
    phoneNumber: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinLength(9)
      .setMaxLength(12)
      .setValidator(phoneNumberValidator),
    email: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMaxLength(45)
      .setValidator(emailValidator),
    status: defineSchemeField(schemeFieldTypesEnum.BOOL),
    departmentID: defineSchemeField(
      schemeFieldTypesEnum.NUMBER_OR_NULL
    ).setCheckAsID(dbTablesNamesEnum.DEPARTMENTS),
  },
});

export const accessUserScheme = Object.freeze({
  params: {
    id: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.EMPLOYEES
    ),
  },
});

export const updateUserScheme = Object.freeze({
  ...accessUserScheme,
  body: {
    ...defaultUsersScheme.body,
    login: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinLength(8)
      .setMaxLength(50),
    password: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinLength(8)
      .setMaxLength(20),
  },
});

export const queryUsersScheme = Object.freeze({
  query: {
    name: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    surname: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    role: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    phoneNumber: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(
      false
    ),
    status: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    departmentID: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(
      false
    ),
    ...defaultPaginationScheme.query,
  },
});
