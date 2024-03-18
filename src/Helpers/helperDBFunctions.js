import { connection } from './database.js';
import { accountStatus, sessionStatus } from '../enums/index.js';
import sql from 'mysql-bricks';

export async function handleQuery ({ text, values }) {
    let _err;
    const [_values] = await (connection.query(text, values)
        .then(data => data)
        .catch(err => {
            _err = err;
        }));

    return { values: _values, err: _err };
}

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

export async function createUserAccount (name, surname, email, phoneNumber, role) {
    // TODO: make login and password generator
    const query = sql
        .insert('employee_account', {
            name,
            surname,
            phone_number: phoneNumber,
            role,
            addition_time: sql('NOW()'),
            login: name + surname,
            password: 'qwerty',
            status: accountStatus.ACTIVE
        })
        .toParams({ placeholder: '?' });

    const { values } = await handleQuery(query);

    return values[0].insertId;
}
