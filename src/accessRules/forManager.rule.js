import { getUserBySession } from '../helpers/index.js';
import { rolesEnum } from '../shared/index.js';

export function forManagerRule(departmentIDField) {
  return async (req, res, next) => {
    const user = await getUserBySession(
      req.body.sessionID || req.query.sessionID
    );

    if (user.role === rolesEnum.LIBRARIAN) {
      return res.status(400);
    } else if (user.role === rolesEnum.DEPARTMENT_MANAGER) {
      if (req.body[departmentIDField] !== user.role.departmentID) {
        return res.status(400);
      }
    }

    next();
  };
}
