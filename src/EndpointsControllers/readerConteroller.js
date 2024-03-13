import { connection, getUserBySession } from '../Helpers/index.js';
import { accountStatus } from '../enums/index.js';
import { DefaultController } from './defaultController.js';

class ReaderController extends DefaultController {
    constructor () {
        super('reader');
    }

    async create (req, res) {
        const user = await getUserBySession(req.body.sessionID);

        const [insertionData] = await connection.query(
            'INSERT INTO reader (name, surname, phone_number, who_add_id, addition_time, books_amount, status) VALUES (?, ?, ?, ?, NOW(), 0, ?)',
            [req.body.name, req.body.surname, req.body.phoneNumber, user.id, accountStatus.ACTIVE]
        );

        res.status(200).json({ readerID: insertionData.insertId });
    }

    async changeData (req, res) {
        const readerID = req.body.readerID;

        if (req.body.name) {
            await connection.query(
                'UPDATE reader SET name = ? WHERE id = ?',
                [req.body.name, readerID]
            );
        }

        if (req.body.surname) {
            await connection.query(
                'UPDATE reader SET surname = ? WHERE id = ?',
                [req.body.surname, readerID]
            );
        }

        if (req.body.phoneNumber) {
            await connection.query(
                'UPDATE reader SET phone_number = ? WHERE id = ?',
                [req.body.phoneNumber, readerID]
            );
        }

        res.status(200).send('Successfully update');
    }

    async block (req, res) {
        const readerID = req.body.readerID;

        await connection.query(
            'UPDATE reader SET status = ? WHERE id = ?',
            [accountStatus.BLOCKED, readerID]
        );

        res.status(200).send('Reader blocked');
    }

    async unblock (req, res) {
        const readerID = req.body.readerID;

        await connection.query(
            'UPDATE reader SET status = ? WHERE id = ?',
            [accountStatus.ACTIVE, readerID]
        );

        res.status(200).send('Reader unblocked');
    }
}

export const readerController = new ReaderController();
