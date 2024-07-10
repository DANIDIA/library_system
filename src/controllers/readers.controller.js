import sql from 'mysql-bricks';
import {
  changeGivenBook,
  changeRecordData,
  createRecord,
  deleteRecord,
  getBooksResources,
  getReaderByID,
  getUserBySession,
  hasDuplicatedValue,
  queryRecords,
} from '../helpers/index.js';
import { dbTablesNamesEnum, rolesEnum } from '../shared/index.js';
import { getSchemeFields, paginateValues } from './helpers.js';
import {
  defaultReadersScheme,
  queryReadersScheme,
  updateReaderScheme,
} from '../schemas/index.js';
import { readersResourceFields } from './shared/index.js';

export async function createReaderController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, defaultReadersScheme);
    const author = await getUserBySession(req.cookies.sessionID);

    if (
      !(await checkFieldDuplicate(
        'phoneNumber',
        scheme.body.phoneNumber,
        res
      )) ||
      !(await checkFieldDuplicate('email', scheme.body.email, res))
    ) {
      return;
    }

    const id = await createRecord(dbTablesNamesEnum.READERS, {
      ...scheme.body,
      recordAuthorID: author.id,
      additionDate: sql('NOW()'),
    });

    res.status(201).send({ id });
  } catch (e) {
    next(e);
  }
}

export async function returnReaderBookController(req, res, next) {
  try {
    const readerID = req.params.readerID;
    const bookID = req.params.bookID;

    const givenBookRecord = (
      await queryRecords(dbTablesNamesEnum.GIVEN_BOOKS, {
        readerID,
        bookID,
      })
    )[0];

    if (!givenBookRecord) {
      res.statusMessage = `Reader with id '${readerID}' has not a book with id '${bookID}'`;
      return res.status(409).send();
    }

    const author = await getUserBySession(req.cookies.sessionID);
    const departmentReturnTo = givenBookRecord.departmentID;

    if (
      author.role !== rolesEnum.ADMIN &&
      departmentReturnTo !== author.departmentID
    ) {
      res.statusMessage =
        'Book must be returned to department where it was taken';
      return res.status(409).send();
    }

    await changeGivenBook(bookID, readerID, departmentReturnTo, -1);
    await deleteRecord(givenBookRecord.id, dbTablesNamesEnum.GIVEN_BOOKS);

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

export async function queryReadersController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, queryReadersScheme);

    const queryByValues = { ...scheme.query };

    if (Object.hasOwn(queryByValues, 'status')) {
      queryByValues.status = queryByValues.status === 'true';
    }

    const results = await queryRecords(
      dbTablesNamesEnum.READERS,
      queryByValues,
      readersResourceFields
    );

    res.status(200).send({
      allResultsAmount: results.length,
      results: paginateValues(scheme, results),
    });
  } catch (e) {
    next(e);
  }
}

export async function getReaderByIdController(req, res, next) {
  try {
    res
      .status(200)
      .send(await getReaderByID(req.params.id, readersResourceFields));
  } catch (e) {
    next(e);
  }
}

export async function getReaderBooksController(req, res, next) {
  try {
    const givenBooksIDs = (
      await queryRecords(dbTablesNamesEnum.GIVEN_BOOKS, {
        readerID: req.params.id,
      })
    ).map((record) => record.bookID);

    res.status(200).send(await getBooksResources(givenBooksIDs));
  } catch (e) {
    next(e);
  }
}

export async function updateReaderController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, updateReaderScheme);

    const valuesToUpdate = { ...scheme.body };

    if (Object.hasOwn(valuesToUpdate, 'status')) {
      valuesToUpdate.status = valuesToUpdate.status === 'true';
    }

    await changeRecordData(
      scheme.params.id,
      dbTablesNamesEnum.READERS,
      valuesToUpdate
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

export async function deleteReaderController(req, res, next) {
  try {
    const reader = await getReaderByID(req.params.id);

    if (reader.gotBooksAmount > 0) {
      res.statusMessage = `Reader with id '${reader.id}' hasn't return all given books`;
      res.status(409).send();
    }

    await deleteRecord(req.params.id);
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

async function checkFieldDuplicate(field, value, res) {
  if (await hasDuplicatedValue(dbTablesNamesEnum.READERS, field, value)) {
    res.statusMessage = `Value of field '${field}' has duplicate`;
    res.status(409).send();
    return false;
  }

  return true;
}
