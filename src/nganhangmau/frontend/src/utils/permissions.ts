import { User } from '@/types/api.types';
import { ROLES } from './constants';

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.vaitro);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, [ROLES.ADMIN]);
}

/**
 * Check if user is staff (medical staff)
 */
export function isStaff(user: User | null): boolean {
  return hasRole(user, [ROLES.ADMIN, ROLES.STAFF]);
}

/**
 * Check if user can create/edit records
 */
export function canEdit(user: User | null): boolean {
  return hasRole(user, [ROLES.ADMIN, ROLES.STAFF]);
}

/**
 * Check if user can delete records
 */
export function canDelete(user: User | null): boolean {
  return hasRole(user, [ROLES.ADMIN]);
}

/**
 * Check if user can view monthly reports
 */
export function canViewMonthlyReport(user: User | null): boolean {
  return hasRole(user, [ROLES.ADMIN]);
}

/**
 * Check if user can manage warehouses
 */
export function canManageWarehouse(user: User | null): boolean {
  return hasRole(user, [ROLES.ADMIN, ROLES.STAFF]);
}
