import express from 'express';
import { bookRouter, readerRouter, userRouter } from './src/index.js';

const PORT = 5000;

const app = express();
app.use(express.json());
app.use('/user', userRouter);
app.use('/reader', readerRouter);
app.use('/book', bookRouter);

app.listen(PORT, () => console.log('SERVER STARTS'));
