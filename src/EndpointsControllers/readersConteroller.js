import { connection, getUserBySession } from '../Helpers/index.js';
import { accountStatus, dbTablesNames } from '../enums/index.js';
import { DefaultController } from './defaultController.js';
import sql from 'mysql-bricks';

class ReadersController extends DefaultController {
    constructor () {
        const updatableFields = ['name', 'surname', 'phoneNumber', 'email'];
        const searchableFields = ['name', 'surname', 'phoneNumber', 'email'];
        super(dbTablesNames.READERS, updatableFields, searchableFields);
    }

    add () {
        return async (req, res, next) => {
            try {
                const user = await getUserBySession(req.body.sessionID);

                const fields = { name: true, surname: true, phoneNumber: true, email: false };
                const values = this._getValuesFromRequestBody(req.body, fields);

                if (typeof values === 'string') {
                    return res.status(400).send(`Field with name '${values}' is necessary`);
                }

                const query = sql
                    .insert(this._tableName,
                        [...Object.keys(fields), 'booksAmount', 'whoAddID', 'isActive', 'additionDate']
                    )
                    .values([...values, 0, user.id, accountStatus.ACTIVE, 'NOW()'])
                    .toParams({ placeholder: '?' });

                await connection.query(query.text, query.values);

                res.status(200).json('ok');
            } catch (e) {
                next(e);
            }
        };
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

export const readersController = new ReadersController();
