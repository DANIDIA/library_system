const sessionStatus = {
    NOT_EXIST: -1,
    IS_ENDED: 0,
    IS_ACTIVE: 1
}

export const role = {
    ADMIN: 1,
    DEPARTMENT_MANAGER: 2,
    LIBRARIAN: 3
}

const accountStatus = {
    BLOCKED: 'BLC',
    ACTIVE: 'ACT'
}

/**
 * @param{string} sessionID
 * */
async function getSessionStatus(sessionID, con){
    const [sessions] = await con.query(
        'SELECT end FROM session WHERE id = ?',
        [sessionID]
    )

    if (sessions.length === 0)
        return sessionStatus.NOT_EXIST;

    if (sessions[0].end != null)
        return sessionStatus.IS_ENDED;

    return sessionStatus.IS_ACTIVE;
}

/**
 * @param{string} sessionID
 * */
async function getUserBySession(sessionID, con){
    const [users] = await con.query(
        'SELECT employee_account.* FROM employee_account INNER JOIN session ON employee_account.id = session.employee_id where session.id = ?',
        [sessionID]
    )

    return users[0];
}

export class ReaderController {
    /**
     * @param {PromiseConnection} databaseConnection
     * */
    constructor(databaseConnection){
        this._dbConnection = databaseConnection;
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * @param {number[]} allowedRoles
     * */
    async create(request, response, allowedRoles){
        try{
            const sessionID = request.body.sessionID;
            const sessionStatus = await getSessionStatus(sessionID, this._dbConnection);

            if (sessionStatus === sessionStatus.IS_ENDED) {
                response.status(500).json('Session is ended');
                return;
            } else if (sessionStatus === sessionStatus.NOT_EXIST) {
                response.status(500).json('Session not exist');
                return;
            }

            const user = await getUserBySession(sessionID, this._dbConnection);

            if (!allowedRoles.includes(user.role)) {
                response.status(500).json('Does not have permission');
                return;
            }

            const [insertionData] = await this._dbConnection.query(
                'INSERT INTO reader (name, surname, phone_number, who_add_id, addition_time, books_amount, status) VALUES (?, ?, ?, ?, NOW(), 0, ?)',
                [request.body.name, request.body.surname, request.body.phoneNumber, user.id, accountStatus.ACTIVE]
            )

            response.status(200).json(JSON.stringify({readerID: insertionData.insertId}))
        }catch (e) {
            response.status(500).json('oops...');
            console.log(e);
        }
    }
}