import Router from 'express';
import {ReaderController, role} from "../EndpointsControllers/index.js";

export function readerRouter(dbConnection){
    const router = new Router();
    const readerController = new ReaderController(dbConnection);

    router.get('/get_one');
    router.get('/get_many');
    router.post('/create', async (req, res) =>
    { await readerController.create(req, res, [role.ADMIN, role.DEPARTMENT_MANAGER, role.LIBRARIAN]) });
    router.put('/change_data');
    router.put('/receive_book');
    router.put('/return_book');
    router.put('/block');
    router.delete('/delete');

    return router;
}