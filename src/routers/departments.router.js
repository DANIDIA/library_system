import express from 'express';
import {
  createDepartmentController,
  queryDepartmentsController,
  deleteDepartmentController,
  updateDepartmentController,
  getDepartmentByIdController,
  getTotalBooksAmountInDepartmentController,
  getGivenBooksAmountInDepartmentController,
  getEmployeesAmountInDepartmentController,
} from '../controllers/index.js';
import { adminOnlyRule, forManagerRule } from '../accessRules/index.js';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  defaultDepartmentScheme,
  queryDepartmentScheme,
  departmentDataAccessScheme,
  updateDepartmentScheme,
} from '../schemas/index.js';

export const departmentsRouter = express.Router();

departmentsRouter.use(authenticate);

departmentsRouter.post(
  '/',
  adminOnlyRule(),
  validateScheme(defaultDepartmentScheme),
  createDepartmentController
);
departmentsRouter.get(
  '/',
  validateScheme(queryDepartmentScheme),
  queryDepartmentsController
);
departmentsRouter.get(
  '/:id',
  validateScheme(departmentDataAccessScheme),
  getDepartmentByIdController
);
departmentsRouter.get(
  '/:id/total-books-amount',
  validateScheme(departmentDataAccessScheme),
  getTotalBooksAmountInDepartmentController
);
departmentsRouter.get(
  '/:id/given-books-amount',
  validateScheme(departmentDataAccessScheme),
  getGivenBooksAmountInDepartmentController
);
departmentsRouter.get(
  '/:id/employees-amount',
  forManagerRule('id', false),
  validateScheme(departmentDataAccessScheme),
  getEmployeesAmountInDepartmentController
);
departmentsRouter.put(
  '/:id',
  forManagerRule('id', false),
  validateScheme(updateDepartmentScheme),
  updateDepartmentController
);
departmentsRouter.delete(
  '/:id',
  adminOnlyRule(),
  validateScheme(departmentDataAccessScheme),
  deleteDepartmentController
);
