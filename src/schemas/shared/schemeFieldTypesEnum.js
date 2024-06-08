export const schemeFieldTypesEnum = Object.freeze({
  NUMBER: 'number',
  STRING: 'string',
  BOOL: 'boolean',
  NUMBER_ARRAY: 'number_array',
  getSequentialTypes: () => [this.STRING, this.NUMBER_ARRAY],
});
