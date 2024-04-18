import { DefaultController } from './defaultController.js';
import { connection, handleQuery, recordExist } from '../Helpers/index.js';
import sql from 'mysql-bricks';
import { dbTablesNames } from '../enums/index.js';
import req from 'express/lib/request.js';
import res from 'express/lib/response.js';

export class DepartmentsController extends DefaultController {
    constructor () {
        const searchableFields = ['name', 'address', 'contactNumber', 'actualManagerID'];
        super(dbTablesNames.DEPARTMENTS, searchableFields);
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

    changeData () {
        return async (req, res) => {
            const managerID = req.body.actualManagerID;

            if (managerID && !(await recordExist(managerID, 'department_manager'))) {
                return res.status(404).send('Manager not exist');
            }

            const valuesToChange = {};

            if (req.body.name) valuesToChange.name = req.body.name;
            if (req.body.address) valuesToChange.address = req.body.address;
            if (req.body.contactNumber) valuesToChange.contact_number = req.body.contactNumber;
            if (managerID) valuesToChange.actual_manager = managerID;

            const query = sql.update(this._tableName).set(valuesToChange).toParams({ placeholder: '?' });

            const { err } = handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).send('ok');
        };
    }
}

export const departmentController = new DepartmentsController();
