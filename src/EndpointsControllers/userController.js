import { connection, getSessionStatus, sessionStatus } from '../Helpers/index.js';

class UserController {
    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async login (request, response) {
        try {
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
        } catch (e) {
            response.status(500).json('oops...');
            console.log(e);
        }
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async logout (request, response) {
        try {
            const sessionID = request.body.sessionID;
            const status = await getSessionStatus(sessionID);

            if (status === sessionStatus.NOT_EXIST) {
                response.status(500).json('No session with id ' + sessionID);
                return;
            }

            if (status === sessionStatus.IS_ENDED) {
                response.status(500).json('Session has already ended');
                return;
            }

            await connection.query(
                'UPDATE session SET end = CURRENT_TIMESTAMP() WHERE id = ?',
                [sessionID]
            );

            response.status(200).json('Logout complete');
        } catch (e) {
            console.log(e);
            response.status(500).json('oops...');
        }
    }
}

export const userController = new UserController();
