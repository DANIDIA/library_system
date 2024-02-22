import { accountStatus, connection } from '../Helpers/index.js';

class ReaderController {
    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async create (request, response, user) {
        const [insertionData] = await connection.query(
            'INSERT INTO reader (name, surname, phone_number, who_add_id, addition_time, books_amount, status) VALUES (?, ?, ?, ?, NOW(), 0, ?)',
            [request.body.name, request.body.surname, request.body.phoneNumber, user.id, accountStatus.ACTIVE]
        );

        response.status(200).json(JSON.stringify({ readerID: insertionData.insertId }));
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async getOne (request, response) {
        const readerID = request.body.readerID;

        if (!(await readerExist())) {
            response.status(500).json('No reader with id: ' + readerID);
            return;
        }

        const [readers] = await connection.query(
            'SELECT * FROM reader WHERE id = ?',
            [readerID]
        );

        response.status(200).json(JSON.stringify(readers[0]));
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async getMany (request, response) {
        const fromID = request.body.fromID;
        const amount = request.body.amount;

        const [readers] = await connection.query(
            'SELECT * FROM reader WHERE id >= ? LIMIT ?',
            [fromID, amount]
        );

        response.status(500).json(JSON.stringify(readers));
    }

    /**
     * @param {Request} request
     * @param {Response} response
     * */
    async changeData (request, response) {
        const readerID = request.body.readerID;

        if (!(await readerExist(readerID))) {
            response.status(500).json('No reader with id: ' + readerID);
            return;
        }

        if (!!request.body.name && request.body.name !== '') {
            await connection.query(
                'UPDATE reader SET name = ? WHERE id = ?',
                [request.body.name, readerID]
            );
        }

        if (!!request.body.surname && request.body.surname !== '') {
            await connection.query(
                'UPDATE reader SET surname = ? WHERE id = ?',
                [request.body.surname, readerID]
            );
        }

        if (!!request.body.phoneNumber && request.body.phoneNumber !== '') {
            await connection.query(
                'UPDATE reader SET phone_number = ? WHERE id = ?',
                [request.body.phoneNumber, readerID]
            );
        }

        response.status(200).json('Successfully update');
    }

    /**
     *  @param {Request} request
     *  @param {Response} response
     *
     * */
    async block (request, response) {
        const readerID = request.body.readerID;

        if (!(await readerExist(readerID))) {
            response.status(500).json('No reader with id: ' + readerID);
            return;
        }

        await connection.query(
            'UPDATE reader SET status = ? WHERE id = ?',
            [accountStatus.BLOCKED, readerID]
        );

        response.status(200).json('Reader blocked');
    }

    /**
     *  @param {Request} request
     *  @param {Response} response
     *
     * */
    async unblock (request, response) {
        const readerID = request.body.readerID;

        if (!(await readerExist(readerID))) {
            response.status(500).json('No reader with id: ' + readerID);
            return;
        }

        await connection.query(
            'UPDATE reader SET status = ? WHERE id = ?',
            [accountStatus.ACTIVE, readerID]
        );

        response.status(200).json('Reader unblocked');
    }
}

async function readerExist (readerID) {
    const [readers] = await connection.query(
        'SELECT * FROM reader WHERE id = ?',
        [readerID]
    );
    return readers.length > 0;
}

export const readerController = new ReaderController();
