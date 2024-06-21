import { getUserBySession } from '../helpers/index.js';
import { rolesEnum } from '../shared/index.js';

export function forManagerRule(departmentIdField, inRequestBody = true) {
  return async (req, res, next) => {
    const user = await getUserBySession(req.cookies.sessionID);

    if (user.role === rolesEnum.LIBRARIAN) {
      return res.status(403).send();
    }

    const valueToCheck = inRequestBody
      ? req.body[departmentIdField]
      : req.params[departmentIdField];

    if (
      user.role === rolesEnum.DEPARTMENT_MANAGER &&
      +valueToCheck !== user.departmentID
    ) {
      res.statusMessage =
        'You do not have permission as manager of another department';
      return res.status(403).send();
    }

    next();
  };
}
