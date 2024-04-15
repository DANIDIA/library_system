import { getUserBySession, handleQuery, recordExist } from '../Helpers/index.js';
import { MAX_BOOKS_FOR_READER } from '../Helpers/constants.js';
import { DefaultController } from './defaultController.js';
import sql from 'mysql-bricks';

class BookController extends DefaultController {
    constructor () {
        const fieldsNeededToAdd = ['title', 'author', 'departmentID', 'amount'];
        const updatableFields = ['title', 'author', 'amount'];

        super('books', fieldsNeededToAdd, updatableFields);
    }

    add () {
        return async (req, res) => {
            if (!(await recordExist(req.body.departmentID, 'departments'))) {
                return res.status(400).send('Department not exist');
            }

            await super.add()(req, res);
        };
    }

    get () {
        return async (req, res) => {
            const query = sql.select().from(this._tableName);
            let condition;

            if (req.body.title) { condition = sql.eq('title', req.body.title); }
            if (req.body.author) { condition = sql.and(condition, sql.eq('author', req.body.author)); }
            if (req.body.departmentID) {
                condition = sql.and(condition, sql.eq('departmentID', req.body.departmentID));
            }
            if (req.body.fromRecordID) { condition = sql.and(condition, sql.gte('id', req.body.fromRecordID)); }

            if (condition) { query.where(condition); }

            if (req.body.recordAmount) { query.limit(req.body.recordAmount); }

            const params = query.toParams({ placeholder: '?' });
            const { err, values } = await handleQuery(params);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json(values[0]);
        };
    }

    givenAmount () {
        return async (req, res) => {
            const id = req.body.id;

            const query = sql
                .select(sql('COUNT(id) as givenAmount'))
                .from('givenbooks')
                .where(sql.eq('bookID', id))
                .toParams({ placeholder: '?' });

            const { err, values } = await handleQuery(query);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).json(values[0][0]);
        };
    }

    update () {
        return async (req, res) => {
            if (req.amount < 0) {
                return res.status(400).send('Incorrect amount');
            }

            await super.update()(req, res);
        };
    }

    giveToReader () {
        return async (req, res) => {
            const id = req.body.bookID;
            const readerID = req.body.readerID;
            const user = await getUserBySession(req.body.sessionID);

            if (!(await recordExist(id, 'books'))) {
                return res.status(400).send('Book does not exist');
            }

            if (!(await recordExist(readerID, 'readers'))) {
                return res.status(400).send('Reader does not exist');
            }

            const queryGetBook = sql
                .select()
                .from(this._tableName)
                .where(sql.eq('id', id))
                .toParams({ placeholder: '?' });

            const { err, values } = await handleQuery(queryGetBook);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const book = values[0][0];

            if (book.amount - 1 < 0) {
                return res.status(400).send('No books');
            }

            const queryGetReader = sql
                .select()
                .from('readers')
                .where(sql.eq('id', readerID))
                .toParams({ placeholder: '?' });

            let result = await handleQuery(queryGetReader);

            if (result.err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const reader = result.values[0][0];

            if (reader.booksAmount >= MAX_BOOKS_FOR_READER) {
                return res.status(400).send('Reader has maximum of books');
            }

            const queryChangeBookAmountInDepartment = sql
                .update(this._tableName)
                .set({ amount: book.amount - 1 })
                .toParams({ placeholder: '?' });

            result = await handleQuery(queryChangeBookAmountInDepartment);

            if (result.err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const queryChangeBookAmountThatHasReader = sql
                .update('readers')
                .set({ booksAmount: reader.booksAmount + 1 })
                .toParams({ placeholder: '?' });

            result = await handleQuery(queryChangeBookAmountThatHasReader);

            if (result.err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const queryInsertToGivenBooks = sql
                .insert('givenbooks')
                .values({
                    bookID: id,
                    readerID,
                    employeeID: user.id,
                    departmentID: book.departmentID,
                    dateAndTime: sql('NOW()')
                })
                .toParams({ placeholder: '?' });

            result = await handleQuery(queryInsertToGivenBooks);

            if (result.err) {
                console.log(err);
                return res.status(500).send(err);
            }

            res.status(200).send('ok');
        };
    }

    remove () {
        return async (req, res) => {
            const queryGivenBooks = sql
                .select(sql('COUNT(id) as givenBooks'))
                .from('givenbooks')
                .where(sql.eq('bookID', req.body.id))
                .toParams({ placeholder: '?' });

            const { err, values } = await handleQuery(queryGivenBooks);

            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            const givenBooks = values[0][0].givenBooks;

            if (givenBooks > 0) {
                return res.status(400).send('Not all books returned');
            }

            await super.remove()(req, res);
        };
    }
}

export const bookController = new BookController();
