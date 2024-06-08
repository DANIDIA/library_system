import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';

export const startSessionScheme = Object.freeze({
  login: defineSchemeField(schemeFieldTypesEnum.STRING),
  password: defineSchemeField(schemeFieldTypesEnum.STRING),
});
