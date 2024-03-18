import express from 'express';
import { librarianController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';
import { accountStatus, role } from '../enums/index.js';

export const librarianRouter = express.Router();

librarianRouter.use(authenticate);

librarianRouter.post('/create', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), librarianController.create());
librarianRouter.get('/get_one', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), librarianController.getOne());
librarianRouter.get('/get_many', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), librarianController.getMany());
librarianRouter.put('/change_data', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), librarianController.changeData());
librarianRouter.put('/block', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), librarianController.changeStatus(accountStatus.BLOCKED));
librarianRouter.put('/unblock', validateRoles([role.ADMIN, role.DEPARTMENT_MANAGER]), librarianController.changeStatus(accountStatus.ACTIVE));
librarianRouter.delete('/delete');
