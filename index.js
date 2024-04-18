import express from 'express';
import {
    booksRouter,
    readersRouter,
    sessionsRouter,
    departmentsRouter,
    handleEndpointsErrors,
    usersRouter
} from './src/index.js';

const PORT = 5000;

const app = express();
app.use(express.json());
app.use('/sessions', sessionsRouter);
app.use('/readers', readersRouter);
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/departments', departmentsRouter);

app.use(handleEndpointsErrors);

app.listen(PORT, () => console.log('SERVER STARTS'));
