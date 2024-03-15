import express from 'express';
import { bookRouter, readerRouter, userRouter, departmentRouter } from './src/index.js';

const PORT = 5000;

const app = express();
app.use(express.json());
app.use('/user', userRouter);
app.use('/reader', readerRouter);
app.use('/book', bookRouter);
app.use('/department', departmentRouter);

app.listen(PORT, () => console.log('SERVER STARTS'));
