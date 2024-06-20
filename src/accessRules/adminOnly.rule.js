import { getUserBySession } from '../helpers/index.js';
import { rolesEnum } from '../shared/index.js';

export function adminOnlyRule() {
  return async (req, res, next) => {
    const user = await getUserBySession(req.cookies.sessionID);

    if (user.role !== rolesEnum.ADMIN) {
      return res.status(403).send();
    }

    next();
  };
}
