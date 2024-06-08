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

export async function endAllUserSessions(id) {
  const query = sql
    .delete(dbTablesNamesEnum.ACTIVE_SESSIONS)
    .where(sql.eq('employeeID', id))
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}
