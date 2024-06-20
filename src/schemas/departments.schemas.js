import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';
import { dbTablesNamesEnum } from '../shared/index.js';
import { phoneNumberValidator } from '../validators/index.js';
import { defaultPaginationScheme } from './pagination.schemas.js';

export const defaultDepartmentScheme = Object.freeze({
  body: {
    name: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinLength(5)
      .setMaxLength(50),
    address: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinLength(8)
      .setMaxLength(50),
    contactNumber: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinLength(9)
      .setMaxLength(12)
      .setValidator(phoneNumberValidator),
    actualManagerID: defineSchemeField(schemeFieldTypesEnum.NUMBER)
      .setRequired(false)
      .setCheckAsID(dbTablesNamesEnum.EMPLOYEES),
  },
});

export const departmentDataAccessScheme = Object.freeze({
  params: {
    id: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.DEPARTMENTS
    ),
  },
});

export const updateDepartmentScheme = Object.freeze({
  ...defaultDepartmentScheme,
  ...departmentDataAccessScheme,
});

export const queryDepartmentScheme = Object.freeze({
  query: {
    name: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    address: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    contactNumber: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(
      false
    ),
    actualManagerID: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(
      false
    ),
    ...defaultPaginationScheme.query,
  },
});
