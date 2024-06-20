import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';

export const defaultPaginationScheme = Object.freeze({
  query: {
    pageSize: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),

    pageNumber: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(
      false
    ),
  },
});
