import Router from 'express';
import { UserController } from '../index.js';

export function userRouter (dbConnection) {
    const userRouter = new Router();
    const userController = new UserController(dbConnection);

    userRouter.get('/login', async (res, req) =>
        await userController.login(res, req));
    userRouter.get('/logout', async (res, req) =>
        await userController.logout(res, req));

    return userRouter;
}