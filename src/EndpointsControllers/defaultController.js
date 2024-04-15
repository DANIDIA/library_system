import { handleQuery } from '../Helpers/index.js';
import sql from 'mysql-bricks';

export class DefaultController {
    constructor (tableName) {
        this._tableName = tableName;
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
