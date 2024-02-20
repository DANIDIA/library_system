import express from 'express';
import mysql from 'mysql';
import { readEnvAsObject, userRouter } from './src/index.js'

const databaseConnectionConfig = readEnvAsObject();
const PORT = 5000;

const db_connection = mysql.createConnection(databaseConnectionConfig);
const app = express();
app.use(express.json());
app.use('/user', userRouter(db_connection))

app.listen(PORT, () => console.log('SERVER STARTS'))




