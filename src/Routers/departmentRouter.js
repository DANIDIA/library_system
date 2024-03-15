import express from 'express';
import { authenticate, validateRoles } from '../Helpers/index.js';
import { role } from '../enums/index.js';
import { departmentController } from '../EndpointsControllers/index.js';

export const departmentRouter = express.Router();

departmentRouter.use(authenticate);

departmentRouter('/create', validateRoles([role.ADMIN]), async (req, res) => await departmentController.create(req, res));
departmentRouter.get('/get_one', validateRoles(), async (req, res) => await departmentController.getOne(req, res));
departmentRouter.get('/get_many', validateRoles(), async (req, res) => await departmentController.getMany(req, res));
departmentRouter.get('/all_books', validateRoles());
departmentRouter.put('/change_data', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), async (req, res) => await departmentController.changeData(req, res));
