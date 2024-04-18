import express from 'express';
import { userController } from '../index.js';

export const sessionsRouter = express.Router();

sessionsRouter.get('/login', userController.login);
sessionsRouter.get('/logout', userController.logout);
sessionsRouter.get('/is_session_ended');
