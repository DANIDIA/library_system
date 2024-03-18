import sql from 'mysql-bricks';
import { handleQuery } from '../Helpers/index.js';

export class DefaultUserController {
    constructor (tableName) {
        this._tableName = tableName;
    }

    getOne () {
        return async (req, res) => {
            const id = req.body.id;

            const query = sql
                .select(`${this._tableName}.*, name, surname, phone_number, email, role, status, addition_time, login, password`)
                .from('employee_account')
                .join(this._tableName, { 'employee_account.id': 'employee_account_id' })
                .where(sql.eq(`${this._tableName}.id`, id))
                .toParams({ placeholder: '?' });

            const { values, err } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json(values[0]);
        };
    }

    getMany () {
        return async (req, res) => {
            const fromID = req.body.fromID;
            const amount = req.body.amount;

            const query = sql
                .select(`${this._tableName}.*, name, surname, phone_number, email, role, status, addition_time, login, password`)
                .from('employee_account')
                .join(this._tableName, { 'employee_account.id': 'employee_account_id' })
                .where(sql.gte(`${this._tableName}.id`, fromID))
                .limit(amount)
                .toParams({ placeholder: '?' });

            const { values, err } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json(values);
        };
    }

    changeStatus (status) {
        return async (req, res) => {
            const id = req.body.id;

            const query = sql
                .update(this._tableName, { status })
                .where(sql.eq('id', id))
                .toParams({ placeholder: '?' });

            const { err } = handleQuery(query);

            if (err) {
                console.log(err);
                res.status(500).send(err);
            }

            res.status(200).send('ok');
        };
    }
}
