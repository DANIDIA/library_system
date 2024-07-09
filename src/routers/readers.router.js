import express from 'express';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  createReaderController,
  deleteReaderController,
  getReaderBooksController,
  getReaderByIdController,
  returnReaderBookController,
  updateReaderController,
} from '../controllers/index.js';
import {
  accessReaderScheme,
  defaultReadersScheme,
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
