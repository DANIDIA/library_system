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
    logout(request, response){
        const sessionID = request.body.sessionID;

        this._dbConnection.query(`select end from session where id = '${sessionID}'`)
            .on('error', (err) => {
                response.status(500).json('Some problems with database');
                console.log(err)
            })
            .on('result', (result) => {
                if (result.length === 0){
                    response.status(500).json("No session with this id")
                    return;
                }

                const sessionEndTime = result[0].end;

                if (sessionEndTime != null){
                    response.status(500).json("Session is ended");
                    return;
                }

                this._dbConnection.query(`update session set end = current_timestamp() where id = ${sessionID}`)
                    .on('error', (err) => {
                        response.status(500).json('Some problems with database');
                        console.log(err)
                    })
                    .on('result', (result) => {
                        res.status(200).json("You have logout")
                    })
            })
    }
}