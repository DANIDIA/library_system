import { sessionsRouter } from './sessions.router.js';
import { readersRouter } from './readers.router.js';
import { booksRouter } from './books.router.js';
import { usersRouter } from './users.router.js';
import { departmentsRouter } from './departments.router.js';

export function routes(app) {
  app.use('api/sessions', sessionsRouter);
  app.use('api/readers', readersRouter);
  app.use('api/books', booksRouter);
  app.use('api/users', usersRouter);
  app.use('api/departments', departmentsRouter);
}
