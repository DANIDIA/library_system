import { DefaultController } from './defaultController.js';
import { accountStatus, dbTablesNames, role } from '../enums/index.js';
import sql from 'mysql-bricks';
import { connection, recordExist } from '../Helpers/index.js';

class UsersController extends DefaultController {
    constructor () {
        const searchableFields = ['name', 'surname', 'role', 'phoneNumber', 'email', 'login', 'departmentID'];
        const updatableFields = ['name', 'surname', 'phoneNumber', 'email', 'login', 'password', 'departmentID'];
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
                    departmentID: true,
                    email: false
                };

                const values = this._getValuesFromRequestBody(req.body, fields);

                if (typeof values === 'string') {
                    return res.status(400).send(`Field with name '${values}' is necessary`);
                }

                if (!(await recordExist(req.body.departmentID, dbTablesNames.DEPARTMENTS))) {
                    return res.status(404).send(`Department with id ${req.body.departmentID} doesn't exist`);
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
                if (Object.hasOwn(req.body, 'departmentID') &&
                    !(await recordExist(req.body.departmentID, dbTablesNames.DEPARTMENTS))) {
                    return res.status(404).send(`Department with id ${req.body.departmentID} doesn't exist`);
                }

                await super.update(req, res);
            } catch (e) {
                next(e);
            }
        };
    }

    changeStatus () {
        return async (req, res, next) => {
            try {
                await super.changeStatus(req, res);
            } catch (e) {
                next(e);
            }
        };
    }
}

export const usersController = new UsersController();
