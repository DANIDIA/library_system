import sql from 'mysql-bricks';
import { DefaultController } from './default.controller.js';
import { connection, recordExist } from '../helpers/index.js';
import { dbTablesNamesEnum } from '../enums/index.js';
import { validatePhoneNumber } from '../helpers/contactDetailsValidators.js';

export class DepartmentController extends DefaultController {
  constructor() {
    const searchableFields = [
      'name',
      'address',
      'contactNumber',
      'actualManagerID',
    ];
    const updatableFields = [
      'name',
      'address',
      'contactNumber',
      'actualManagerID',
    ];
    super(dbTablesNamesEnum.DEPARTMENTS, updatableFields, searchableFields);
  }

  add() {
    return async (req, res, next) => {
      try {
        const managerID = req.body.actualManagerID;

        if (
          Object.hasOwn(req.body, 'actualManagerID') &&
          !(await recordExist(managerID, dbTablesNamesEnum.EMPLOYEES))
        ) {
          return res
            .status(404)
            .send(`Department manager with id ${managerID} doesn't exist`);
        }

        const fields = {
          name: true,
          address: true,
          contactNumber: true,
          actualManagerID: false,
        };

        const values = this._getValuesFromRequestBody(req.body, fields);

        if (typeof values === 'string') {
          return res
            .status(404)
            .send(`Field with name '${values}' is necessary`);
        }

        if (validatePhoneNumber(req, res)) {
          return;
        }

        const query = sql
          .insert(this._tableName, Object.keys(fields))
          .values(values)
          .toParams({ placeholder: '?' });

        await connection.query(query.text, query.values);

        res.status(200).send('ok');
      } catch (e) {
        next(e);
      }
    };
  }

  get() {
    return async (req, res, next) => {
      try {
        await super.get(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  update() {
    return async (req, res, next) => {
      try {
        const managerID = req.body.actualManagerID;

        if (
          Object.hasOwn(req.body, 'actualManagerID') &&
          !(await recordExist(managerID, dbTablesNamesEnum.EMPLOYEES))
        ) {
          return res
            .status(404)
            .send(`Department manager with id ${managerID} doesn't exist`);
        }

        if (validatePhoneNumber(req, res)) {
          return;
        }

        await super.update(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  remove() {
    return async (req, res, next) => {
      try {
        const queryGetBooksAmount = sql
          .select(sql('COUNT(id) as amount'))
          .from(dbTablesNamesEnum.BOOKS)
          .where(sql.eq('id', req.body.id))
          .toParams({ placeholder: '?' });

        const books = (
          await connection.query(
            queryGetBooksAmount.text,
            queryGetBooksAmount.values
          )
        )[0][0];

        if (books.amount > 0) {
          return res
            .status(400)
            .send(`There are books in department with id ${req.res.id}`);
        }

        const queryGetEmployeesAmount = sql
          .select(sql('COUNT(id) as amount'))
          .from(dbTablesNamesEnum.EMPLOYEES)
          .where(sql.eq('departmentID', req.body.id))
          .toParams({ placeholder: '?' });

        const employees = (
          await connection.query(
            queryGetEmployeesAmount.text,
            queryGetBooksAmount.values
          )
        )[0][0];

        if (employees.amount > 0) {
          return res
            .status(400)
            .send(`There are employees in department with id ${req.res.id}`);
        }

        await super.remove(req, res);
      } catch (e) {
        next(e);
      }
    };
  }
}

export const departmentsController = new DepartmentController();
