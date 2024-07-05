import { connection, increaseValueBy, queryRecords } from '../helpers/index.js';
import { dbTablesNamesEnum } from '../shared/index.js';
import sql from 'mysql-bricks';

export function getSchemeFields(request, scheme) {
  const result = {};

  const filterRequestObjectEntries = (requestObject, keys) =>
    Object.entries(requestObject).filter((entry) => keys.includes(entry[0]));

  for (const objectName of Object.keys(scheme)) {
    const schemeKeys = Object.keys(scheme[objectName]);

    result[objectName] = Object.fromEntries(
      filterRequestObjectEntries(request[objectName], schemeKeys)
    );
  }

  return result;
}

export function paginateValues(scheme, values) {
  if (
    !Object.hasOwn(scheme.query, 'pageSize') ||
    !Object.hasOwn(scheme.query, 'pageNumber')
  ) {
    return values;
  }

  const pageSize = scheme.query.pageSize;
  const pageNumber = scheme.query.pageNumber;

  return values.slice(pageSize * pageNumber, pageSize * (pageNumber + 1));
}

export async function getReaderByID(id) {
  return (await queryRecords(dbTablesNamesEnum.READERS, { id }))[0];
}

export async function getAmountDetailsOfBookInDepartment(bookID, departmentID) {
  const query = sql
    .select(['totalAmount', 'givenAmount'])
    .from(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS)
    .where(
      sql.and(sql.eq('bookID', bookID), sql.eq('departmentID', departmentID))
    )
    .toParams({ placeholder: '?' });

  return (await connection.query(query.text, query.values))[0][0];
}

export async function changeGivenBook(
  bookID,
  readerID,
  departmentID,
  deltaAmount = 1
) {
  await increaseValueBy(dbTablesNamesEnum.BOOKS, bookID, 'givenAmount', 1);
  await increaseValueBy(
    dbTablesNamesEnum.READERS,
    readerID,
    'gotBooksAmount',
    1
  );
  await increaseValueBy(
    dbTablesNamesEnum.DEPARTMENTS,
    departmentID,
    'givenBooksAmount',
    1
  );

  const query = sql
    .update(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS)
    .set('givenBooks', `givenBooks + ${deltaAmount}`)
    .where(
      sql.and(sql.eq('departmentID', departmentID), sql.eq('bookID', bookID))
    )
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}
