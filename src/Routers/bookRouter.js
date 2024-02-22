import Router from 'express';

export const bookRouter = new Router();

bookRouter.get('/get_one');
bookRouter.get('/get_many');
bookRouter.post('/add');
bookRouter.put('/change_data');
bookRouter.put('/receive');
bookRouter.put('/return');
bookRouter.delete('/delete');
