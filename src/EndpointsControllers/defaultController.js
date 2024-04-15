import { handleQuery } from '../Helpers/index.js';
import sql from 'mysql-bricks';

export class DefaultController {
    constructor (tableName) {
        this._tableName = tableName;
    }
}
