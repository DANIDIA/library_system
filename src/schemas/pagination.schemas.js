import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';

export const defaultPaginationScheme = Object.freeze({
  query: {
    pageSize: defineSchemeField(schemeFieldTypesEnum.NUMBER)
      .setRequired(false)
      .setMinValue(1),
    pageNumber: defineSchemeField(schemeFieldTypesEnum.NUMBER)
      .setRequired(false)
      .setMinValue(0),
  },
});
