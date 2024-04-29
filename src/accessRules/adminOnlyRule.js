import { getUserBySession } from '../helpers/index.js';
import { role as roles } from '../enums/index.js';

export function adminOnlyRule () {
    return async (req, res, next) => {
        const user = await getUserBySession(req.body.sessionID);

        if (user.role !== roles.ADMIN) {
            return res.status(400);
        }

        next();
    };
}
