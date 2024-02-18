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
        const employee_account_id = result[0].id;

        db_connection.query(`select * from session where employee_id = ${employee_account_id} order by start desc limit 1`, (err, result) => {
            if (err) {
                res.status(500).json('Some problems with database :(');
                console.log(err);
                return;
            }

            console.log(result);

            if (result.length > 0 && result[0].end === null){
                res.status(500).json('There is an active session')
                return
            }

            db_connection.query(`insert into session (employee_id, start) values (${employee_account_id}, current_timestamp())`, (err, result) => {
                console.log(err || result)
                res.status(200).json("Authenticate. Session id is: " + result.insertId )
            })


        })

    })
})

app.get('/logout', (req, res) => {
    console.log(req.body);
    const sessionID = req.body.sessionID;

    db_connection.query(`select end from session where id = '${sessionID}'`, (err, result) =>{
        if(err){
            console.log(err);
            res.status(500).json(err);
            return
        }

        if (result.length < 1){
            res.status(500).json("No session with this id")
            return;
        }

        const sessionEndTime = result[0].end;

        if (sessionEndTime != null){
            res.status(500).json("Session is ended");
            return;
        }

        db_connection.query(`update session set end = current_timestamp() where id = ${sessionID}`, (err, result) =>{
            if(err) {
                console.log(err);
                res.status(500).json(err);
                return
            }

            res.status(200).json("You have logout")
        })
    })
})
app.listen(PORT, () => console.log('SERVER STARTS'))