import { connection, endAllUserSessions } from '../Helpers/index.js';
import sql from 'mysql-bricks';
import { accountStatus } from '../enums/index.js';

export class DefaultController {
    constructor (tableName, updatableFields, searchableFields) {
        this._tableName = tableName;
        this._updatableFields = updatableFields;
        this._serchableFields = searchableFields;
    }

    async get (req, res) {
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
        const values = (await connection.query(params.text, params.values))[0];

        res.status(200).json(values);
    }

    async update (req, res) {
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

        await connection.query(query.text, query.values);

        res.status(200).send('ok');
    }

    async changeStatus (req, res) {
        const id = req.body.id;

        if (!Object.hasOwn(req.body, 'isActive')) {
            res.status(400).send('No isActive field');
        }

        if (typeof req.body.isActive !== 'boolean') {
            res.status(400).send('Invalid value for isActive field');
        }

        const isActive = req.body.isActive ? accountStatus.ACTIVE : accountStatus.BLOCKED;

        if (isActive === accountStatus.BLOCKED) {
            await endAllUserSessions(id);
        }

        const query = sql
            .update(this._tableName, { isActive })
            .where(sql.eq('id', id))
            .toParams({ placeholder: '?' });

        await connection.query(query.text, query.values);

        res.status(200).send('ok');
    }

    async remove (req, res) {
        const query = sql
            .delete()
            .from(this._tableName)
            .where(sql.eq('id', req.body.id))
            .toParams({ placeholder: '?' });

        await connection.query(query.text, query.values);

        res.status(200).send('ok');
    }

    /**
     * @param {Object} body
     *  @param {Object} fieldsNames Names of values with specifying is the value necessary (true) or
     *  unnecessary (false)
     *  @return {(string|Array)} Return name of necessary field if it is absent in body and return Array of values if
     *  all of necessary values was in body
     */
    _getValuesFromRequestBody (body, fieldsNames) {
        const result = [];

        for (const name in Object.keys(fieldsNames)) {
            if (fieldsNames[name] || !Object.hasOwn(body, name)) { return name; }

            result.push(body[name]);
        }

        return result;
    }
}
