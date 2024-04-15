import { handleQuery } from '../Helpers/index.js';
import sql from 'mysql-bricks';

export class DefaultController {
    constructor (tableName, fieldsNeededToAdd, updatableFields, searchableFields) {
        this._tableName = tableName;
        this._fieldsNeededToAdd = fieldsNeededToAdd;
        this._updatableFields = updatableFields;
        this._serchableFields = searchableFields;
    }

    add () {
        return async (req, res) => {
            const values = [];

            for (const field in this._fieldsNeededToAdd) {
                if (!Object.hasOwn(req.body, field)) { return res.status(400).send(`No "${field}" field`); }

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

    get () {
        return async (req, res) => {
            let query = sql.select().from(this._tableName);
            let condition;

            for (const field in this._serchableFields) {
                if (Object.hasOwn(req.body, field)) {
                    const fieldEq = sql.eq(field, req.body[field]);

                    condition = condition ? sql.and(condition, fieldEq) : fieldEq;
                }
            }

            if (Object.hasOwn(req.body, 'fromRecordID')) {
                const fromRecordIdGte = sql.gte('fromRecordID', req.body.fromRecordID);

                condition = condition ? sql.and(condition, fromRecordIdGte) : fromRecordIdGte;
            }

            query = condition ? query.where(condition) : query;

            if (Object.hasOwn(req.body, 'recordAmount')) {
                query = query.limit(req.body.recordAmount);
            }

            const params = query.toParams({ placeholder: '?' });
            const { err, values } = await handleQuery(params);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json(values[0]);
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
