import {
  changeRecordData,
  createRecord,
  deleteRecord,
  getUserBySession,
  increaseValueBy,
  hasDublicatedValue,
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

    if (await isContactNumberDuplicated(scheme.body.contactNumber)) {
      res.statusMessage = 'Phone number already has been used';
      return res.status(409).send();
    }

    const id = await createRecord(dbTablesNamesEnum.DEPARTMENTS, scheme.body);

    if (hasActualManagerIdField) {
      await setDepartmentIdOfManager(managerID, id);
      await increaseEmployeeAmountByOne(id);
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
    const departmentID = req.params.id;
    const department = await getDepartmentByID(departmentID);
    const scheme = getSchemeFields(req, defaultDepartmentScheme);
    const managerID = scheme.body.actualManagerID;
    const requestAuthor = await getUserBySession(req.cookies.sessionID);

    if (requestAuthor.role === rolesEnum.LIBRARIAN) {
      return res.status(403).send();
    }

    if (
      department.contactNumber !== scheme.body.contactNumber &&
      (await isContactNumberDuplicated(req.body.contactNumber))
    ) {
      res.statusMessage = 'Phone number already has been used';
      return res.status(409).send();
    }

    if (Object.hasOwn(scheme.body, 'actualManagerID')) {
      if (requestAuthor.role !== rolesEnum.ADMIN) {
        return res.status(403).send();
      }

      if (!(await newActualManagerValidator(managerID, res))) return;

      await setDepartmentIdOfManager(managerID, departmentID);

      if (department.actualManagerID === null) {
        await increaseEmployeeAmountByOne(departmentID);
      }
    }

    if (
      requestAuthor.role === rolesEnum.DEPARTMENT_MANAGER &&
      +requestAuthor.departmentID !== +departmentID
    ) {
      res.statusMessage =
        'You do not have permission as manager of another department';
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
    const department = await getDepartmentByID(req.params.id);

    if (
      department.wholeBooksAmount !== 0 ||
      department.givenBooksAmount !== 0 ||
      department.employeesAmount !== 0
    ) {
      res.statusMessage =
        'There are books or hired employees in department or not all books was returned';
      return res.status(409).send();
    }

    await deleteRecord(req.params.id, dbTablesNamesEnum.DEPARTMENTS);

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

async function getDepartmentByID(id) {
  return (await queryRecords(dbTablesNamesEnum.DEPARTMENTS, { id }))[0];
}

async function isContactNumberDuplicated(value) {
  return await hasDublicatedValue(
    dbTablesNamesEnum.DEPARTMENTS,
    'contactNumber',
    value
  );
}

async function setDepartmentIdOfManager(managerID, departmentID) {
  await changeRecordData(managerID, dbTablesNamesEnum.EMPLOYEES, {
    departmentID,
  });
}

async function increaseEmployeeAmountByOne(departmentID) {
  await increaseValueBy(
    dbTablesNamesEnum.DEPARTMENTS,
    departmentID,
    'employeesAmount',
    1
  );
}
