/**
 * IROUP Database V2.2 admin authentication/authorization helpers.
 *
 * Lightweight guard layer for isolated V2 admin/test APIs. This file is not
 * wired into production Code.gs and does not create public routes.
 */

const IROUP_V2_AUTH_CACHE_VERSION = '2026-07-13-v1';
const IROUP_V2_GOOGLE_AUTH_CACHE_TTL_SECONDS = 300;
const IROUP_V2_ADMIN_CACHE_TTL_SECONDS = 60;
const IROUP_V2_ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
const IROUP_V2_ADMIN_TOKEN_SECRET_PROPERTY = 'IROUP_V2_ADMIN_TOKEN_SECRET';

function getV2AuthCache_() {
  try {
    return CacheService.getScriptCache();
  } catch (err) {
    return null;
  }
}

function getV2AuthCacheValue_(key) {
  const cache = getV2AuthCache_();
  if (!cache || !key) return '';

  try {
    return String(cache.get(key) || '');
  } catch (err) {
    return '';
  }
}

function putV2AuthCacheValue_(key, value, ttlSeconds) {
  const cache = getV2AuthCache_();
  if (!cache || !key || !value) return;

  try {
    cache.put(key, String(value), Number(ttlSeconds || 60));
  } catch (err) {
    // Authentication must keep working when Apps Script cache is unavailable.
  }
}

function getV2GoogleAuthCacheKey_(token) {
  return 'v2auth:' + IROUP_V2_AUTH_CACHE_VERSION + ':google:' + sha256HexV2_(token);
}

function getV2AdminCacheKey_(email) {
  return 'v2auth:' + IROUP_V2_AUTH_CACHE_VERSION + ':admin:' + sha256HexV2_(normalizeV2Email_(email));
}

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

function getV2GoogleToken_(request) {
  return String(
    getV2RequestParam_(request, 'googleAccessToken') ||
    getV2RequestParam_(request, 'google_access_token') ||
    getV2RequestParam_(request, 'accessToken') ||
    getV2RequestParam_(request, 'access_token') ||
    getV2RequestParam_(request, 'idToken') ||
    getV2RequestParam_(request, 'id_token') ||
    ''
  ).trim();
}

function getV2AdminEmailFromToken_(request) {
  const googleToken = getV2GoogleToken_(request);
  let google = authResponseV2_(false, null, 'Google token missing', 'V2_AUTH_GOOGLE_TOKEN_MISSING');
  if (googleToken) {
    google = getV2AdminEmailFromGoogleToken_(googleToken);
    if (google.success) return google;
  }

  const token = getV2AdminToken_(request);
  if (!token) {
    return authResponseV2_(false, null, google.error || 'Missing Google token or legacy adminToken', google.code || 'V2_AUTH_TOKEN_REQUIRED');
  }

  const mapped = getV2AdminEmailFromTokenMap_(token);
  if (mapped.success) return mapped;

  const signed = getV2AdminEmailFromSignedToken_(token);
  if (signed.success) return signed;

  const legacyGoogle = getV2AdminEmailFromGoogleToken_(token);
  if (legacyGoogle.success) return legacyGoogle;

  return authResponseV2_(
    false,
    null,
    googleToken ? (google.error || mapped.error || signed.error || 'Invalid or unverifiable admin token') : (mapped.error || signed.error || legacyGoogle.error || 'Invalid or unverifiable adminToken'),
    googleToken ? (google.code || 'V2_AUTH_TOKEN_INVALID') : 'V2_AUTH_TOKEN_INVALID'
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

function getV2AdminEmailFromSignedToken_(token, secretOverride, nowMs) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3 || parts[0] !== 'v2adm') {
      return authResponseV2_(false, null, 'Not a V2 signed admin token', 'V2_AUTH_SIGNED_TOKEN_FORMAT');
    }

    const secret = String(secretOverride || PropertiesService.getScriptProperties().getProperty(IROUP_V2_ADMIN_TOKEN_SECRET_PROPERTY) || '').trim();
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
    const currentTimeMs = Number(typeof nowMs === 'number' ? nowMs : Date.now());
    if (exp && currentTimeMs > exp * 1000) {
      return authResponseV2_(false, null, 'V2 signed admin token expired', 'V2_AUTH_SIGNED_TOKEN_EXPIRED');
    }

    return authResponseV2_(true, { email: email, source: 'signed_token' }, '', '');
  } catch (err) {
    return authResponseV2_(false, null, 'V2 signed admin token verification failed: ' + (err && err.message ? err.message : err), 'V2_AUTH_SIGNED_TOKEN_ERROR');
  }
}

function createV2AdminSession_(request) {
  const googleToken = getV2GoogleToken_(request);
  const google = getV2AdminEmailFromGoogleToken_(googleToken);
  if (!google.success || !google.user || !google.user.email) {
    return {
      success: false,
      data: null,
      total: 0,
      error: google.error || 'Google authentication failed'
    };
  }

  const admin = getV2AdminByEmail_(google.user.email);
  if (!admin.success || !admin.user) {
    return {
      success: false,
      data: null,
      total: 0,
      error: admin.error || 'Email is not authorized for V2 admin access'
    };
  }

  const issued = issueV2SignedAdminToken_(admin.user);
  if (!issued.success) {
    return {
      success: false,
      data: null,
      total: 0,
      error: issued.error || 'Unable to create iROUP admin session'
    };
  }

  return {
    success: true,
    data: {
      admin_token: issued.token,
      expires_at: issued.expires_at,
      expires_in: IROUP_V2_ADMIN_SESSION_TTL_SECONDS,
      user: admin.user
    },
    total: 1,
    error: ''
  };
}

function issueV2SignedAdminToken_(user, secretOverride, nowMs) {
  try {
    const email = normalizeV2Email_(user && user.email);
    if (!email) {
      return { success: false, token: '', expires_at: '', error: 'Missing admin email for session token' };
    }

    const secret = String(secretOverride || getOrCreateV2AdminTokenSecret_() || '').trim();
    if (!secret) {
      return { success: false, token: '', expires_at: '', error: 'Unable to initialize iROUP admin session secret' };
    }

    const issuedAt = Math.floor(Number(typeof nowMs === 'number' ? nowMs : Date.now()) / 1000);
    const expiresAt = issuedAt + IROUP_V2_ADMIN_SESSION_TTL_SECONDS;
    const payload = {
      email: email,
      role: String(user && user.role ? user.role : '').trim(),
      iat: issuedAt,
      exp: expiresAt,
      ver: 1
    };
    const payloadPart = Utilities.base64EncodeWebSafe(
      Utilities.newBlob(JSON.stringify(payload), 'application/json').getBytes()
    ).replace(/=+$/g, '');
    const unsigned = 'v2adm.' + payloadPart;
    const signature = hmacSha256Base64WebSafeV2_(unsigned, secret);

    return {
      success: true,
      token: unsigned + '.' + signature,
      expires_at: new Date(expiresAt * 1000).toISOString(),
      error: ''
    };
  } catch (err) {
    return {
      success: false,
      token: '',
      expires_at: '',
      error: 'Unable to create iROUP admin session: ' + (err && err.message ? err.message : err)
    };
  }
}

function getOrCreateV2AdminTokenSecret_() {
  const properties = PropertiesService.getScriptProperties();
  let secret = String(properties.getProperty(IROUP_V2_ADMIN_TOKEN_SECRET_PROPERTY) || '').trim();
  if (secret) return secret;

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    secret = String(properties.getProperty(IROUP_V2_ADMIN_TOKEN_SECRET_PROPERTY) || '').trim();
    if (!secret) {
      secret = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
      properties.setProperty(IROUP_V2_ADMIN_TOKEN_SECRET_PROPERTY, secret);
    }
    return secret;
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // The generated secret remains valid even if releasing the lock fails.
    }
  }
}

function getV2AdminEmailFromGoogleToken_(token) {
  const raw = String(token || '').trim();
  if (!raw) {
    return authResponseV2_(false, null, 'Google token missing', 'V2_AUTH_GOOGLE_TOKEN_MISSING');
  }

  const cacheKey = getV2GoogleAuthCacheKey_(raw);
  const cachedEmail = normalizeV2Email_(getV2AuthCacheValue_(cacheKey));
  if (cachedEmail) {
    return authResponseV2_(true, { email: cachedEmail, source: 'google_token_cache' }, '', '');
  }

  // Browser-side Google Identity Services currently hands off an OAuth access
  // token, not an ID token. Verify that token through Google userinfo first.
  const access = fetchV2GoogleUserInfo_(raw);
  if (access.success) {
    putV2AuthCacheValue_(cacheKey, access.user.email, IROUP_V2_GOOGLE_AUTH_CACHE_TTL_SECONDS);
    return access;
  }

  if (raw.indexOf('.') < 0) {
    return access;
  }

  const idToken = fetchV2GoogleTokenInfo_(raw);
  if (idToken.success) {
    putV2AuthCacheValue_(cacheKey, idToken.user.email, IROUP_V2_GOOGLE_AUTH_CACHE_TTL_SECONDS);
  }
  return idToken;
}

function fetchV2GoogleUserInfo_(token) {
  try {
    const response = UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });
    const status = response.getResponseCode();
    if (status < 200 || status >= 300) {
      return authResponseV2_(false, null, 'Invalid Google access token via userinfo (HTTP ' + status + ')', 'V2_AUTH_GOOGLE_ACCESS_INVALID');
    }

    const data = JSON.parse(response.getContentText() || '{}');
    const email = normalizeV2Email_(data.email);
    if (!email) return authResponseV2_(false, null, 'Google access token did not return an email', 'V2_AUTH_GOOGLE_EMAIL_REQUIRED');

    const verified = data.verified_email === true || data.email_verified === true || String(data.verified_email || data.email_verified || '').toLowerCase() === 'true';
    if (!verified) return authResponseV2_(false, null, 'Google access token email is not verified', 'V2_AUTH_GOOGLE_EMAIL_UNVERIFIED');

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

  const cacheKey = getV2AdminCacheKey_(target);
  const cached = getV2AuthCacheValue_(cacheKey);
  if (cached) {
    try {
      const cachedUser = JSON.parse(cached);
      if (cachedUser && normalizeV2Email_(cachedUser.email) === target && isTruthyV2_(cachedUser.active)) {
        return authResponseV2_(true, cachedUser, '', '');
      }
    } catch (err) {
      // Ignore malformed cache entries and refresh from the ADMIN sheet.
    }
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

    const user = mapV2AdminUserDto_(row);
    putV2AuthCacheValue_(cacheKey, JSON.stringify(user), IROUP_V2_ADMIN_CACHE_TTL_SECONDS);
    return authResponseV2_(true, user, '', '');
  }

  return authResponseV2_(false, null, 'Email is not authorized for V2 admin access', 'V2_AUTH_ADMIN_NOT_FOUND');
}

function requireV2Admin_(request) {
  if (request && request.user && request.user.email && isTruthyV2_(request.user.active)) {
    return authResponseV2_(true, request.user, '', '');
  }

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
