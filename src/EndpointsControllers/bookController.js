import { connection, recordExist } from '../Helpers/index.js';

class BookController {
    async create (request, response, user) {
        const [insertionData] = await connection.query(
            'INSERT INTO book (title, author, current_department, current_reader, who_add_id, addition_time) VALUES (?, ?, ?, ?, ?, NOW())',
            [request.body.title, request.body.author, request.body.currentDepartment, null, user.id]
        );

        response.status(200).json(JSON.stringify({ bookID: insertionData.insertId }));
    }

    async getOne (request, response) {
        const bookID = request.body.readerID;

        if (!(await recordExist(bookID, 'book'))) {
            response.status(500).json('No reader with id: ' + bookID);
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

        if (!!request.body.currentReader && request.body.currentReader !== '') {
            await connection.query(
                'UPDATE book SET current_reader = ? WHERE id = ?',
                [request.body.currentReader, bookID]
            );
        }

        response.status(200).json('Successfully update');
    }
}

export const bookController = new BookController();
