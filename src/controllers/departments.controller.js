import {
  changeRecordData,
  createRecord,
  deleteRecord,
  getUserBySession,
  queryRecords,
} from '../helpers/index.js';
import { dbTablesNamesEnum, rolesEnum } from '../shared/index.js';
import {
  defaultDepartmentScheme,
  queryDepartmentScheme,
} from '../schemas/index.js';
import { newActualManagerValidator } from '../validators/index.js';
import { departmentResourceFieldsNames } from './shared/index.js';
import { getSchemeFields } from './helpers.js';

export async function createDepartmentController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, defaultDepartmentScheme);
    const hasActualManagerIdField = Object.hasOwn(
      scheme.body,
      'actualManagerID'
    );
    const managerID = scheme.body.actualManagerID;

    if (hasActualManagerIdField) {
      if (!(await newActualManagerValidator(managerID, res))) return;
    }

    const id = await createRecord(dbTablesNamesEnum.DEPARTMENTS, scheme.body);

    if (hasActualManagerIdField) {
      await changeRecordData(managerID, dbTablesNamesEnum.EMPLOYEES, {
        departmentID: id,
      });
    }

    res.status(201).send({ id });
  } catch (e) {
    next(e);
  }
}

export async function queryDepartmentsController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, queryDepartmentScheme);
    const valuesToQuery = { ...scheme.query };
    delete valuesToQuery.pageSize;
    delete valuesToQuery.pageNumber;

    const results = await queryRecords(
      dbTablesNamesEnum.DEPARTMENTS,
      valuesToQuery,
      departmentResourceFieldsNames
    );

    if (
      Object.hasOwn(scheme.query, 'pageSize') &&
      Object.hasOwn(scheme.query, 'pageNumber')
    ) {
      const pageSize = scheme.query.pageSize;
      const pageNumber = scheme.query.pageNumber;

      return res.status(200).send({
        allResultsAmount: results.length,
        results: results.slice(
          pageSize * pageNumber,
          pageSize * (pageNumber + 1)
        ),
      });
    }

    res.status(200).send({ allResultsAmount: results.length, results });
  } catch (e) {
    next(e);
  }
}

export async function updateDepartmentController(req, res, next) {
  try {
    const scheme = getSchemeFields(defaultDepartmentScheme, req);
    const managerID = scheme.body.actualManagerID;
    const hasManagerIDField = Object.hasOwn(scheme.body, 'actualManagerID');

    const requestAuthor = await getUserBySession(req.cookies.sessionID);
    const departmentID = req.params.id;

    if (hasManagerIDField) {
      if (requestAuthor.role !== rolesEnum.ADMIN) {
        return res.status(403).send();
      }

      if (!(await newActualManagerValidator(res, managerID))) return;

      await changeRecordData(managerID, dbTablesNamesEnum.EMPLOYEES, {
        departmentID,
      });
    }

    if (
      requestAuthor.role === rolesEnum.DEPARTMENT_MANAGER &&
      +requestAuthor.departmentID !== +departmentID
    ) {
      res.statusMessage(
        'You do not have permission as manager of another department'
      );
      res.status(403).send();
    }

    await changeRecordData(
      departmentID,
      dbTablesNamesEnum.DEPARTMENTS,
      scheme.body
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

export async function deleteDepartmentController(req, res, next) {
  try {
    const department = await queryRecords(dbTablesNamesEnum.DEPARTMENTS, {
      id: req.params.id,
    });

    if (
      department.wholeBooksAmount === 0 ||
      department.givenBooksAmount === 0 ||
      department.employeesAmount === 0
    ) {
      res.statusText =
        'There are books or hired employees in department or not all books was returned';
      return res.status(409).send();
    }

    await deleteRecord(req.params.id, dbTablesNamesEnum.DEPARTMENTS);

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
