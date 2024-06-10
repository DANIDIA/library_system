import sql from 'mysql-bricks';
import { connection, getUserBySession, recordExist } from '../helpers/index.js';
import { MAX_BOOKS_FOR_READER } from '../shared/constants.js';
import { accountStatusesEnum, dbTablesNamesEnum } from '../shared/index.js';
import { DefaultController } from './default.controller.js';

class BooksController extends DefaultController {
  constructor() {
    const updatableFields = ['title'];
    const searchableFields = ['title'];

    super(dbTablesNamesEnum.BOOKS, updatableFields, searchableFields);
  }

  add() {
    return async (req, res, next) => {
      try {
        const fields = {
          title: true,
        };
        const values = this._getValuesFromRequestBody(req.body, fields);

        if (typeof values === 'string') {
          return res
            .status(404)
            .send(`Field with name '${values}' is necessary`);
        }

        const query = sql
          .insert(this._tableName, Object.keys(fields))
          .values(values)
          .toParams({ placeholder: '?' });

        await connection.query(query.text, query.values);

        res.status(200).send('ok');
      } catch (e) {
        next(e);
      }
    };
  }

  get() {
    return async (req, res, next) => {
      try {
        await super.get(res, req);
      } catch (e) {
        next(e);
      }
    };
  }

  givenAmount() {
    return async (req, res, next) => {
      try {
        const id = req.query.id;

        const query = sql
          .select('givenBooksAmount')
          .from(this._tableName)
          .where(sql.eq('id', id))
          .toParams({ placeholder: '?' });

        const givenAmount = (
          await connection.query(query.text, query.values)
        )[0][0].givenBooksAmount;

        res.status(200).json(givenAmount);
      } catch (e) {
        next(e);
      }
    };
  }

  update() {
    return async (req, res, next) => {
      try {
        await super.update(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  giveToReader() {
    return async (req, res, next) => {
      try {
        const id = req.body.id;
        const readerID = req.body.readerID;
        const user = await getUserBySession(req.body.sessionID);
        const departmentID = req.body.departmentID;

        if (!(await recordExist(id, this._tableName))) {
          return res.status(404).send(`Book with ID ${id} doesn't exist`);
        }

        if (!(await recordExist(readerID, dbTablesNamesEnum.READERS))) {
          return res
            .status(404)
            .send(`Reader with ID ${readerID} doesn't exist`);
        }

        if (!(await recordExist(departmentID, dbTablesNamesEnum.DEPARTMENTS))) {
          return res.status(404).send(`Department with ID ${id} doesn't exist`);
        }

        const bookAmountInDepartment = await this._getBookAmountFromDepartment(
          id,
          departmentID
        );

        if (bookAmountInDepartment - 1 < 0) {
          return res.status(400).send(`Amount of books with id '${id} is 0'`);
        }

        const reader = await this._getReader(readerID);

        if (reader.booksAmount + 1 > MAX_BOOKS_FOR_READER) {
          return res.status(400).send('Reader has maximum of books');
        }

        if (reader.isAction === accountStatusesEnum.BLOCKED) {
          return res.status(400).send(`Reader with id ${readerID} is blocked`);
        }

        await this._addGivenBookInDepartment(id, departmentID);
        await this._getBookToReader(id, readerID, departmentID, user.id);

        res.status(200).send('ok');
      } catch (e) {
        next(e);
      }
    };
  }

  remove() {
    return async (req, res, next) => {
      try {
        const queryGetBook = sql
          .select()
          .from(this._tableName)
          .where(sql.eq('id', req.body.id))
          .toParams({ placeholder: '?' });

        const book = (
          await connection.query(queryGetBook.text, queryGetBook.values)
        )[0][0];

        if (book.givenBookAmount > 0) {
          return res
            .status(400)
            .send(`Not all of the books with id ${req.body.id}} was returned`);
        }

        const deleteBookFromDepartmentsQuery = sql
          .delete(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS)
          .where('bookID', req.body.id);

        await connection.query(
          deleteBookFromDepartmentsQuery.text,
          deleteBookFromDepartmentsQuery.values
        );

        await super.remove(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  async _getReader(readerID) {
    const query = sql
      .select()
      .from(dbTablesNamesEnum.READERS)
      .where(sql.eq('id', readerID))
      .toParams({ placeholder: '?' });

    return (await connection(query.text, query.values))[0][0];
  }

  async _getBookAmountFromDepartment(bookID, departmentID) {
    const query = sql
      .select()
      .from(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS)
      .where(
        sql.and(sql.eq('bookID', bookID), sql.eq('departmentID', departmentID))
      )
      .toParams({ placeholder: '?' });

    const result = (await connection.query(query.text, query.values))[0];

    return result.length > 0 ? result[0].booksAmount : 0;
  }

  async _addGivenBookInDepartment(bookID, departmentID) {
    const query = sql
      .update([this._tableName, dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS])
      .set('allBooksAmount', sql('allBooksAmount + 1'))
      .set('booksAmount', sql('booksAmount + 1'))
      .where(
        sql.and(
          sql.eq(`${dbTablesNamesEnum}.id`, bookID),
          sql.eq('bookID', bookID),
          sql.eq('departmentID', departmentID)
        )
      )
      .toParams({ placeholder: '?' });

    await connection.query(query.text, query.values);
  }

  async _getBookToReader(bookID, readerID, departmentID, employeeID) {
    const getBookToReader = sql
      .update(dbTablesNamesEnum.READERS)
      .set('booksAmount', sql('booksAmount + 1'))
      .where(sql.eq('id', readerID))
      .toParams({ placeholder: '?' });

    const addHistoryRecord = sql
      .insert(dbTablesNamesEnum.GIVEN_BOOKS)
      .values({
        bookID,
        readerID,
        departmentID,
        employeeID,
        dateAndTime: sql('NOW()'),
      })
      .toParams({ placeholder: '?' });

    await connection.query(getBookToReader.text, getBookToReader.values);
    await connection.query(addHistoryRecord.text, addHistoryRecord.values);
  }
}

export const booksController = new BooksController();
