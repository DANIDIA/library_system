import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';
import { dbTablesNamesEnum } from '../shared/index.js';
import { emailValidator, phoneNumberValidator } from '../validators/index.js';

export const defaultReadersScheme = Object.freeze({
  body: {
    name: defineSchemeField(schemeFieldTypesEnum.STRING).setMaxLength(30),
    surname: defineSchemeField(schemeFieldTypesEnum.STRING).setMaxLength(40),
    phoneNumber: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMinValue(9)
      .setMaxLength(12)
      .setValidator(phoneNumberValidator),
    email: defineSchemeField(schemeFieldTypesEnum.STRING)
      .setMaxLength(45)
      .setValidator(emailValidator),
    status: defineSchemeField(schemeFieldTypesEnum.BOOL),
  },
});

export const queryReadersScheme = Object.freeze({
  query: {
    name: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    surname: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    phoneNumber: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(
      false
    ),
    email: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    status: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
  },
});

export const accessReaderScheme = Object.freeze({
  params: {
    id: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.READERS
    ),
  },
});

export const returnBookScheme = Object.freeze({
  params: {
    readerID: accessReaderScheme.params.id,
    bookID: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.BOOKS
    ),
  },
});

export const updateReaderScheme = Object.freeze({
  ...accessReaderScheme,
  ...defaultReadersScheme,
});
