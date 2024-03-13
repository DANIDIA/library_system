import { connection } from '../Helpers/index.js';

class UserController {
    async login (req, res) {
        const [users] = await connection.query(
            'SELECT id FROM employee_account WHERE login = ? AND password = ?',
            [req.body.login, req.body.password]
        );

        if (users.length === 0) {
            return res.status(400).send('Invalid login or password');
        }

        const userID = users[0].id;

        const [sessions] = await connection.query(
            'SELECT * FROM session WHERE employee_id = ? ORDER BY start DESC LIMIT 1',
            [userID]
        );

        if (sessions[0].end === null) {
            return res.status(500).json('There is an active session');
        }

        const [insertionData] = await connection.query(
            'INSERT INTO session (employee_id, start) values (?, current_timestamp())',
            [userID]
        );

        res.status(200).json({ sessionID: insertionData.insertId });
    }

    async logout (req, res) {
        const sessionID = req.body.sessionID;

        await connection.query(
            'UPDATE session SET end = CURRENT_TIMESTAMP() WHERE id = ?',
            [sessionID]
        );

        res.status(200).send('Logout complete');
    }
}

export const userController = new UserController();
