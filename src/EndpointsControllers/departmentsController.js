import { DefaultController } from './defaultController.js';
import { handleQuery, recordExist } from '../Helpers/index.js';
import sql from 'mysql-bricks';
import { dbTablesNames } from '../enums/index.js';

export class DepartmentsController extends DefaultController {
    constructor () {
        super(dbTablesNames.DEPARTMENTS);
    }

    create () {
        return async (req, res) => {
            const managerID = req.body.actualManagerID;

            if (!(await recordExist(managerID, 'department_manager'))) {
                return res.status(404).send('Department manager not exist');
            }

            const query = sql
                .insert(this._tableName, 'name', 'address', 'contact_number', 'actual_manager')
                .values(req.body.name, req.body.address, req.body.contactNumber, managerID)
                .toParams({ placeholder: '?' });

            const { values, err } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json(values[0].insertId);
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
