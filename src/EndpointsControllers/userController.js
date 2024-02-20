export class UserController {
    /**
     * @param {PromiseConnection} databaseConnection */
    constructor(databaseConnection) {
        this._dbConnection = databaseConnection;
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async login(request, response){
        try {
            const [users] = await this._dbConnection.query(
                'SELECT id FROM employee_account WHERE login = ? AND password = ?',
                [request.body.login, request.body.password]
            );

            if (users.length === 0) {
                response.status(500).json('No account with this login or password')
                return;
            }

            const userID = users[0].id;

            const [sessions] = await this._dbConnection.query(
                'SELECT * FROM session WHERE employee_id = ? ORDER BY start DESC LIMIT 1',
                [userID]
            )

            if (sessions.length > 0 && sessions[0].end === null) {
                response.status(500).json('There is an active session');
                return;
            }

            const [insertionData] = await this._dbConnection.query(
                'INSERT INTO session (employee_id, start) values (?, current_timestamp())',
                [userID]
            )

            response.status(200).json(JSON.stringify({sessionID: insertionData.insertId}));
        } catch (e) {
            response.status(500).json('oops...');
            console.log(e);
        }
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async logout(request, response){
        try{
            const sessionID = request.body.sessionID;

            const [sessions] = await this._dbConnection.query(
                'SELECT end FROM session WHERE id = ?',
                [sessionID]
            );

            if (sessions.length === 0) {
                response.status(500).json('No session with id ' + sessionID)
                return;
            }

            const sessionEndTime = sessions[0].end;

            if (sessionEndTime != null) {
                response.status(500).json("Session is ended");
                return;
            }

            await this._dbConnection.query(
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