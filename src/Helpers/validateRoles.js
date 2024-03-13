import { getUserBySession } from './database.js';
import { role } from '../enums/index.js';

export function validateRoles (allowedRoles = [role.LIBRARIAN, role.DEPARTMENT_MANAGER, role.ADMIN]) {
    return async (req, res, next) => {
        const sessionID = req.body.sessionID;
        const role = (await getUserBySession(sessionID)).role * 1;

        if (!allowedRoles.includes(role)) {
            return res.status(400).send('Do not have permission');
        }

        next();
    };
}
