export const schemeFieldTypesEnum = Object.freeze({
  NUMBER: 'number',
  NUMBER_OR_NULL: 'number_or_null',
  STRING: 'string',
  BOOL: 'boolean',
  NUMBER_ARRAY: 'number_array',
  STRING_ARRAY: 'string_array',
  getSequentialTypes: function () {
    return [this.STRING, this.NUMBER_ARRAY, this.STRING_ARRAY];
  },
  getNullableTypes: function () {
    return [this.NUMBER_OR_NULL];
  },
});
