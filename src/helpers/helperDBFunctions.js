import sql from 'mysql-bricks';
import { connection } from './database.js';
import { dbTablesNamesEnum, sessionStatusesRole } from '../shared/index.js';

export async function getSessionStatus(sessionID) {
  const query = sql
    .select()
    .from(dbTablesNamesEnum.ACTIVE_SESSIONS)
    .where(sql.eq('id', sessionID))
    .toParams({ placeholder: '?' });

  const [sessions] = await connection.query(query.text, query.values);

  if (sessions.length === 0) {
    return sessionStatusesRole.NOT_EXIST;
  }

  return sessionStatusesRole.IS_ACTIVE;
}

/**
 * @param{string} sessionID
 * */
export async function getUserBySession(sessionID) {
  const query = sql
    .select(sql(`${dbTablesNamesEnum.EMPLOYEES}.*`))
    .from(dbTablesNamesEnum.EMPLOYEES)
    .innerJoin(dbTablesNamesEnum.ACTIVE_SESSIONS, {
      [`${dbTablesNamesEnum.EMPLOYEES}.id`]: `${dbTablesNamesEnum.ACTIVE_SESSIONS}.employeeID`,
    })
    .where(sql.eq(`${dbTablesNamesEnum.ACTIVE_SESSIONS}.id`, sessionID))
    .toParams({ placeholder: '?' });

  const [users] = await connection.query(query.text, query.values);

  return users[0];
}

/**
 * @param{string} recordID
 * @param{string} tableName
 * @return{promise<boolean>}
 * */
export async function recordExist(recordID, tableName) {
  const [records] = await connection.query(
    `SELECT * FROM ${tableName} WHERE id = ?`,
    [recordID]
  );
  return records.length > 0;
}

export async function allRecordsExist(tableName, ...IDs) {
  if (IDs.length === 0) return true;

  let query = sql.select('COUNT(id) as recordsAmount').from(tableName);

  IDs.forEach((id) => {
    query.where(sql.eq('id', id));
  });

  query = query.toParams({ placeholder: '?' });

  const recordsAmountExist = (
    await connection.query(query.text, query.values)
  )[0][0].recordsAmount;

  return recordsAmountExist === IDs.length;
}

export async function endAllUserSessions(id) {
  const query = sql
    .delete(dbTablesNamesEnum.ACTIVE_SESSIONS)
    .where(sql.eq('employeeID', id))
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}

export async function createRecord(table, data) {
  const query = sql.insert(table, data).toParams({ placeholder: '?' });

  return (await connection.query(query.text, query.values))[0].insertId;
}

export async function changeRecordData(id, table, values) {
  const query = sql
    .update(table, values)
    .where(sql.eq('id', id))
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}

export async function queryRecords(table, queryByValues, rowsToSelect = ['*']) {
  let query = sql.select(rowsToSelect).from(table);

  if (Object.entries(queryByValues).length > 0)
    query = query.where(
      sql.and(
        Object.entries(queryByValues).map((pair) => sql.eq(pair[0], pair[1]))
      )
    );

  query = query.toParams({ placeholder: '?' });

  return (await connection.query(query.text, query.values))[0];
}

export async function deleteRecord(id, table) {
  const query = sql
    .delete(table)
    .where(sql.eq('id', id))
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}

export async function hasDuplicatedValue(table, field, value) {
  const query = sql
    .select()
    .from(table)
    .where(sql.eq(field, value))
    .toParams({ placeholder: '?' });

  const resultAmount = (await connection.query(query.text, query.values))[0]
    .length;

  return resultAmount > 0;
}

export async function increaseValueBy(table, id, field, value) {
  const query = sql
    .update(table)
    .set(field, sql(`${field} + ${value}`))
    .where(sql.eq('id', id))
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}

export async function getDepartmentByID(id, fieldsToShow = ['*']) {
  return (
    await queryRecords(dbTablesNamesEnum.DEPARTMENTS, { id }, fieldsToShow)
  )[0];
}

export async function increaseEmployeeAmountByOne(departmentID) {
  await increaseValueBy(
    dbTablesNamesEnum.DEPARTMENTS,
    departmentID,
    'employeesAmount',
    1
  );
}

export async function decreaseEmployeesAmountByOne(departmentID) {
  await increaseValueBy(
    dbTablesNamesEnum.DEPARTMENTS,
    departmentID,
    'employeesAmount',
    -1
  );
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

  return (
    (await connection.query(query.text, query.values))[0][0] || {
      totalAmount: 0,
      givenAmount: 0,
    }
  );
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
    .set('givenAmount', sql(`givenAmount + ${deltaAmount}`))
    .where(
      sql.and(sql.eq('departmentID', departmentID), sql.eq('bookID', bookID))
    )
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}
