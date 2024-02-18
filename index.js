import express from 'express';
import mysql from 'mysql';
import { readEnvAsObject } from './src/envReader.js'

const databaseConnectionConfig = readEnvAsObject();

const PORT = 5000;
const db_connection = mysql.createConnection(databaseConnectionConfig);
const app = express();

app.use(express.json())
app.get('/login', (req, res) => {
    console.log(req.body)

    db_connection
        .query(`select id, name, surname, role from employee_account where login = '${req.body.login}' and password = '${req.body.password}'`,
            (err, result) =>{
        if (err) {
            res.status(500).json('Some problems with database :(');
            console.log(err);
            return;
        }

        if (result.length === 0){
            res.status(500).json('No accounts with this login and password')
            return;
        }
        console.log(result)
        const emoloyee_account_id = result[0].id;

        db_connection.query(`select * from session where employee_id = ${emoloyee_account_id} order by start desc`, (err, result) => {
            if (err) {
                res.status(500).json('Some problems with database :(');
                console.log(err);
                return;
            }

            console.log(result);

            if (result[1].end === null){
                res.status(500).json('There is an active session')
                return
            }

            db_connection.query(`insert into session (employee_id, start) values (${emoloyee_account_id}, \'2024-02-16 19:00:00\')`, (err, result) => {
                console.log(err || result)
                res.status(200).json("Authenticate. Session id is: " + result.insertId )
            })


        })

    })



})

console.log('hello')

app.listen(PORT, () => console.log('server starts'))