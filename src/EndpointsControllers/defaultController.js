import { handleQuery } from '../Helpers/index.js';
import sql from 'mysql-bricks';

export class DefaultController {
    constructor (tableName, fieldsNeededToAdd, updatableFields) {
        this._tableName = tableName;
        this._fieldsNeededToAdd = fieldsNeededToAdd;
        this._updatableFields = updatableFields;
    }

    add () {
        return async (req, res) => {
            const values = [];

            for (const field in this._fieldsNeededToAdd) {
                if (!Object.keys(req.body).includes(field)) { return res.status(400).send(`No "${field}" field`); }

                values.push(req.body[field]);
            }

            const query = sql
                .insert(this._tableName, this._fieldsNeededToAdd)
                .values(values)
                .toParams({ placeholder: '?' });

            const { err } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).send('ok');
        };
    }

    update () {
        return async (req, res) => {
            const id = req.body.id;
            const valuesToChange = {};

            for (const field in this._updatableFields) {
                if (Object.hasOwn(req.body, field)) { valuesToChange[field] = req.body[field]; }
            }

            const query = sql
                .update(this._tableName)
                .set(valuesToChange)
                .where(sql.eq('id', id))
                .toParams({ placeholder: '?' });

            const { err } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).send('ok');
        };
    }

    remove () {
        return async (req, res) => {
            const queryRemoveBook = sql
                .delete()
                .from(this._tableName)
                .where(sql.eq('id', req.body.id));

            const result = await handleQuery(queryRemoveBook);

            if (result.err) {
                console.log(result.err);
                return res.status(500).send(result.err);
            }

            res.status(200).send('ok');
        };
    }
}
