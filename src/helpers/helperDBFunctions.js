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
  const condition = sql.or(
    IDs.map((id) => ({
      id,
    }))
  );

  const query = sql
    .select('COUNT(id) as recordsAmount')
    .from(tableName)
    .where(condition)
    .toParams({ placeholder: '?' });

  const recordsAmountExist = (await connection(query))[0][0].recordsAmount;

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

export async function hasDublicatedValue(table, field, value) {
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
