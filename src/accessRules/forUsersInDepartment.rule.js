import { getUserBySession } from '../helpers/index.js';
import { rolesEnum } from '../shared/index.js';

export function forUsersInDepartment(departmentIdInParams = true) {
  return async (req, res, next) => {
    const author = await getUserBySession(req.cookies.sessionID);

    const objectToCheck = departmentIdInParams ? req.params : req.body;

    if (
      author.role !== rolesEnum.ADMIN &&
      objectToCheck.departmentID !== author.departmentID
    ) {
      res.statusMessage =
        'You do not have permission as employee of another department';
      return res.status(403).send();
    }

    next();
  };
}
