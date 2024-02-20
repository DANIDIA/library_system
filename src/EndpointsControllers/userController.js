export class UserController {
    /**
     * @param {Connection} databaseConnection */
    constructor(databaseConnection) {
        this._dbConnection = databaseConnection;
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    login(request, response){
        this._dbConnection
            .query(`select id from employee_account where login = '${request.body.login}' and password = '${request.body.password} limit 1'`)
            .on('error', (err) => {
                response.status(500).json('Some problems with database');
                console.log(err)
            })
            .on('result', (result => {
                if (result.length === 0){
                    response.status(500).json('No accounts with this login or password');
                    return;
                }
                const empoyeeID = result.id;

                this._dbConnection.query(`select * from session where employee_id = ${empoyeeID} order by start desc limit 1`)
                    .on('error', (err) => {
                        response.status(500).json('Some problems with database');
                        console.log(err)
                    })
                    .on('result', (result) => {
                        const sessionEndTime = result.end;

                        if (result.length > 0 && sessionEndTime === null){
                            response.status(500).json('There is an active session');
                            return;
                        }

                        this._dbConnection.query(`insert into session (employee_id, start) values (${empoyeeID}, current_timestamp())`)
                            .on('error', (err) => {
                                response.status(500).json('some problems with database');
                                console.log(err)
                            })
                            .on('result', (result) => {
                                response.status(200).json(JSON.stringify({sessionID: result.insertId}))
                            })
                    })
            }))

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