import sql from 'mysql-bricks';
import { connection } from './database.js';
import { dbTablesNames, sessionStatus } from '../enums/index.js';

/**
 * @param{string} sessionID
 * */
export async function getSessionStatus (sessionID) {
    const [sessions] = await connection.query(
        'SELECT end FROM session WHERE id = ?',
        [sessionID]
    );

    if (sessions.length === 0) { return sessionStatus.NOT_EXIST; }

    if (sessions[0].end != null) { return sessionStatus.IS_ENDED; }

    return sessionStatus.IS_ACTIVE;
}

/**
 * @param{string} sessionID
 * */
export async function getUserBySession (sessionID) {
    const [users] = await connection.query(
        'SELECT employee_account.* FROM employee_account INNER JOIN session ON employee_account.id = session.employee_id where session.id = ?',
        [sessionID]
    );

    return users[0];
}

/**
 * @param{string} recordID
 * @param{string} tableName
 * @return{promise<boolean>}
 * */
export async function recordExist (recordID, tableName) {
    const [records] = await connection.query(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [recordID]
    );
    return records.length > 0;
}

export async function endAllUserSessions (id) {
    const query = sql
        .delete(dbTablesNames.ACTIVE_SESSIONS)
        .where(sql.eq('employeeID', id))
        .toParams({ placeholder: '?' });

    await connection.query(query.text, query.values);
}
