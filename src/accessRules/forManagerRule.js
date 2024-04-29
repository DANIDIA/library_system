import { getUserBySession } from '../helpers/index.js';
import { role } from '../enums/index.js';

export function forManagerRule (departmentIDField) {
    return async (req, res, next) => {
        const user = await getUserBySession(req.body.sessionID);

        if (user.role === role.LIBRARIAN) {
            return res.status(400);
        } else if (user.role === role.DEPARTMENT_MANAGER) {
            if (req.body[departmentIDField] !== user.role.departmentID) {
                return res.status(400);
            }
        }

        next();
    };
}
