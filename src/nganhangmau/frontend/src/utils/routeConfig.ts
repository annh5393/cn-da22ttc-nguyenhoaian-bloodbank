/**
 * Route protection configuration
 * Defines which routes are accessible by each role
 */

import { ROLES } from './constants';

export interface RouteConfig {
  path: RegExp;
  allowedRoles: string[];
  description: string;
}

export const ROUTE_CONFIG: RouteConfig[] = [
  // Dashboard main page - All authenticated users
  {
    path: /^\/dashboard$/,
    allowedRoles: [ROLES.ADMIN, ROLES.STAFF, ROLES.DONOR],
    description: 'Dashboard home page',
  },

  // Profile routes
  {
    path: /^\/dashboard\/profile\/admin/,
    allowedRoles: [ROLES.ADMIN],
    description: 'Admin profile page',
  },
  {
    path: /^\/dashboard\/profile\/staff/,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
    description: 'Staff profile page',
  },
  {
    path: /^\/dashboard\/profile\/donor/,
    allowedRoles: [ROLES.DONOR],
    description: 'Donor profile page',
  },

  // Admin only routes
  {
    path: /^\/dashboard\/nhan-vien/,
    allowedRoles: [ROLES.ADMIN],
    description: 'Manage staff accounts',
  },

  // Staff-only operational routes (Admin không được thao tác)
  {
    path: /^\/dashboard\/nguoi-hien-mau/,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
    description: 'Manage donors',
  },
  {
    path: /^\/dashboard\/phieu-kham/,
    allowedRoles: [ROLES.STAFF],
    description: 'Health check forms',
  },
  {
    path: /^\/dashboard\/phieu-hien/,
    allowedRoles: [ROLES.STAFF],
    description: 'Donation forms',
  },
  {
    path: /^\/dashboard\/kho-mau/,
    allowedRoles: [ROLES.STAFF],
    description: 'Blood warehouse',
  },
  {
    path: /^\/dashboard\/tui-mau\/them/,
    allowedRoles: [ROLES.STAFF],
    description: 'Create blood bag',
  },
  {
    path: /^\/dashboard\/thong-ke/,
    allowedRoles: [ROLES.STAFF, ROLES.ADMIN],
    description: 'Reports and statistics',
  },
  {
    path: /^\/dashboard\/quan-ly-tai-khoan/,
    allowedRoles: [ROLES.ADMIN],
    description: 'Account management (Admin): active + inactive',
  },

  // Donation history - Admin (all) & Donor (own)
  {
    path: /^\/dashboard\/lich-su/,
    allowedRoles: [ROLES.DONOR, ROLES.ADMIN],
    description: 'Donation history',
  },
];

/**
 * Check if a route is allowed for a specific role
 */
export function isRouteAllowedForRole(pathname: string, role: string): boolean {
  const route = ROUTE_CONFIG.find(config => config.path.test(pathname));
  if (!route) return false;
  return route.allowedRoles.includes(role);
}

/**
 * Get all allowed routes for a specific role
 */
export function getAllowedRoutesForRole(role: string): RouteConfig[] {
  return ROUTE_CONFIG.filter(config => config.allowedRoles.includes(role));
}
