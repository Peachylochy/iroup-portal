/**
 * IROUP Database V2.2 admin authentication/authorization helpers.
 *
 * Lightweight guard layer for isolated V2 admin/test APIs. This file is not
 * wired into production Code.gs and does not create public routes.
 */

function authResponseV2_(success, user, error, code) {
  return {
    success: !!success,
    user: user || null,
    error: error || '',
    code: code || ''
  };
}

function normalizeV2Email_(email) {
  return String(email || '').trim().toLowerCase();
}

function getV2CurrentUserEmail_() {
  try {
    const email = normalizeV2Email_(Session.getActiveUser().getEmail());
    if (!email) {
      return {
        success: false,
        email: '',
        error: 'No active Apps Script user email available',
        code: 'V2_AUTH_EMAIL_EMPTY'
      };
    }

    return {
      success: true,
      email: email,
      error: '',
      code: ''
    };
  } catch (err) {
    return {
      success: false,
      email: '',
      error: String(err && err.message ? err.message : err),
      code: 'V2_AUTH_EMAIL_ERROR'
    };
  }
}

function getV2AdminByEmail_(email) {
  const target = normalizeV2Email_(email);
  if (!target) {
    return authResponseV2_(false, null, 'Missing admin email', 'V2_AUTH_EMAIL_REQUIRED');
  }

  const admins = readV2Sheet_(IROUP_V2_SHEETS.ADMIN);
  if (!admins.success) {
    return authResponseV2_(false, null, admins.error || 'Unable to read V2 ADMIN table', 'V2_AUTH_ADMIN_READ_FAILED');
  }

  const rows = admins.data || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (normalizeV2Email_(row.email) !== target) continue;

    if (!isTruthyV2_(row.active)) {
      return authResponseV2_(false, null, 'Admin account is inactive', 'V2_AUTH_ADMIN_INACTIVE');
    }

    return authResponseV2_(true, mapV2AdminUserDto_(row), '', '');
  }

  return authResponseV2_(false, null, 'Email is not authorized for V2 admin access', 'V2_AUTH_ADMIN_NOT_FOUND');
}

function requireV2Admin_() {
  const current = getV2CurrentUserEmail_();
  if (!current.success) {
    return authResponseV2_(false, null, current.error, current.code);
  }

  return getV2AdminByEmail_(current.email);
}

function requireV2AdminRole_(allowedRoles) {
  const auth = requireV2Admin_();
  if (!auth.success) return auth;

  const roles = (allowedRoles || []).map(function (role) {
    return String(role || '').trim().toLowerCase();
  }).filter(function (role) {
    return !!role;
  });

  if (!roles.length) {
    return authResponseV2_(false, null, 'No V2 admin roles were allowed for this action', 'V2_AUTH_ROLE_REQUIRED');
  }

  const userRole = String(auth.user.role || '').trim().toLowerCase();
  if (roles.indexOf(userRole) < 0) {
    return authResponseV2_(false, null, 'V2 admin role is not allowed for this action', 'V2_AUTH_ROLE_DENIED');
  }

  return auth;
}

function isV2SuperAdmin_(user) {
  const role = String(user && user.role ? user.role : '').trim().toLowerCase();
  return role === 'super_admin' || role === 'owner';
}

function mapV2AdminUserDto_(row) {
  return {
    admin_id: row.admin_id || '',
    email: normalizeV2Email_(row.email),
    name: row.name || '',
    role: row.role || '',
    active: isTruthyV2_(row.active)
  };
}
