/**
 * User role constants to avoid string typos and improve maintainability
 */

export const ROLES = {
    USER: "USER",
    // MANAGER: "MANAGER",
    ADMIN: "ADMIN",
}

/**
 * Common role combinations for route protection
 */
export const ROLE_GROUPS = {
  ALL_USERS: [ROLES.USER, ROLES.ADMIN],
  STAFF: [ROLES.ADMIN],
  ADMINS_ONLY: [ROLES.ADMIN]
};

export default {
  ROLES,
  ROLE_GROUPS
};