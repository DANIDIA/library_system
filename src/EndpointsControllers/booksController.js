import { connection, getUserBySession, recordExist } from '../Helpers/index.js';
import { MAX_BOOKS_FOR_READER } from '../Helpers/constants.js';
import { DefaultController } from './defaultController.js';
import sql from 'mysql-bricks';
import { dbTablesNames } from '../enums/index.js';

class BooksController extends DefaultController {
    constructor () {
        const fieldsNeededToAdd = ['title', 'author', 'departmentID', 'amount'];
        const updatableFields = ['title', 'author', 'amount'];
        const searchableFields = ['title', 'author', 'departmentID'];

        super(dbTablesNames.BOOKS, fieldsNeededToAdd, updatableFields, searchableFields);
    }

    add () {
        return async (req, res, next) => {
            try {
                if (!(await recordExist(req.body.departmentID, dbTablesNames.DEPARTMENTS))) {
                    return res.status(400).send('Department not exist');
                }

                await super.add()(req, res);
            } catch (e) {
                next(e);
            }
        };
    }

    get () {
        return async (req, res, next) => {
            try {
                await super.get(res, req);
            } catch (e) {
                next(e);
            }
        };
    }

    givenAmount () {
        return async (req, res, next) => {
            try {
                const id = req.body.id;

                const query = sql
                    .select(sql('COUNT(id) as givenAmount'))
                    .from('givenbooks')
                    .where(sql.eq('bookID', id))
                    .toParams({ placeholder: '?' });

                const givenAmount = (await connection.query(query.text, query.values))[0][0];

                res.status(200).json(givenAmount);
            } catch (e) {
                next(e);
            }
        };
    }

    update () {
        return async (req, res, next) => {
            try {
                if (req.amount < 0) {
                    return res.status(400).send('Incorrect amount');
                }

                await super.update()(req, res);
            } catch (e) {
                next(e);
            }
        };
    }

    giveToReader () {
        return async (req, res, next) => {
            try {
                const id = req.body.bookID;
                const readerID = req.body.readerID;
                const user = await getUserBySession(req.body.sessionID);

                if (!(await recordExist(id, this._tableName))) {
                    return res.status(400).send('Book does not exist');
                }

                if (!(await recordExist(readerID, dbTablesNames.READERS))) {
                    return res.status(400).send('Reader does not exist');
                }

                const queryGetBook = sql
                    .select()
                    .from(this._tableName)
                    .where(sql.eq('id', id))
                    .toParams({ placeholder: '?' });

                const book = (await connection.query(queryGetBook.text, queryGetBook.values))[0][0];

                if (book.amount - 1 < 0) {
                    return res.status(400).send('No books');
                }

                const queryGetReader = sql
                    .select()
                    .from(dbTablesNames.READERS)
                    .where(sql.eq('id', readerID))
                    .toParams({ placeholder: '?' });

                const reader = (await connection.query(queryGetReader.text, queryGetReader.values)[0][0]);

                if (reader.booksAmount >= MAX_BOOKS_FOR_READER) {
                    return res.status(400).send('Reader has maximum of books');
                }

                const queryChangeBookAmountInDepartment = sql
                    .update(this._tableName)
                    .set({ amount: book.amount - 1 })
                    .toParams({ placeholder: '?' });

                await connection.query(queryChangeBookAmountInDepartment.text, queryChangeBookAmountInDepartment.values);

                const queryChangeBookAmountThatHasReader = sql
                    .update(dbTablesNames.READERS)
                    .set({ booksAmount: reader.booksAmount + 1 })
                    .toParams({ placeholder: '?' });

                await connection.query(queryChangeBookAmountThatHasReader.text, queryChangeBookAmountThatHasReader.values);

                const queryInsertToGivenBooks = sql
                    .insert(dbTablesNames.GIVEN_BOOKS)
                    .values({
                        bookID: id,
                        readerID,
                        employeeID: user.id,
                        departmentID: book.departmentID,
                        dateAndTime: sql('NOW()')
                    })
                    .toParams({ placeholder: '?' });

                await connection.query(queryInsertToGivenBooks.text, queryInsertToGivenBooks.values);

                res.status(200).send('ok');
            } catch (e) {
                next(e);
            }
        };
    }

    remove () {
        return async (req, res, next) => {
            try {
                const queryGivenBooks = sql
                    .select(sql('COUNT(id) as givenBooks'))
                    .from(dbTablesNames.GIVEN_BOOKS)
                    .where(sql.eq('bookID', req.body.id))
                    .toParams({ placeholder: '?' });

                const givenBooks = (await connection.query(queryGivenBooks.text, queryGivenBooks.values))[0][0];

                if (givenBooks > 0) {
                    return res.status(400).send('Not all books returned');
                }

                await super.remove()(req, res);
            } catch (e) {
                next(e);
            }
        };
    }
}

export const booksController = new BooksController();
