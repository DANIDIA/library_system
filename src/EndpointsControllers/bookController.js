import { connection, recordExist } from '../Helpers/index.js';
import { MAX_BOOKS_FOR_READER } from '../Helpers/constants.js';
import { bookAction } from '../enums/index.js';

class BookController {
    async create (request, response, user) {
        const [insertionData] = await connection.query(
            'INSERT INTO book (title, author, current_department, current_reader, who_add_id, addition_time) VALUES (?, ?, ?, ?, ?, NOW())',
            [request.body.title, request.body.author, request.body.currentDepartment, null, user.id]
        );

        response.status(200).json(JSON.stringify({ bookID: insertionData.insertId }));
    }

    async getOne (request, response) {
        const bookID = request.body.bookID;

        if (!(await recordExist(bookID, 'book'))) {
            response.status(500).json('No book with id: ' + bookID);
            return;
        }

        const [books] = await connection.query(
            'SELECT * FROM book WHERE id = ?',
            [bookID]
        );

        response.status(200).json(JSON.stringify(books[0]));
    }

    async getMany (request, response) {
        const fromID = request.body.fromID;
        const amount = request.body.amount;

        const [books] = await connection.query(
            'SELECT * FROM book WHERE id >= ? LIMIT ?',
            [fromID, amount]
        );

        response.status(200).json(JSON.stringify(books));
    }

    async changeData (request, response) {
        const bookID = request.body.bookID;

        if (!(await recordExist(bookID, 'book'))) {
            response.status(500).json('No book with id: ' + bookID);
            return;
        }

        if (!!request.body.title && request.body.title !== '') {
            await connection.query(
                'UPDATE book SET title = ? WHERE id = ?',
                [request.body.title, bookID]
            );
        }

        if (!!request.body.author && request.body.author !== '') {
            await connection.query(
                'UPDATE book SET author = ? WHERE id = ?',
                [request.body.author, bookID]
            );
        }

        if (!!request.body.currentDepartment && request.body.currentDepartment !== '') {
            await connection.query(
                'UPDATE book SET current_department = ? WHERE id = ?',
                [request.body.currentDepartment, bookID]
            );
        }

        if (request.body.currentReader !== '') {
            await connection.query(
                'UPDATE book SET current_reader = ? WHERE id = ?',
                [request.body.currentReader, bookID]
            );
        }

        response.status(200).json('Successfully update');
    }

    async receive (request, response, user) {
        console.log('receive');
        const bookID = request.body.bookID;
        const readerID = request.body.readerID;
        const departmentID = request.body.departmentID;

        if (!(await recordExist(bookID, 'book'))) {
            response.status(500).json('Do not exist a book with id:' + bookID);
            return;
        }

        if (!(await recordExist(readerID, 'reader'))) {
            response.status(500).json('Do not exist a reader with id:' + readerID);
            return;
        }

        if (!(await recordExist(departmentID, 'department'))) {
            response.status(500).json('Do not exist a department with id:' + departmentID);
            return;
        }

        const [books] = await connection.query(
            'SELECT * FROM book WHERE id = ?',
            [bookID]
        );

        const receivedBook = books[0];

        if (receivedBook.current_reader != null) {
            response.status(500).json('Cant receive a book');
            return;
        }

        const [readers] = await connection.query(
            'SELECT * FROM reader WHERE id = ?',
            [readerID]
        );

        const bookReceiver = readers[0];

        if (bookReceiver.books_amount >= MAX_BOOKS_FOR_READER) {
            response.status(500).json('Reader has max amount of books');
            return;
        }

        await connection.query(
            'UPDATE book SET current_reader = ? WHERE id = ?',
            [bookReceiver.id, bookID]
        );

        await connection.query(
            'UPDATE reader SET books_amount = ? WHERE id = ?',
            [(bookReceiver.books_amount * 1) + 1, bookReceiver.id]
        );

        await connection.query(
            'INSERT INTO book_receive_return_history (book_id, reader_id, employee_id, time, action, department) values (?, ?, ?, NOW(), ?, ?)',
            [bookID, bookReceiver.id, user.id, bookAction.RECEIVE, departmentID]
        );

        response.json(200);
    }

    async return (request, response, user) {
        const bookID = request.body.bookID;
        const departmentID = request.body.departmentID;

        if (!(await recordExist(bookID, 'book'))) {
            response.status(500).json('Do not exist a book with id:' + bookID);
            return;
        }

        if (!(await recordExist(departmentID, 'department'))) {
            response.status(500).json('Do not exist a department with id:' + departmentID);
            return;
        }

        const [historyRecords] = await connection.query(
            'SELECT * FROM book_receive_return_history WHERE book_id = ? ORDER BY time desc LIMIT 1',
            [bookID]
        );

        if (historyRecords.length === 0) {
            response.status(500).json('Book cant be returned');
            return;
        }

        const lastRecord = historyRecords[0];

        if (lastRecord.department !== departmentID) {
            response.status(500).json('Cant return a book in other department than department where the book was received');
            return;
        }

        if (lastRecord.action === bookAction.RETURN) {
            response.status(500).json('Book cant be returned');
            return;
        }

        const [readers] = await connection.query(
            'SELECT * FROM reader WHERE id = ?',
            [lastRecord.reader_id]
        );

        const reader = readers[0];

        await connection.query(
            'UPDATE reader SET books_amount = ? WHERE id = ?',
            [(reader.books_amount * 1) - 1, reader.id]
        );

        await connection.query(
            'UPDATE book SET current_reader = null WHERE id = ?',
            [bookID]
        );

        await connection.query(
            'INSERT INTO book_receive_return_history (book_id, reader_id, employee_id, time, action, department) VALUES (?, ?, ?, NOW(), ?, ?)',
            [bookID, reader.id, user.id, bookAction.RETURN, departmentID]
        );

        response.json(200);
    }
}

export const bookController = new BookController();
