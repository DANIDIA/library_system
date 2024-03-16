import { handleQuery } from '../Helpers/index.js';
import sql from 'mysql-bricks';

export class DefaultController {
    constructor (tableName) {
        this._tableName = tableName;
    }

    getOne () {
        return async (req, res) => {
            const id = req.body.id;
            const query = sql.select()
                .from(this._tableName)
                .where({ id })
                .toParams({ placeholder: '?' });

            const {
                values,
                err
            } = handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            if (values.length === 0) {
                return res.status(404);
            }

            res.status(200).json(values[0]);
        };
    }

    getMany () {
        return async (req, res) => {
            const fromID = req.body.fromID;
            const amount = req.body.amount;

            const query = sql.select()
                .from(this._tableName)
                .where(sql.gte('id', fromID))
                .limit(amount)
                .toParams({ placeholder: '?' });

            const {
                values,
                err
            } = handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500);
            }

            res.status(200).json(values);
        };
    }
}
