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

    get () {
        return async (req, res, next) => {
            try {
                await super.get(req, res);
            } catch (e) {
                next(e);
            }
        };
    }

    update () {
        return async (req, res, next) => {
            try {
                this.update(req, res);
            } catch (e) {
                next(e);
            }
        };
    }

    changeStatus () {
        return async (req, res, next) => {
            try {
                const id = req.body.id;

                if (!Object.hasOwn(req.body, 'isActive')) {
                    res.status(400).send('No isActive field');
                }

                if (typeof req.body.isActive !== 'boolean') {
                    res.status(400).send('valid value for isActive field');
                }

                const query = sql
                    .update(this._tableName, { isActive: +res.body.isActive })
                    .where(sql.eq('id', id))
                    .toParams({ placeholder: '?' });

                await connection.query(query.text, query.values);

                res.status(200).send('ok');
            } catch (e) {
                next(e);
            }
        };
    }
}

export const readersController = new ReadersController();
