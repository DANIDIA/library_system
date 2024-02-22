import mysql from 'mysql2';
import { sessionStatus } from '../enums/index.js';
import dotenv from 'dotenv';

dotenv.config();

export const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

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
