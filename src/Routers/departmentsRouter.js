import express from 'express';
import { authenticate, validateRoles } from '../Helpers/index.js';
import { departmentsController } from '../EndpointsControllers/index.js';

export const departmentsRouter = express.Router();

departmentsRouter.use(authenticate);

departmentsRouter.post('/add', validateRoles());
departmentsRouter.get('/get', validateRoles());
departmentsRouter.put('/update', validateRoles());
departmentsRouter.put('/remove', validateRoles());
