import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import {readerRouter, userRouter} from "./src/index.js";

dotenv.config();
const PORT = 5000;

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME
}).promise()

const app = express();
app.use(express.json());
app.use('/user', userRouter(connection));
app.use('/reader', readerRouter(connection));

app.listen(PORT, () => console.log('SERVER STARTS'))




