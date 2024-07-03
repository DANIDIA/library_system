import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';
import { dbTablesNamesEnum } from '../shared/index.js';
import { defaultPaginationScheme } from './pagination.schemas.js';

export const defaultBooksScheme = Object.freeze({
  body: {
    title: defineSchemeField(schemeFieldTypesEnum.STRING).setMaxLength(45),
    authors: defineSchemeField(schemeFieldTypesEnum.NUMBER_ARRAY).setCheckAsID(
      dbTablesNamesEnum.AUTHORS
    ),
  },
});

export const queryBooksScheme = Object.freeze({
  query: {
    title: defineSchemeField(schemeFieldTypesEnum.STRING).setRequired(false),
    authors: defineSchemeField(schemeFieldTypesEnum.STRING_ARRAY).setRequired(
      false
    ),
    ...defaultPaginationScheme.query,
  },
});

export const accessBookScheme = Object.freeze({
  params: {
    id: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.BOOKS
    ),
  },
});

export const giveBookToReaderScheme = Object.freeze({
  params: {
    bookID: accessBookScheme.params.id,
    readerID: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.READERS
    ),
  },
  body: {
    departmentID: defineSchemeField(schemeFieldTypesEnum.NUMBER).setCheckAsID(
      dbTablesNamesEnum.DEPARTMENTS
    ),
  },
});

export const bookAmountDetailsForSingleDepartmentScheme = Object.freeze({
  params: {
    bookID: accessBookScheme.params.id,
    departmentID: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.DEPARTMENTS
    ),
  },
});

export const setBookAmountInDepartmentScheme = Object.freeze({
  params: {
    bookID: accessBookScheme.params.id,
    departmentID: defineSchemeField(schemeFieldTypesEnum.STRING).setCheckAsID(
      dbTablesNamesEnum.DEPARTMENTS
    ),
  },
  body: {
    bookAmount: defineSchemeField(schemeFieldTypesEnum.NUMBER).setMinValue(0),
  },
});

export const updateBookScheme = Object.freeze({
  ...defaultBooksScheme,
  ...accessBookScheme,
});
