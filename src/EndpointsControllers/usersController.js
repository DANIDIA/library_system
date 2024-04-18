import { DefaultController } from './defaultController.js';
import { accountStatus, dbTablesNames, role } from '../enums/index.js';
import sql from 'mysql-bricks';
import { connection } from '../Helpers/index.js';

class UserController extends DefaultController {
    constructor () {
        const searchableFields = ['name', 'surname', 'role', 'phoneNumber', 'email', 'login'];
        const updatableFields = ['name', 'surname', 'phoneNumber', 'email', 'login', 'password'];
        super(dbTablesNames.EMPLOYEES, updatableFields, searchableFields);
    }

    add () {
        return async (req, res, next) => {
            try {
                const fields = {
                    name: true,
                    surname: true,
                    phoneNumber: true,
                    role: true,
                    email: false
                };

                const values = this._getValuesFromRequestBody(req.body, fields);

                if (typeof values === 'string') {
                    return res.status(400).send(`Field with name '${values}' is necessary`);
                }

                if (!Object.values(role).includes(req.body.role)) {
                    return res.status(400).send(`Role with id ${req.body.role} doesn't exist`);
                }

                const login = req.body.name + req.body.surname;
                const password = '123456';

                const query = sql
                    .insert(this._tableName,
                        [...Object.keys(fields), 'isActive', 'login', 'password', 'additionDate']
                    )
                    .values([...values, accountStatus.ACTIVE, login, password, sql('NOW()')])
                    .toParams({ placeholder: '?' });

                await connection.query(query.text, query.values);

                res.status(200).send('ok');
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
                await super.update(req, res);
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
                    .update(this._tableName,
                        { isActive: req.body.isActive ? accountStatus.ACTIVE : accountStatus.BLOCKED }
                    )
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

export const userController = new UserController();
