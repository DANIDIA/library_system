import express from 'express';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  createReaderController,
  deleteReaderController,
  getReaderBooksController,
  getReaderByIdController,
  queryReadersController,
  returnReaderBookController,
  updateReaderController,
} from '../controllers/index.js';
import {
  accessReaderScheme,
  defaultReadersScheme,
  queryReadersScheme,
  returnBookScheme,
  updateReaderScheme,
} from '../schemas/index.js';

export const readersRouter = express.Router();

readersRouter.use(authenticate);

readersRouter.post(
  '/',
  validateScheme(defaultReadersScheme),
  createReaderController
);
readersRouter.post(
  '/:readerID/return-book/:bookID',
  validateScheme(returnBookScheme),
  returnReaderBookController
);
readersRouter.get(
  '/',
  validateScheme(queryReadersScheme),
  queryReadersController
);
readersRouter.get(
  '/:id',
  validateScheme(accessReaderScheme),
  getReaderByIdController
);
readersRouter.get(
  '/:id',
  validateScheme(accessReaderScheme),
  getReaderBooksController
);
readersRouter.put(
  '/:id',
  validateScheme(updateReaderScheme),
  updateReaderController
);
readersRouter.delete(
  '/:id',
  validateScheme(accessReaderScheme),
  deleteReaderController
);
