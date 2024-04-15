import express from 'express';
import { booksRouter, readerRouter, userRouter, departmentRouter, librarianRouter } from './src/index.js';

const PORT = 5000;

const app = express();
app.use(express.json());
app.use('/user', userRouter);
app.use('/reader', readerRouter);
app.use('/books', booksRouter);
app.use('/department', departmentRouter);
app.use('/librarian', librarianRouter);

app.listen(PORT, () => console.log('SERVER STARTS'));
