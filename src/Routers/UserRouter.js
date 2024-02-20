import Router from 'express';
import { UserController } from '../index.js';

export function userRouter (dbConnection) {
    const userRouter = new Router();
    const userController = new UserController(dbConnection);

    userRouter.get('/login', (res, req) => userController.login(res, req));
    userRouter.get('/logout', (res, req) => userController.login(res, req));

    return userRouter;
}