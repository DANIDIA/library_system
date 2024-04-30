import sql from 'mysql-bricks';
import { connection, getUserBySession } from '../helpers/index.js';
import { accountStatus, dbTablesNames } from '../enums/index.js';
import { DefaultController } from './defaultController.js';
import {
  validateEmail,
  validatePhoneNumber,
} from '../helpers/contactDetailsValidators.js';

class ReadersController extends DefaultController {
  constructor() {
    const updatableFields = ['name', 'surname', 'phoneNumber', 'email'];
    const searchableFields = ['name', 'surname', 'phoneNumber', 'email'];
    super(dbTablesNames.READERS, updatableFields, searchableFields);
  }

  add() {
    return async (req, res, next) => {
      try {
        const user = await getUserBySession(req.body.sessionID);

        const fields = {
          name: true,
          surname: true,
          phoneNumber: true,
          email: false,
        };
        const values = this._getValuesFromRequestBody(req.body, fields);

        if (typeof values === 'string') {
          return res
            .status(404)
            .send(`Field with name '${values}' is necessary`);
        }

        if (validateEmail(req, res) || validatePhoneNumber(req, res)) {
          return;
        }

        const query = sql
          .insert(this._tableName, [
            ...Object.keys(fields),
            'booksAmount',
            'whoAddID',
            'isActive',
            'additionDate',
          ])
          .values([...values, 0, user.id, accountStatus.ACTIVE, sql('NOW()')])
          .toParams({ placeholder: '?' });

        await connection.query(query.text, query.values);

        res.status(200).json('ok');
      } catch (e) {
        next(e);
      }
    };
  }

  get() {
    return async (req, res, next) => {
      try {
        await super.get(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  update() {
    return async (req, res, next) => {
      try {
        if (validateEmail(req, res) || validatePhoneNumber(req, res)) {
          return;
        }

        await super.update(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  returnBook() {
    return async (req, res, next) => {
      try {
        const id = req.body.id;
        const bookID = req.body.bookID;

        const queryGetHistory = sql
          .select()
          .from(dbTablesNames.GIVEN_BOOKS)
          .where(sql.and(sql.eq('readerID', id), sql.eq('bookID', bookID)))
          .toParams({ placeholder: '?' });

        const historyRecords = (
          await connection.query(queryGetHistory.text, queryGetHistory.values)
        )[0];

        if (historyRecords.length <= 0) {
          return res
            .status(400)
            .send(`Reader with id ${id} hasn't a book with id ${bookID}`);
        }

        const queryChangeReaderBooksAmount = sql
          .update(this._tableName)
          .set('booksAmount', sql('booksAmount - 1'))
          .where(sql.eq('id', id))
          .toParams({ placeholder: '?' });

        await connection.query(
          queryChangeReaderBooksAmount.text,
          queryChangeReaderBooksAmount.values
        );

        const queryChangeBooksAmount = sql
          .update(dbTablesNames.BOOKS)
          .set('amount', sql('amount + 1'))
          .where(sql.eq('id', bookID))
          .toParams({ placeholder: '?' });

        await connection.query(
          queryChangeBooksAmount.text,
          queryChangeBooksAmount.values
        );

        const deleteHistoryRecord = sql
          .delete(dbTablesNames.GIVEN_BOOKS)
          .where(sql.eq('id', historyRecords[0].id))
          .toParams({ placeholder: '?' });

        await connection.query(
          deleteHistoryRecord.text,
          deleteHistoryRecord.values
        );

        res.status(200).send('ok');
      } catch (e) {
        next(e);
      }
    };
  }

  changeStatus() {
    return async (req, res, next) => {
      try {
        await super.changeStatus(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  remove() {
    return async (req, res, next) => {
      try {
        const query = sql
          .select(sql('COUNT(id) as gotBooks'))
          .from(dbTablesNames.GIVEN_BOOKS)
          .where(sql.eq('readerID', req.body.id))
          .toParams({ placeholder: '?' });

        const gotBooks = (
          await connection.query(query.text, query.values)
        )[0][0];

        if (gotBooks > 0) {
          return res
            .status(400)
            .send(`Reader with id ${req.body.id} didn't return all books`);
        }

        await super.remove(req, res);
      } catch (e) {
        next(e);
      }
    };
  }
}

export const readersController = new ReadersController();
