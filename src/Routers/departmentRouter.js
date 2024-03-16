import express from 'express';
import { authenticate, validateRoles } from '../Helpers/index.js';
import { role } from '../enums/index.js';
import { departmentController } from '../EndpointsControllers/index.js';

export const departmentRouter = express.Router();

departmentRouter.use(authenticate);

departmentRouter.post('/create', validateRoles([role.ADMIN]), departmentController.create());
departmentRouter.get('/get_one', validateRoles(), async (req, res) => await departmentController.getOne(req, res));
departmentRouter.get('/get_many', validateRoles(), async (req, res) => await departmentController.getMany(req, res));
departmentRouter.get('/get_books', validateRoles(), departmentController.getBooks());
departmentRouter.put('/change_data', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), departmentController.changeData());
