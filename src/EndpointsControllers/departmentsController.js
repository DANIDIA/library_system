import { DefaultController } from './defaultController.js';
import { connection, handleQuery, recordExist } from '../Helpers/index.js';
import sql from 'mysql-bricks';
import { dbTablesNames } from '../enums/index.js';
import req from 'express/lib/request.js';
import res from 'express/lib/response.js';

export class DepartmentsController extends DefaultController {
    constructor () {
        const searchableFields = ['name', 'address', 'contactNumber', 'actualManagerID'];
        const updatableFields = ['name', 'address', 'contactNumber', 'actualManagerID'];
        super(dbTablesNames.DEPARTMENTS, updatableFields, searchableFields);
    }

    add () {
        return async (req, res, next) => {
            try {
                const managerID = req.body.actualManagerID;

                if (Object.hasOwn(req.body, 'actualManagerID') &&
                    !(await recordExist(managerID, dbTablesNames.EMPLOYEES))) {
                    return res.status(404).send(`Department manager with id ${managerID} doesn't exist`);
                }

                const fields = {
                    name: true,
                    address: true,
                    contactNumber: true,
                    actualManagerID: false
                };

                const values = this._getValuesFromRequestBody(req.body, fields);

                if (typeof values === 'string') {
                    return res.status(400).send(`Field with name '${values}' is necessary`);
                }

                const query = sql
                    .insert(this._tableName, Object.keys(fields))
                    .values(values)
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
                const managerID = req.body.actualManagerID;

                if (Object.hasOwn(req.body, 'actualManagerID') &&
                    !(await recordExist(managerID, dbTablesNames.EMPLOYEES))) {
                    return res.status(404).send(`Department manager with id ${managerID} doesn't exist`);
                }

                await super.update(req, res);
            } catch (e) {
                next(e);
            }
        };
    }

    remove () {
        return async (req, res, next) => {
            try {
                const queryGetBooksAmount = sql
                    .select(sql('COUNT(id)'))
                    .from(dbTablesNames.BOOKS)
                    .where(sql.eq('departmentID', req.body.id))
                    .toParams({ placeholder: '?' });

                const booksAmount = (await connection.query(
                    queryGetBooksAmount.text,
                    queryGetBooksAmount.values
                ))[0][0];

                if (booksAmount > 0) {
                    return res.status(400).send(`There are books in department with id ${req.res.id}`);
                }

                const queryGetEmployeesAmount = sql
                    .select(sql('COUNT(id)'))
                    .from(dbTablesNames.EMPLOYEES)
                    .where(sql.eq('departmentID', req.body.id))
                    .toParams({ placeholder: '?' });

                const employeesAmount = (await connection.query(
                    queryGetEmployeesAmount.text,
                    queryGetBooksAmount.values
                ))[0][0];

                if (employeesAmount > 0) {
                    return res.status(400).send(`There are employees in department with id ${req.res.id}`);
                }

                const queryRemove = sql
                    .delete(this._tableName)
                    .where(sql.eq('id', req.body.id))
                    .toParams({ placholder: '?' });

                await connection.query(queryRemove.text, queryRemove.values);

                res.status(200).send('ok');
            } catch (e) {
                next(e);
            }
        };
    }
}

export const departmentController = new DepartmentsController();
