import { connection, getUserBySession, recordExist } from '../Helpers/index.js';
import { MAX_BOOKS_FOR_READER } from '../Helpers/constants.js';
import { bookAction } from '../enums/index.js';

class BookController {
    async create (req, res) {
        const user = await getUserBySession(req.body.sessionID);

        if (!(await recordExist(req.body.departmentID, 'department'))) {
            return res.status(400).send('Department not exist');
        }

        const [insertionData] = await connection.query(
            'INSERT INTO book (title, author, current_department, current_reader, who_add_id, addition_time) VALUES (?, ?, ?, ?, ?, NOW())',
            [req.body.title, req.body.author, req.body.currentDepartment, null, user.id]
        );

        res.status(200).json({ bookID: insertionData.insertId });
    }

    async getOne (req, res) {
        const bookID = req.body.bookID;

        const [books] = await connection.query(
            'SELECT * FROM book WHERE id = ?',
            [bookID]
        );

        res.status(200).json(books[0]);
    }

    async getMany (req, res) {
        const fromID = req.body.fromID;
        const amount = req.body.amount;

        const [books] = await connection.query(
            'SELECT * FROM book WHERE id >= ? LIMIT ?',
            [fromID, amount]
        );

        res.status(200).json(books);
    }

    async changeData (req, res) {
        const bookID = req.body.bookID;

        if (!(await recordExist(req.body.currentDepartmnet, 'department'))) {
            return res.status(400).send('Department not exist');
        }

        if (!(await recordExist(req.body.curentReader, 'reader'))) {
            return res.status(400).send('Reader not exist');
        }

        if (req.body.title) {
            await connection.query(
                'UPDATE book SET title = ? WHERE id = ?',
                [req.body.title, bookID]
            );
        }

        if (req.body.author) {
            await connection.query(
                'UPDATE book SET author = ? WHERE id = ?',
                [req.body.author, bookID]
            );
        }

        if (req.body.currentDepartment) {
            await connection.query(
                'UPDATE book SET current_department = ? WHERE id = ?',
                [req.body.currentDepartment, bookID]
            );
        }

        if (req.body.currentReader) {
            await connection.query(
                'UPDATE book SET current_reader = ? WHERE id = ?',
                [req.body.currentReader, bookID]
            );
        }

        res.status(200).send('Successfully update');
    }

    async receive (req, res) {
        const bookID = req.body.bookID;
        const readerID = req.body.readerID;
        const departmentID = req.body.departmentID;
        const user = await getUserBySession(req.body.sessionID);

        if (!(await recordExist(bookID, 'book'))) {
            return res.status(400).send('Book does not exist');
        }

        if (!(await recordExist(readerID, 'reader'))) {
            return res.status(400).send('Reader does not exist');
        }

        if (!(await recordExist(departmentID, 'department'))) {
            return res.status(400).send('Department does not exist');
        }

        const [books] = await connection.query(
            'SELECT * FROM book WHERE id = ?',
            [bookID]
        );

        const receivedBook = books[0];

        if (receivedBook.current_reader != null) {
            return res.status(400).send('Book was received');
        }

        const [readers] = await connection.query(
            'SELECT * FROM reader WHERE id = ?',
            [readerID]
        );

        const bookReceiver = readers[0];

        if (bookReceiver.books_amount >= MAX_BOOKS_FOR_READER) {
            return res.status(400).json('Reader has max amount of books');
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

        res.status(200).send('successfully received');
    }

    async return (req, res) {
        const bookID = req.body.bookID;
        const departmentID = req.body.departmentID;
        const user = await getUserBySession(req.body.sessionID);

        if (!(await recordExist(bookID, 'book'))) {
            return res.status(400).send('Book not exist');
        }

        if (!(await recordExist(departmentID, 'department'))) {
            return res.status(400).send('Department not exist');
        }

        const [historyRecords] = await connection.query(
            'SELECT * FROM book_receive_return_history WHERE book_id = ? ORDER BY time desc LIMIT 1',
            [bookID]
        );

        if (historyRecords.length === 0) {
            return res.status(400).send('Book was not received');
        }

        const lastRecord = historyRecords[0];

        if (lastRecord.department !== departmentID) {
            return res.status(400).send('Cant return a book in other department than department where the book was received');
        }

        if (lastRecord.action === bookAction.RETURN) {
            return res.status(400).send('Book was returned');
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

        res.status(200).send('Successfully returned');
    }
}

export const bookController = new BookController();
