import express from 'express';
import cors from 'cors';
import {
  booksRouter,
  readersRouter,
  sessionsRouter,
  departmentsRouter,
  usersRouter,
} from './src/index.js';
import { swaggerDocs } from './src/utils/index.js';

const PORT = 5000;

console.log('Server starts...');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/sessions', sessionsRouter);
app.use('/readers', readersRouter);
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/departments', departmentsRouter);

swaggerDocs(app);

// ToDo: #3: This middleware doesn't work.
// app.use(handleEndpointsErrors);

app.listen(PORT, () => console.log('Server is listening on port ' + PORT));
