import { getUserBySession } from '../helpers/index.js';
import { rolesEnum } from '../shared/index.js';

export function adminOnlyRule() {
  return async (req, res, next) => {
    const user = await getUserBySession(req.body.sessionID);

    if (user.role !== rolesEnum.ADMIN) {
      return res.status(400);
    }

    next();
  };
}
