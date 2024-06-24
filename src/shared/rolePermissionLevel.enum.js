import { rolesEnum } from './roles.enum.js';

export const rolePermissionLevel = Object.freeze({
  [rolesEnum.ADMIN]: 3,
  [rolesEnum.DEPARTMENT_MANAGER]: 2,
  [rolesEnum.LIBRARIAN]: 1,
});
