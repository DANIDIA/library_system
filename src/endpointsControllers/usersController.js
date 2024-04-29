import sql from 'mysql-bricks';
import emailValidator from 'email-validator';
import phone from 'phone';
import passwordGenerator from 'generate-password';
import { DefaultController } from './defaultController.js';
import { accountStatus, dbTablesNames, role } from '../enums/index.js';
import { connection, recordExist } from '../helpers/index.js';

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
                    return res.status(404).send(`Field with name '${values}' is necessary`);
                }

                if (!(await recordExist(req.body.departmentID, dbTablesNames.DEPARTMENTS))) {
                    return res.status(404).send(`Department with id ${req.body.departmentID} doesn't exist`);
                }

                if (!Object.values(role).includes(+req.body.role)) {
                    return res.status(404).send(`Role with id ${req.body.role} doesn't exist`);
                }

                if (!emailValidator.validate(req.body.email)) {
                    return res.status(400).send('Email is incorrect');
                }

                if (!phone.phone(req.body.phoneNumber).isValid) {
                    return res.status(400).send('Phone number is incorrect');
                }

                const login = req.body.name + req.body.surname;
                const password = passwordGenerator.generate({
                    length: 10,
                    numbers: true,
                    uppercase: true,
                    lowercase: true
                });

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

                if (Object.hasOwn(req.body, 'email') && !emailValidator.validate(req.body.email)) {
                    return res.status(400).send('Email is incorrect');
                }

                if (Object.hasOwn(req.body, 'phoneNumber') && !phone(req.body.phoneNumber).isValid) {
                    return res.status(400).send('Phone number is incorrect');
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
