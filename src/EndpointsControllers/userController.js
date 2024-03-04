import { authenticate, connection } from '../Helpers/index.js';

class UserController {
    async login (request, response) {
        const [users] = await connection.query(
            'SELECT id FROM employee_account WHERE login = ? AND password = ?',
            [request.body.login, request.body.password]
        );

        if (users.length === 0) {
            response.status(500).json('No account with this login or password');
            return;
        }

        const userID = users[0].id;

        const [sessions] = await connection.query(
            'SELECT * FROM session WHERE employee_id = ? ORDER BY start DESC LIMIT 1',
            [userID]
        );

        if (sessions[0].end === null) {
            response.status(500).json('There is an active session');
            return;
        }

        const [insertionData] = await connection.query(
            'INSERT INTO session (employee_id, start) values (?, current_timestamp())',
            [userID]
        );

        response.status(200).json(JSON.stringify({ sessionID: insertionData.insertId }));
    }

    async logout (request, response) {
        const sessionID = request.body.sessionID;
        await authenticate(sessionID);

        await connection.query(
            'UPDATE session SET end = CURRENT_TIMESTAMP() WHERE id = ?',
            [sessionID]
        );

        response.status(200).json('Logout complete');
    }
}

export const userController = new UserController();
