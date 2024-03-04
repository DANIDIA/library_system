import { role } from '../enums/index.js';
import { authenticate } from './authenticate.js';

export function allowedRolesDecorator (endpoint, roles = [role.ADMIN, role.DEPARTMENT_MANAGER, role.LIBRARIAN]) {
    return async (req, res) => {
        const sessionID = req.body.sessionID;
        const user = await authenticate(sessionID);

        if (!roles.includes(user.role)) throw 'User does not has a permission';

        endpoint(req, res, user);
    };
}
