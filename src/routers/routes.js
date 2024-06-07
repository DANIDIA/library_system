import { sessionsRouter } from './sessionsRouter.js';
import { readersRouter } from './readersRouter.js';
import { booksRouter } from './booksRouter.js';
import { usersRouter } from './usersRouter.js';
import { departmentsRouter } from './departmentsRouter.js';

export function routes(app) {
  app.use('api/sessions', sessionsRouter);
  app.use('api/readers', readersRouter);
  app.use('api/books', booksRouter);
  app.use('api/users', usersRouter);
  app.use('api/departments', departmentsRouter);
}
