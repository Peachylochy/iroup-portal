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

function extractV2Email_(value) {
  const text = String(value || '').trim();
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return normalizeV2Email_(match ? match[0] : text);
}

function getV2RequestParam_(request, key) {
  if (!request || !key) return '';
  const params = request.params || {};
  const body = request.body || {};
  return String(
    params[key] ||
    body[key] ||
    (request.raw && request.raw[key]) ||
    ''
  ).trim();
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

function getV2AdminToken_(request) {
  return String(
    getV2RequestParam_(request, 'adminToken') ||
    getV2RequestParam_(request, 'authToken') ||
    getV2RequestParam_(request, 'token') ||
    ''
  ).trim();
}

function getV2AdminEmailFromToken_(request) {
  const token = getV2AdminToken_(request);
  if (!token) {
    return authResponseV2_(false, null, 'Missing adminToken', 'V2_AUTH_TOKEN_REQUIRED');
  }

  const mapped = getV2AdminEmailFromTokenMap_(token);
  if (mapped.success) return mapped;

  const signed = getV2AdminEmailFromSignedToken_(token);
  if (signed.success) return signed;

  const google = getV2AdminEmailFromGoogleToken_(token);
  if (google.success) return google;

  return authResponseV2_(
    false,
    null,
    mapped.error || signed.error || google.error || 'Invalid or unverifiable adminToken',
    'V2_AUTH_TOKEN_INVALID'
  );
}

function getV2AdminEmailFromTokenMap_(token) {
  try {
    const loaded = loadV2AdminTokenMap_();
    if (!loaded.success) return authResponseV2_(false, null, loaded.error, loaded.code);

    const hash = sha256HexV2_(token);
    const email = extractV2Email_(loaded.map[hash] || '');
    if (!email) return authResponseV2_(false, null, 'Admin token is not mapped', 'V2_AUTH_TOKEN_NOT_MAPPED');

    return authResponseV2_(true, { email: email, source: 'token_map' }, '', '');
  } catch (err) {
    return authResponseV2_(false, null, 'V2 admin token map read failed: ' + (err && err.message ? err.message : err), 'V2_AUTH_TOKEN_MAP_ERROR');
  }
}

function loadV2AdminTokenMap_() {
  try {
    const json = String(PropertiesService.getScriptProperties().getProperty('IROUP_V2_ADMIN_TOKEN_MAP_JSON') || '').trim();
    if (!json) {
      return {
        success: false,
        map: {},
        error: 'No V2 admin token map configured',
        code: 'V2_AUTH_TOKEN_MAP_EMPTY'
      };
    }

    const parsed = JSON.parse(json);
    const normalized = {};
    Object.keys(parsed || {}).forEach(function (key) {
      const normalizedKey = String(key || '').trim().toLowerCase();
      if (normalizedKey) normalized[normalizedKey] = parsed[key];
    });

    return {
      success: true,
      map: normalized,
      error: '',
      code: ''
    };
  } catch (err) {
    return {
      success: false,
      map: {},
      error: 'V2 admin token map read failed: ' + (err && err.message ? err.message : err),
      code: 'V2_AUTH_TOKEN_MAP_ERROR'
    };
  }
}

function debugV2AdminTokenMap_(request) {
  try {
    const props = PropertiesService.getScriptProperties();
    const expectedDebugToken = String(props.getProperty('IROUP_V2_DEBUG_TOKEN') || '').trim();
    const suppliedDebugToken = getV2RequestParam_(request, 'debugToken');
    if (!expectedDebugToken) {
      return {
        success: false,
        data: null,
        total: 0,
        error: 'V2 debug token is not configured'
      };
    }
    if (!suppliedDebugToken || !constantTimeEqualsV2_(expectedDebugToken, suppliedDebugToken)) {
      return {
        success: false,
        data: null,
        total: 0,
        error: 'V2 debug token is invalid'
      };
    }

    const propertyKey = 'IROUP_V2_ADMIN_TOKEN_MAP_JSON';
    const raw = String(props.getProperty(propertyKey) || '');
    let parsed = {};
    let parseSuccess = false;
    let parseError = '';
    try {
      parsed = JSON.parse(raw || '{}');
      parseSuccess = true;
    } catch (err) {
      parseError = err && err.message ? err.message : String(err);
    }

    const normalizedMap = {};
    const normalizedKeys = parseSuccess ? Object.keys(parsed || {}).map(function (key) {
      const normalizedKey = String(key || '').trim().toLowerCase();
      if (normalizedKey) normalizedMap[normalizedKey] = parsed[key];
      return normalizedKey;
    }).filter(function (key) {
      return !!key;
    }) : [];
    const token = getV2AdminToken_(request);
    const tokenHash = token ? sha256HexV2_(token) : '';
    const matchedValue = tokenHash && parseSuccess ? normalizedMap[tokenHash] || '' : '';

    return {
      success: true,
      data: {
        property_key: propertyKey,
        property_exists: !!raw,
        property_length: raw.length,
        parse_success: parseSuccess,
        parse_error: parseError,
        mapped_hash_count: normalizedKeys.length,
        token_supplied: !!token,
        token_hash_prefix: tokenHash ? tokenHash.slice(0, 8) : '',
        token_hash_suffix: tokenHash ? tokenHash.slice(-8) : '',
        token_hash_mapped: normalizedKeys.indexOf(tokenHash) >= 0,
        matched_value_has_email: !!extractV2Email_(matchedValue),
        matched_value_looks_markdown: /^\s*\[.+\]\(mailto:.+\)\s*$/i.test(String(matchedValue || ''))
      },
      total: 1,
      error: ''
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      total: 0,
      error: err && err.message ? err.message : String(err)
    };
  }
}

function getV2AdminEmailFromSignedToken_(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3 || parts[0] !== 'v2adm') {
      return authResponseV2_(false, null, 'Not a V2 signed admin token', 'V2_AUTH_SIGNED_TOKEN_FORMAT');
    }

    const secret = String(PropertiesService.getScriptProperties().getProperty('IROUP_V2_ADMIN_TOKEN_SECRET') || '').trim();
    if (!secret) return authResponseV2_(false, null, 'No V2 admin token secret configured', 'V2_AUTH_SIGNED_TOKEN_SECRET_MISSING');

    const unsigned = parts[0] + '.' + parts[1];
    const expected = hmacSha256Base64WebSafeV2_(unsigned, secret);
    if (!constantTimeEqualsV2_(expected, parts[2])) {
      return authResponseV2_(false, null, 'Invalid V2 signed admin token signature', 'V2_AUTH_SIGNED_TOKEN_BAD_SIGNATURE');
    }

    const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString());
    const email = normalizeV2Email_(payload.email);
    if (!email) return authResponseV2_(false, null, 'V2 signed admin token missing email', 'V2_AUTH_SIGNED_TOKEN_EMAIL_REQUIRED');

    const exp = Number(payload.exp || 0);
    if (exp && Date.now() > exp * 1000) {
      return authResponseV2_(false, null, 'V2 signed admin token expired', 'V2_AUTH_SIGNED_TOKEN_EXPIRED');
    }

    return authResponseV2_(true, { email: email, source: 'signed_token' }, '', '');
  } catch (err) {
    return authResponseV2_(false, null, 'V2 signed admin token verification failed: ' + (err && err.message ? err.message : err), 'V2_AUTH_SIGNED_TOKEN_ERROR');
  }
}

function getV2AdminEmailFromGoogleToken_(token) {
  const raw = String(token || '').trim();
  if (!raw || raw.indexOf('.') < 0) {
    return authResponseV2_(false, null, 'Not a Google token candidate', 'V2_AUTH_GOOGLE_TOKEN_FORMAT');
  }

  const access = fetchV2GoogleUserInfo_(raw);
  if (access.success) return access;

  return fetchV2GoogleTokenInfo_(raw);
}

function fetchV2GoogleUserInfo_(token) {
  try {
    const response = UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return authResponseV2_(false, null, 'Invalid Google access token', 'V2_AUTH_GOOGLE_ACCESS_INVALID');
    }

    const data = JSON.parse(response.getContentText() || '{}');
    const email = normalizeV2Email_(data.email);
    if (!email) return authResponseV2_(false, null, 'Google access token did not return an email', 'V2_AUTH_GOOGLE_EMAIL_REQUIRED');

    return authResponseV2_(true, { email: email, source: 'google_access_token' }, '', '');
  } catch (err) {
    return authResponseV2_(false, null, 'Google access token verification failed: ' + (err && err.message ? err.message : err), 'V2_AUTH_GOOGLE_ACCESS_ERROR');
  }
}

function fetchV2GoogleTokenInfo_(token) {
  try {
    const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), {
      method: 'get',
      muteHttpExceptions: true
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return authResponseV2_(false, null, 'Invalid Google ID token', 'V2_AUTH_GOOGLE_ID_INVALID');
    }

    const data = JSON.parse(response.getContentText() || '{}');
    const email = normalizeV2Email_(data.email);
    if (!email) return authResponseV2_(false, null, 'Google ID token did not return an email', 'V2_AUTH_GOOGLE_EMAIL_REQUIRED');

    return authResponseV2_(true, { email: email, source: 'google_id_token' }, '', '');
  } catch (err) {
    return authResponseV2_(false, null, 'Google ID token verification failed: ' + (err && err.message ? err.message : err), 'V2_AUTH_GOOGLE_ID_ERROR');
  }
}

function sha256HexV2_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value || ''));
  return bytes.map(function (byte) {
    const v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function hmacSha256Base64WebSafeV2_(value, secret) {
  const bytes = Utilities.computeHmacSha256Signature(String(value || ''), String(secret || ''));
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, '');
}

function constantTimeEqualsV2_(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  let diff = left.length ^ right.length;
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i++) {
    diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return diff === 0;
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

function requireV2Admin_(request) {
  const tokenEmail = getV2AdminEmailFromToken_(request);
  if (tokenEmail.success && tokenEmail.user && tokenEmail.user.email) {
    return getV2AdminByEmail_(tokenEmail.user.email);
  }

  const current = getV2CurrentUserEmail_();
  if (current.success) {
    return getV2AdminByEmail_(current.email);
  }

  return authResponseV2_(
    false,
    null,
    tokenEmail.error || current.error || 'V2 admin authorization failed',
    tokenEmail.code || current.code || 'V2_AUTH_FAILED'
  );
}

function requireV2AdminRole_(allowedRoles, request) {
  const auth = requireV2Admin_(request);
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
