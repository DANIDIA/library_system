import { getUserBySession } from '../Helpers/index.js';
import { role as roles } from '../enums/index.js';

export function forManagerRule (departmentIDField) {
    return async (req, res, next) => {
        const user = await getUserBySession(req.body.sessionID);

        if (user.role === roles.LIBRARIAN) {
            return res.status(400);
        } else if (user.role === roles.DEPARTMENT_MANAGER) {
            if (req.body[departmentIDField] !== user.role.departmentID) {
                return res.status(400);
            }
        }

        next();
    };
}
