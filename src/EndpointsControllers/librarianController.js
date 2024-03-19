import { createUserAccount, getUserBySession, handleQuery, recordExist } from '../Helpers/index.js';
import { role } from '../enums/index.js';
import { DefaultUserController } from './defaultUserController.js';
import sql from 'mysql-bricks';

class LibrarianController extends DefaultUserController {
    constructor () {
        super('librarian');
    }

    create () {
        return async (req, res) => {
            const departmentID = req.body.departmentID;
            const user = await getUserBySession(req.body.sessionID);

            if (!(await recordExist(departmentID, 'department'))) {
                return res.status(404).send('Department not exist');
            }

            const accountID = await createUserAccount(
                req.body.name,
                req.body.surname,
                req.body.email,
                req.body.phoneNumber,
                role.LIBRARIAN
            );

            const query = sql
                .insert(this._tableName)
                .values({
                    employee_account_id: accountID,
                    department_id: departmentID,
                    who_add_id: user.id
                })
                .toParams({ placeholder: '?' });

            const { values, err } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json({ id: values.insertId });
        };
    }

    changeData () {
        return async (req, res) => {
            const departmentID = req.body.departmentID;
            const id = req.body.id;

            if (departmentID && !(await recordExist(departmentID, 'department'))) {
                return res.status(404).send('Department not exist');
            }

            const valuesToChangeUser = {};
            const valuesToChangeUserAccount = {};

            if (departmentID) valuesToChangeUser.department_id = departmentID;
            if (req.body.name) valuesToChangeUserAccount.name = req.body.name;
            if (req.body.surname) valuesToChangeUserAccount.surname = req.body.surname;
            if (req.body.email) valuesToChangeUserAccount.email = req.body.email;
            if (req.body.phoneNumber) valuesToChangeUserAccount.phone_number = req.body.phoneNumber;
            if (req.body.login) valuesToChangeUserAccount.login = req.body.login;
            if (req.body.password) valuesToChangeUserAccount.password = req.body.password;

            if (Object.keys(valuesToChangeUser).length !== 0) {
                const query = sql
                    .update(this._tableName, valuesToChangeUser)
                    .toParams({ placeholder: '?' });

                const { err } = await handleQuery(query);

                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                }
            }

            if (Object.keys(valuesToChangeUserAccount).length !== 0) {
                const query = sql
                    .update(`employee_account JOIN ${this._tableName} ON ${this._tableName}.employee_account_id = employee_account.id`)
                    .set(valuesToChangeUserAccount)
                    .where(sql.eq('librarian.id', id))
                    .toParams({ placeholder: '?' });

                const { err } = await handleQuery(query);

                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                }
            }

            res.status(200).send('ok');
        };
    }
}

export const librarianController = new LibrarianController();
