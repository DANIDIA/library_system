import sql from 'mysql-bricks';
import {
  changeGivenBook,
  changeRecordData,
  connection,
  createRecord,
  deleteRecord,
  getAmountDetailsOfBookInDepartment,
  getReaderByID,
  getUserBySession,
  increaseValueBy,
  queryRecords,
} from '../helpers/index.js';
import { MAX_BOOKS_FOR_READER } from '../shared/constants.js';
import { accountStatusesEnum, dbTablesNamesEnum } from '../shared/index.js';
import { getSchemeFields, paginateValues } from './helpers.js';
import {
  defaultBooksScheme,
  giveBookToReaderScheme,
  queryBooksScheme,
  setBookAmountInDepartmentScheme,
  updateBookScheme,
} from '../schemas/index.js';

export async function createBookController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, defaultBooksScheme);

    const bookID = await createRecord(dbTablesNamesEnum.BOOKS, {
      title: scheme.body.title,
    });

    await addBookAuthors(bookID, scheme.body.authorsIDs);

    res.status(201).send();
  } catch (e) {
    next(e);
  }
}

export async function giveBookToReaderController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, giveBookToReaderScheme);

    const bookID = scheme.params.bookID;
    const readerID = scheme.params.readerID;
    const departmentID = scheme.body.departmentID;

    if ((await getBookAmountInDepartment(bookID, departmentID)) <= 0) {
      res.statusMessage = 'There are not books to give in department';
      return res.status(409).send();
    }

    const reader = await getReaderByID(readerID);

    if (reader.status === accountStatusesEnum.BLOCKED) {
      res.statusMessage = `Reader with id '${scheme.params.readerID}' is blocked`;
      return res.status(409).send();
    }

    if (reader.gotBooksAmount >= MAX_BOOKS_FOR_READER) {
      res.statusMessage = `Reader with id '${scheme.params.readerID}' has maximum amount of books`;
      return res.status(409).send();
    }

    const authorID = (await getUserBySession(req.cookies.sessionID)).id;

    await changeGivenBook(bookID, readerID, departmentID);
    await createRecord(dbTablesNamesEnum.GIVEN_BOOKS, {
      bookID,
      readerID,
      departmentID,
      recordAuthorID: authorID,
      giveDateTime: sql('NOW()'),
    });

    return res.status(200).send();
  } catch (e) {
    next(e);
  }
}

export async function queryBooksController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, queryBooksScheme);
    const authorsIDs = scheme.query.authorsIDs;

    if (authorsIDs && !Array.isArray(authorsIDs)) {
      scheme.query.authorsIDs = [authorsIDs];
    }

    return res
      .status(200)
      .send(
        paginateValues(
          scheme,
          await getBooksResources(await queryBooksIDs(scheme.query))
        )
      );
  } catch (e) {
    next(e);
  }
}

export async function getBookByIdController(req, res, next) {
  try {
    return res.status(200).send(await getBookResourceByID(req.params.id));
  } catch (e) {
    next(e);
  }
}

export async function getBookTotalAmountController(req, res, next) {
  try {
    return res.status(200).send({
      totalAmount: (await getBookRecordByID(req.params.id)).totalAmount,
    });
  } catch (e) {
    next(e);
  }
}

export async function getBookGivenAmountController(req, res, next) {
  try {
    return res.status(200).send({
      givenAmount: (await getBookRecordByID(req.params.id)).givenAmount,
    });
  } catch (e) {
    next(e);
  }
}

export async function getBookAmountDetailsInDepartmentsController(
  req,
  res,
  next
) {
  try {
    return res
      .status(200)
      .send(await getBookAmountDetailsInDepartments(req.params.id));
  } catch (e) {
    next(e);
  }
}

export async function getBookAmountDetailsInSingleDepartmentController(
  req,
  res,
  next
) {
  try {
    const departmentID = req.params.departmentID;

    const amountDetails = (
      await queryRecords(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS, req.params, [
        'departmentID',
        'totalAmount',
        'givenAmount',
      ])
    )[0];

    return res
      .status(200)
      .send(amountDetails || { departmentID, totalAmount: 0, givenAmount: 0 });
  } catch (e) {
    next(e);
  }
}

export async function setBookAmountInDepartmentController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, setBookAmountInDepartmentScheme);

    const bookInDepartmentRecord = (
      await queryRecords(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS, scheme.params)
    )[0];

    let deltaAmountOfBooks;

    if (bookInDepartmentRecord) {
      await changeRecordData(
        bookInDepartmentRecord.id,
        dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS,
        scheme.body
      );
      deltaAmountOfBooks =
        scheme.body.totalAmount - bookInDepartmentRecord.totalAmount;
    } else {
      await createRecord(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS, {
        ...scheme.params,
        ...scheme.body,
      });
      deltaAmountOfBooks = scheme.body.totalAmount;
    }

    await increaseValueBy(
      dbTablesNamesEnum.BOOKS,
      scheme.params.bookID,
      'totalAmount',
      deltaAmountOfBooks
    );

    await increaseValueBy(
      dbTablesNamesEnum.DEPARTMENTS,
      scheme.params.departmentID,
      'totalBooksAmount',
      deltaAmountOfBooks
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

export async function updateBookController(req, res, next) {
  try {
    const scheme = getSchemeFields(updateBookScheme);
    const id = scheme.params.id;

    await changeRecordData(id, dbTablesNamesEnum.BOOKS, {
      title: scheme.body.title,
    });

    await deleteBookAuthors(id);
    await addBookAuthors(id, scheme.body.authorsIDs);

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

export async function deleteBookController(req, res, next) {
  try {
    const id = req.params.id;
    const book = (await queryRecords(dbTablesNamesEnum.BOOKS, { id }))[0];

    if (book.givenAmount > 0) {
      res.statusMessage = 'There are not returned books';
      return res.status(409).send();
    }

    await deleteBookFromDepartments(id);
    await deleteBookAuthors(id);

    await deleteRecord(id, dbTablesNamesEnum.BOOKS);

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

async function addBookAuthors(bookID, authors) {
  if (authors.length <= 0) return;

  const query = sql
    .insert(
      dbTablesNamesEnum.BOOK_AUTHORS,
      authors.map((authorID) => ({ bookID, authorID }))
    )
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}

async function getBookAmountInDepartment(bookID, departmentID) {
  const bookAmountDetails = await getAmountDetailsOfBookInDepartment(
    bookID,
    departmentID
  );

  return bookAmountDetails.totalAmount - bookAmountDetails.givenAmount;
}

async function queryBooksIDs({ title, authorsIDs = [] }) {
  let query = sql
    .select('bookID')
    .from(dbTablesNamesEnum.BOOK_AUTHORS)
    .join(dbTablesNamesEnum.BOOKS)
    .on(
      `${dbTablesNamesEnum.BOOKS}.id`,
      `${dbTablesNamesEnum.BOOK_AUTHORS}.bookID`
    );

  const conditions = [];

  title && conditions.push(sql.eq('title', title));
  authorsIDs.length > 0 &&
    conditions.push(sql.or(authorsIDs.map((id) => sql.eq('authorID', id))));

  if (conditions.length > 0) {
    query = query.where(sql.and(conditions));
  }

  query = query.toParams({ placeholder: '?' });

  query.text += ` GROUP BY bookID HAVING COUNT(*) >= ${authorsIDs.length}`;

  return (await connection.query(query.text, query.values))[0].map(
    (record) => record.bookID
  );
}

async function getBooksResources(booksIDs) {
  if (booksIDs.length === 0) return [];

  const queryBooks = sql
    .select('bookID', 'title', 'authorID')
    .from(dbTablesNamesEnum.BOOK_AUTHORS)
    .join(dbTablesNamesEnum.BOOKS)
    .on(
      `${dbTablesNamesEnum.BOOKS}.id`,
      `${dbTablesNamesEnum.BOOK_AUTHORS}.bookID`
    )
    .where(sql.or(booksIDs.map((id) => sql.eq('bookID', id))))
    .toParams({ placeholder: '?' });

  const booksData = (
    await connection.query(queryBooks.text, queryBooks.values)
  )[0];
  const results = [];

  booksData.forEach((data) => {
    const resource = results.find((resource) => data.bookID === resource.id);

    if (resource) {
      resource.authorsIDs.push(data.authorID);
      return;
    }

    results.push({
      id: data.bookID,
      title: data.title,
      authorsIDs: [data.authorID],
    });
  });

  return results;
}

async function getBookResourceByID(bookID) {
  const book = await getBookRecordByID(bookID, ['id', 'title']);

  const authorsIDsRecords = await queryRecords(
    dbTablesNamesEnum.BOOK_AUTHORS,
    {
      bookID,
    },
    ['authorID']
  );
  return {
    ...book,
    authorsIDs: authorsIDsRecords.map((value) => value.authorID),
  };
}

async function getBookRecordByID(id, columns) {
  return (await queryRecords(dbTablesNamesEnum.BOOKS, { id }, columns))[0];
}

async function getBookAmountDetailsInDepartments(bookID) {
  return await queryRecords(
    dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS,
    {
      bookID,
    },
    ['departmentID', 'totalAmount', 'givenAmount']
  );
}

async function deleteBookFromDepartments(bookID) {
  const queryTexts = [];
  const queryValues = [];

  const bookAmountInDepartments =
    await getBookAmountDetailsInDepartments(bookID);

  bookAmountInDepartments.forEach((value) => {
    const query = sql
      .update(dbTablesNamesEnum.DEPARTMENTS)
      .set('totalBooksAmount', `totalBooksAmount - ${value.totalAmount}`)
      .where(sql.eq('id', value.departmentID))
      .toParams({ placeholder: '?' });

    queryTexts.push(query.text);
    queryValues.push(query.values);
  });

  await connection.query(queryTexts.join(';'), queryValues.flat());

  const query = sql
    .delete(dbTablesNamesEnum.BOOKS_IN_DEPARTMENTS)
    .where(sql.eq('bookID', bookID))
    .toParams({ placeholder: '?' });

  await connection.query(query.text, query.values);
}

async function deleteBookAuthors(bookID) {
  const query = sql
    .delete(dbTablesNamesEnum.BOOK_AUTHORS)
    .where(sql.eq('bookID', bookID))
    .toParams({ placeholder: '?' });
  await connection.query(query.text, query.values);
}
