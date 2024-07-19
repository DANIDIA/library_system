import * as express from 'express';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  createBookController,
  deleteBookController,
  getBookAmountDetailsInDepartmentsController,
  getBookAmountDetailsInSingleDepartmentController,
  getBookAuthorsController,
  getBookByIdController,
  getBookGivenAmountController,
  getBookTotalAmountController,
  giveBookToReaderController,
  queryBooksController,
  setBookAmountInDepartmentController,
  updateBookController,
} from '../controllers/index.js';
import { forUsersInDepartment } from '../accessRules/index.js';
import {
  accessBookScheme,
  bookAmountDetailsForSingleDepartmentScheme,
  defaultBooksScheme,
  giveBookToReaderScheme,
  queryBooksScheme,
  setBookAmountInDepartmentScheme,
  updateBookScheme,
} from '../schemas/index.js';

export const booksRouter = express.Router();

booksRouter.use(authenticate);

booksRouter.post('/', validateScheme(defaultBooksScheme), createBookController);

booksRouter.post(
  '/:bookID/give-to-reader/:readerID',
  validateScheme(giveBookToReaderScheme),
  forUsersInDepartment(false),
  giveBookToReaderController
);

booksRouter.get('/', validateScheme(queryBooksScheme), queryBooksController);

booksRouter.get(
  '/:id',
  validateScheme(accessBookScheme),
  getBookByIdController
);

booksRouter.get(
  '/:id/authors',
  validateScheme(accessBookScheme),
  getBookAuthorsController
);

booksRouter.get(
  '/:id/total-amount',
  validateScheme(accessBookScheme),
  getBookTotalAmountController
);

booksRouter.get(
  '/:id/given-amount',
  validateScheme(accessBookScheme),
  getBookGivenAmountController
);

booksRouter.get(
  '/:id/amount-details-in-departments',
  validateScheme(accessBookScheme),
  getBookAmountDetailsInDepartmentsController
);

booksRouter.get(
  '/:bookID/amount-details-in-departments/:departmentID',
  validateScheme(bookAmountDetailsForSingleDepartmentScheme),
  getBookAmountDetailsInSingleDepartmentController
);

booksRouter.patch(
  '/:bookID/total-amount/:departmentID',
  validateScheme(setBookAmountInDepartmentScheme),
  forUsersInDepartment(),
  setBookAmountInDepartmentController
);

booksRouter.put('/:id', validateScheme(updateBookScheme), updateBookController);

booksRouter.delete(
  '/:id',
  validateScheme(accessBookScheme),
  deleteBookController
);
