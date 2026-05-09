// ============================================================
// iROUP — CLEAN API Backend (Google Apps Script)
// ใช้ไฟล์นี้แทน Code.gs เดิม แล้ว Deploy เป็น New version
// ============================================================

const SPREADSHEET_ID = '1vFXbyT72DPTqAju_wChmLFUw8lpWC0Dq3URdo5Q0kkw';

const SHEET_NAMES = {
  STAFF:    'บุคลากร',
  MOU:      'MOU',
  SCHOLAR:  'ทุนการศึกษา',
  EVENT:    'กิจกรรม',
  TRAVEL:   'การเดินทาง',
  INBOUND:  'Inbound',
  OUTBOUND: 'Outbound',
  ADMIN:    'Admin',
};

const SHEET_ALIASES = {
  staff: SHEET_NAMES.STAFF,
  mou: SHEET_NAMES.MOU,
  scholarship: SHEET_NAMES.SCHOLAR,
  scholar: SHEET_NAMES.SCHOLAR,
  event: SHEET_NAMES.EVENT,
  events: SHEET_NAMES.EVENT,
  travel: SHEET_NAMES.TRAVEL,
  inbound: SHEET_NAMES.INBOUND,
  outbound: SHEET_NAMES.OUTBOUND,
  admin: SHEET_NAMES.ADMIN,
};

const AUTH_MODE_PROPERTY = 'IROUP_AUTH_MODE';
const AUTH_MODE_COMPAT = 'compat';
const AUTH_MODE_ENFORCE = 'enforce';
const ADMIN_SESSION_PREFIX = 'iroup_admin_session_';
const ADMIN_SESSION_TTL_SECONDS = 6 * 60 * 60;

function getSS() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  return handleRequest_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  let body = {};
  try {
    body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  } catch (err) {
    return json_({ success: false, error: 'Invalid JSON body: ' + err.message });
  }
  return handleRequest_(body);
}

function handleRequest_(params) {
  const action = String(params.action || '').trim();
  let result;

  try {
    const guard = guardAdminLegacyAction_(action, params);
    if (!guard.allowed) return json_(guard);

    switch (action) {
      case 'ping':
        result = { success: true, message: 'iROUP API ready', time: new Date().toISOString() };
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'getAll':
        result = getAll(resolveSheet_(params.sheet || params.type));
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'search':
        result = search(resolveSheet_(params.sheet || params.type), params.q || params.query || '');
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'searchStaff':
        result = searchStaff(params.q || params.query || '');
        break;

      case 'getStats':
        result = getStats();
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'getReport':
        result = getReport(params);
        break;

      case 'getMouByCountry':
        result = getMouByCountry();
        break;

      case 'getPublicMou':
        result = getPublicMou();
        break;

      case 'getPublicMobility':
        result = getPublicMobility();
        break;

      case 'getPublicTravel':
        result = getPublicTravel();
        break;

      case 'getPublicScholarships':
        result = getPublicScholarships();
        break;

      case 'getPublicEvents':
        result = getPublicEvents();
        break;

      case 'getPublicStats':
        result = getPublicStats();
        break;

      case 'createAdminSession':
        result = createAdminSession(params.googleToken || params.idToken || params.accessToken || '');
        break;

      case 'checkAdmin':
        result = checkAdmin(params.email || '');
        break;

      // Compatibility endpoints for old frontend pages
      case 'getMOU':
      case 'getMou':
        result = getAll(SHEET_NAMES.MOU);
        break;

      case 'getScholarship':
      case 'getScholarships':
      case 'getScholar':
        result = getAll(SHEET_NAMES.SCHOLAR);
        break;

      case 'getEvents':
      case 'getEvent':
        result = getAll(SHEET_NAMES.EVENT);
        break;

      case 'getTravel':
        result = getAll(SHEET_NAMES.TRAVEL);
        break;

      case 'getInbound':
        result = getAll(SHEET_NAMES.INBOUND);
        break;

      case 'getOutbound':
        result = getAll(SHEET_NAMES.OUTBOUND);
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'add':
        result = addRow(resolveSheet_(params.sheet || params.type), params.data || params);
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'edit':
        result = editRow(resolveSheet_(params.sheet || params.type), params.id, params.data || params);
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'delete':
        result = deleteRow(resolveSheet_(params.sheet || params.type), params.id);
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'uploadImage':
        result = uploadImage(params.base64, params.fileName, params.folderName);
        break;

      // ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
      case 'uploadFile':
        result = uploadFile(params.base64, params.fileName, params.folderName);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message, stack: err.stack };
  }

  return json_(result);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function resolveSheet_(name) {
  const key = String(name || '').trim();
  if (!key) return '';
  return SHEET_ALIASES[key.toLowerCase()] || key;
}

// ============================================================
// Auth guard foundation
// ============================================================

function isPublicAction_(action) {
  const publicActions = [
    'ping',
    'getPublicMou',
    'getPublicMobility',
    'getPublicTravel',
    'getPublicScholarships',
    'getPublicEvents',
    'getPublicStats',
    'createAdminSession'
  ];
  return publicActions.indexOf(String(action || '').trim()) >= 0;
}

function isWriteAction_(action) {
  const writeActions = ['add', 'edit', 'delete'];
  return writeActions.indexOf(String(action || '').trim()) >= 0;
}

function isUploadAction_(action) {
  const uploadActions = ['uploadFile', 'uploadImage'];
  return uploadActions.indexOf(String(action || '').trim()) >= 0;
}

function isAdminLegacyAction_(action) {
  const key = String(action || '').trim();
  if (!key || isPublicAction_(key)) return false;

  const adminLegacyActions = [
    'getAll',
    'search',
    'searchStaff',
    'getStats',
    'getReport',
    'getMouByCountry',
    'checkAdmin',
    'getMOU',
    'getMou',
    'getScholarship',
    'getScholarships',
    'getScholar',
    'getEvents',
    'getEvent',
    'getTravel',
    'getInbound',
    'getOutbound',
    'add',
    'edit',
    'delete',
    'uploadImage',
    'uploadFile'
  ];
  return adminLegacyActions.indexOf(key) >= 0;
}

function getAuthMode_() {
  const mode = String(PropertiesService.getScriptProperties().getProperty(AUTH_MODE_PROPERTY) || AUTH_MODE_COMPAT)
    .toLowerCase()
    .trim();
  return mode === AUTH_MODE_ENFORCE ? AUTH_MODE_ENFORCE : AUTH_MODE_COMPAT;
}

function guardAdminLegacyAction_(action, params) {
  if (!isAdminLegacyAction_(action)) return { success: true, allowed: true };

  const auth = requireAdmin_(params || {});
  if (auth.allowed) return auth;

  if (getAuthMode_() === AUTH_MODE_ENFORCE) {
    return {
      success: false,
      allowed: false,
      error: 'Admin authorization required',
      action: action
    };
  }

  logAuthWarning_(action, auth.reason || 'Missing or invalid adminToken');
  return { success: true, allowed: true, compat: true };
}

function requireAdmin_(params) {
  const token = String(
    params.adminToken ||
    params.authToken ||
    params.token ||
    ''
  ).trim();

  if (!token) {
    return { success: false, allowed: false, reason: 'Missing adminToken' };
  }

  return isAdminSessionValid_(token);
}

function createAdminSession(googleToken) {
  const verified = verifyGoogleToken_(googleToken);
  if (!verified.success) return verified;

  const admin = getAdminRecordByEmail_(verified.email);
  if (!admin.allowed) return admin;

  const adminToken = Utilities.getUuid() + '-' + Utilities.getUuid();
  const session = {
    email: verified.email,
    name: admin.name || verified.name || verified.email,
    role: admin.role || 'admin',
    createdAt: new Date().toISOString()
  };

  CacheService.getScriptCache().put(
    ADMIN_SESSION_PREFIX + adminToken,
    JSON.stringify(session),
    ADMIN_SESSION_TTL_SECONDS
  );

  return {
    success: true,
    allowed: true,
    adminToken: adminToken,
    expiresIn: ADMIN_SESSION_TTL_SECONDS,
    user: {
      email: session.email,
      name: session.name,
      role: session.role
    }
  };
}

function verifyGoogleToken_(token) {
  const raw = String(token || '').trim();
  if (!raw) {
    return {
      success: false,
      allowed: false,
      error: 'Missing Google token',
      todo: 'Frontend must send a verified Google access token or ID token before auth enforcement.'
    };
  }

  const accessTokenResult = fetchGoogleUserInfo_(raw);
  if (accessTokenResult.success) return accessTokenResult;

  return fetchGoogleTokenInfo_(raw);
}

function fetchGoogleUserInfo_(token) {
  try {
    const response = UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'get',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return { success: false, allowed: false, error: 'Invalid Google access token' };
    }

    const data = JSON.parse(response.getContentText() || '{}');
    const email = String(data.email || '').toLowerCase().trim();
    if (!email) return { success: false, allowed: false, error: 'Google token did not return an email' };

    return {
      success: true,
      allowed: true,
      email: email,
      name: data.name || email
    };
  } catch (err) {
    return { success: false, allowed: false, error: 'Google token verification failed: ' + err.message };
  }
}

function fetchGoogleTokenInfo_(token) {
  try {
    const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), {
      method: 'get',
      muteHttpExceptions: true
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return { success: false, allowed: false, error: 'Invalid Google token' };
    }

    const data = JSON.parse(response.getContentText() || '{}');
    const email = String(data.email || '').toLowerCase().trim();
    if (!email) return { success: false, allowed: false, error: 'Google token did not return an email' };

    return {
      success: true,
      allowed: true,
      email: email,
      name: data.name || email
    };
  } catch (err) {
    return { success: false, allowed: false, error: 'Google token verification failed: ' + err.message };
  }
}

function isAdminSessionValid_(token) {
  const raw = CacheService.getScriptCache().get(ADMIN_SESSION_PREFIX + String(token || '').trim());
  if (!raw) return { success: false, allowed: false, reason: 'Invalid or expired adminToken' };

  try {
    const session = JSON.parse(raw);
    return {
      success: true,
      allowed: true,
      user: {
        email: session.email || '',
        name: session.name || '',
        role: session.role || 'admin'
      }
    };
  } catch (err) {
    return { success: false, allowed: false, reason: 'Invalid admin session payload' };
  }
}

function getAdminRecordByEmail_(email) {
  const sheet = getSS().getSheetByName(SHEET_NAMES.ADMIN);
  if (!sheet) return { success: false, allowed: false, reason: 'ไม่พบ Sheet Admin' };

  const target = String(email || '').toLowerCase().trim();
  if (!target) return { success: false, allowed: false, reason: 'Missing email' };

  const rows = readSheet_(sheet);
  const found = rows.find(r => String(pick_(r, ['email', 'Email', 'อีเมล'], '')).toLowerCase().trim() === target);
  if (!found) return { success: true, allowed: false, reason: 'Email นี้ไม่มีสิทธิ์เข้าใช้งาน' };

  return {
    success: true,
    allowed: true,
    name: pick_(found, ['ชื่อ-สกุล', 'ชื่อ_สกุล', 'name'], email),
    role: pick_(found, ['role', 'Role', 'สิทธิ์'], 'admin')
  };
}

function logAuthWarning_(action, reason) {
  try {
    console.warn('ADMIN-ONLY LEGACY ENDPOINT allowed in compat mode:', action, reason);
  } catch (err) {
    // Logging is best-effort only for Apps Script runtime compatibility.
  }
}

// ============================================================
// Core read helpers
// ============================================================

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function getAll(sheetName) {
  const ss = getSS();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet: ' + sheetName, data: [], total: 0 };

  const rows = readSheet_(sheet);
  return { success: true, data: rows, total: rows.length };
}

function readSheet_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h || '').trim());

  return values.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        if (h) obj[h] = normalizeCell_(row[i]);
      });
      return obj;
    });
}

function fastRead_(sheetName) {
  const sheet = getSS().getSheetByName(sheetName);
  return sheet ? readSheet_(sheet) : [];
}

function normalizeCell_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  return value;
}

function pick_(row, keys, fallback) {
  for (const key of keys) {
    const v = row[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return fallback === undefined ? '' : fallback;
}

function search(sheetName, query) {
  const all = getAll(sheetName);
  if (!all.success) return all;
  const q = String(query || '').toLowerCase().trim();
  if (!q) return all;

  const filtered = all.data.filter(row =>
    Object.values(row).some(v => String(v || '').toLowerCase().includes(q))
  );

  return { success: true, data: filtered, total: filtered.length };
}

// ============================================================
// Staff / Admin
// ============================================================

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function searchStaff(query) {
  const q = String(query || '').toLowerCase().trim();
  if (q.length < 2) return { success: true, data: [] };

  const all = getAll(SHEET_NAMES.STAFF);
  if (!all.success) return all;

  const filtered = all.data.filter(row => {
    const fullName = String(pick_(row, ['ชื่อ_สกุล'], `${row['คำนำหน้า'] || ''} ${row['ชื่อ'] || ''} ${row['สกุล'] || ''}`)).toLowerCase();
    const code = String(pick_(row, ['รหัส', 'รหัสบุคลากร'], '')).toLowerCase();
    return fullName.includes(q) || code.includes(q);
  }).slice(0, 10);

  return {
    success: true,
    data: filtered.map(r => ({
      id: pick_(r, ['รหัส', 'รหัสบุคลากร']),
      name: pick_(r, ['ชื่อ_สกุล'], `${r['คำนำหน้า'] || ''} ${r['ชื่อ'] || ''} ${r['สกุล'] || ''}`.trim()),
      faculty: pick_(r, ['คณะ', 'หน่วยงาน_UP', 'หน่วยงาน']),
      dept: pick_(r, ['สาขา', 'ภาควิชา']),
      position: pick_(r, ['ตำแหน่ง']),
      type: pick_(r, ['ประเภท', 'ประเภทบุคลากร']),
      email: pick_(r, ['อีเมล', 'email']),
    }))
  };
}

function checkAdmin(email) {
  const sheet = getSS().getSheetByName(SHEET_NAMES.ADMIN);
  if (!sheet) return { success: false, allowed: false, reason: 'ไม่พบ Sheet Admin' };

  const target = String(email || '').toLowerCase().trim();
  const rows = readSheet_(sheet);

  const found = rows.find(r => String(pick_(r, ['email', 'Email', 'อีเมล'], '')).toLowerCase().trim() === target);
  if (!found) return { success: true, allowed: false, reason: 'Email นี้ไม่มีสิทธิ์เข้าใช้งาน' };

  return {
    success: true,
    allowed: true,
    name: pick_(found, ['ชื่อ-สกุล', 'ชื่อ_สกุล', 'name'], email),
    role: pick_(found, ['role', 'Role', 'สิทธิ์'], 'admin')
  };
}

// ============================================================
// Report / Dashboard
// ============================================================

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function getReport(params) {
  const year = String(params.year || '').trim();
  const cacheKey = 'iroup_report_clean_' + (year || 'all');
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  let mou = fastRead_(SHEET_NAMES.MOU);
  let scholar = fastRead_(SHEET_NAMES.SCHOLAR);
  let event = fastRead_(SHEET_NAMES.EVENT);
  let travel = fastRead_(SHEET_NAMES.TRAVEL);
  let inbound = fastRead_(SHEET_NAMES.INBOUND);
  let outbound = fastRead_(SHEET_NAMES.OUTBOUND);

  if (year) {
    mou = mou.filter(r => rowFiscalYear_(r, ['ปีงบ', 'วันเริ่ม', 'วันสิ้นสุด']) === year);
    scholar = scholar.filter(r => rowFiscalYear_(r, ['ปีงบ', 'วันประชาสัมพันธ์', 'วันเปิดรับ', 'วันปิดรับ']) === year);
    event = event.filter(r => rowFiscalYear_(r, ['ปีงบ', 'วันเริ่ม', 'วันสิ้นสุด']) === year);
    travel = travel.filter(r => rowFiscalYear_(r, ['ปีงบ', 'วันเริ่ม', 'วันสิ้นสุด']) === year);
    inbound = inbound.filter(r => rowFiscalYear_(r, ['ปีงบ', 'วันมาถึง', 'วันกลับ', 'วันเริ่ม', 'วันสิ้นสุด']) === year);
    outbound = outbound.filter(r => rowFiscalYear_(r, ['ปีงบ', 'วันออก', 'วันกลับ', 'วันเริ่ม', 'วันสิ้นสุด']) === year);
  }

  const result = {
    success: true,
    generatedAt: new Date().toISOString(),

    // New shape
    data: { mou, scholar, scholarship: scholar, event, events: event, travel, inbound, outbound },

    // Compatibility shape
    mou,
    scholar,
    scholarship: scholar,
    event,
    events: event,
    travel,
    inbound,
    outbound,

    total: {
      mou: mou.length,
      scholar: scholar.length,
      scholarship: scholar.length,
      event: event.length,
      events: event.length,
      travel: travel.length,
      inbound: inbound.length,
      outbound: outbound.length,
      mobility: inbound.length + outbound.length,
      all: mou.length + scholar.length + event.length + travel.length + inbound.length + outbound.length
    },

    summary: buildSummary_({ mou, scholar, event, travel, inbound, outbound })
  };

  cache.put(cacheKey, JSON.stringify(result), 300);
  return result;
}

function getStats() {
  const r = getReport({});
  const today = startDay_(new Date());

  const mouActive = r.data.mou.filter(m => statusByDate_(m['วันเริ่ม'], m['วันสิ้นสุด'], 180) === 'active').length;
  const mouSoon = r.data.mou.filter(m => statusByDate_(m['วันเริ่ม'], m['วันสิ้นสุด'], 180) === 'soon').length;
  const scholarOpen = r.data.scholar.filter(s => ['active', 'soon', 'urgent'].includes(scholarStatus_(s))).length;
  const travelNow = r.data.travel.filter(t => statusByDate_(pick_(t, ['วันเริ่ม']), pick_(t, ['วันสิ้นสุด'])) === 'active').length;

  return {
    success: true,
    stats: {
      mou: { total: r.total.mou, active: mouActive, soon: mouSoon, countries: r.summary.mouCountries || 0 },
      scholarship: { total: r.total.scholar, open: scholarOpen },
      event: { total: r.total.event },
      travel: { total: r.total.travel, active: travelNow },
      inbound: { total: r.total.inbound },
      outbound: { total: r.total.outbound },
      mobility: { total: r.total.mobility },
      budget: r.summary.budget
    }
  };
}

function getMouByCountry() {
  const mou = fastRead_(SHEET_NAMES.MOU);
  const byCountry = {};
  mou.forEach(m => {
    if (statusByDate_(m['วันเริ่ม'], m['วันสิ้นสุด'], 180) === 'expired') return;
    const c = String(pick_(m, ['ประเทศ'], '')).trim();
    if (!c) return;
    byCountry[c] = (byCountry[c] || 0) + 1;
  });
  return { success: true, data: byCountry };
}

// ============================================================
// Public-safe endpoints
// ============================================================

function getPublicMou() {
  const rows = fastRead_(SHEET_NAMES.MOU).map(sanitizePublicMou_);
  return { success: true, data: rows, total: rows.length };
}

function getPublicMobility() {
  const inbound = fastRead_(SHEET_NAMES.INBOUND).map(r => sanitizePublicMobility_(r, 'inbound'));
  const outbound = fastRead_(SHEET_NAMES.OUTBOUND).map(r => sanitizePublicMobility_(r, 'outbound'));
  return {
    success: true,
    data: inbound.concat(outbound),
    inbound,
    outbound,
    total: inbound.length + outbound.length
  };
}

function getPublicTravel() {
  const rows = fastRead_(SHEET_NAMES.TRAVEL).map(sanitizePublicTravel_);
  return { success: true, data: rows, total: rows.length };
}

function getPublicScholarships() {
  const rows = fastRead_(SHEET_NAMES.SCHOLAR).map(sanitizePublicScholarship_);
  return { success: true, data: rows, total: rows.length };
}

function getPublicEvents() {
  const rows = fastRead_(SHEET_NAMES.EVENT).map(sanitizePublicEvent_);
  return { success: true, data: rows, total: rows.length };
}

function getPublicStats() {
  const mou = getPublicMou().data;
  const mobility = getPublicMobility();
  const travel = getPublicTravel().data;
  const scholarships = getPublicScholarships().data;
  const events = getPublicEvents().data;
  const countries = [
    ...mou.map(r => r.country),
    ...mobility.data.map(r => r.country),
    ...travel.map(r => r.country),
    ...scholarships.map(r => r.country),
    ...events.map(r => r.country),
  ];

  return {
    success: true,
    stats: {
      mou: {
        total: mou.length,
        active: mou.filter(r => r.status === 'active').length,
        soon: mou.filter(r => r.status === 'soon').length,
        countries: uniqueCount_(mou.map(r => r.country))
      },
      mobility: {
        total: mobility.total,
        inbound: mobility.inbound.length,
        outbound: mobility.outbound.length,
        participants: mobility.data.reduce((sum, r) => sum + safeCount_(r), 0)
      },
      travel: {
        total: travel.length,
        participants: travel.reduce((sum, r) => sum + safeCount_(r), 0)
      },
      scholarship: {
        total: scholarships.length,
        open: scholarships.filter(r => ['active', 'soon', 'urgent'].includes(r.status)).length
      },
      event: { total: events.length },
      countries: uniqueCount_(countries),
      byCountry: groupCount_(countries)
    }
  };
}

function sanitizePublicMou_(row) {
  const startDate = pickFirst_(row, ['วันเริ่ม', 'start_date']);
  const endDate = pickFirst_(row, ['วันสิ้นสุด', 'end_date']);
  const fileUrl = pickFirst_(row, ['ไฟล์_URL', 'file_url']);
  const canShowFile = isTruthy_(pickFirst_(row, ['public_file', 'public_file_allowed', 'public_allowed', 'is_public_file']));

  return {
    mou_id: pickFirst_(row, ['ID', 'mou_id']),
    partner_org: pickFirst_(row, ['องค์กร_ตปท', 'องค์กรต่างประเทศ', 'partner_org']),
    country: pickFirst_(row, ['ประเทศ', 'country']),
    continent: pickFirst_(row, ['ทวีป', 'continent']),
    up_unit: pickFirst_(row, ['หน่วยงาน_UP', 'หน่วยงาน', 'up_unit']),
    type: pickFirst_(row, ['ประเภท', 'mou_type', 'type']),
    start_date: startDate,
    end_date: endDate,
    fiscal_year: pickFirst_(row, ['ปีงบ', 'fiscal_year']),
    status: statusByDate_(startDate, endDate, 180),
    public_file_url: canShowFile ? fileUrl : ''
  };
}

function sanitizePublicMobility_(row, direction) {
  const inbound = direction === 'inbound';
  const startDate = inbound
    ? pickFirst_(row, ['วันมาถึง', 'วันเริ่ม', 'start_date'])
    : pickFirst_(row, ['วันออก', 'วันเริ่ม', 'start_date']);
  const endDate = pickFirst_(row, ['วันกลับ', 'วันสิ้นสุด', 'end_date']);

  return {
    direction,
    country: pickFirst_(row, ['ประเทศ', 'country']),
    continent: pickFirst_(row, ['ทวีป', 'continent']),
    up_unit: pickFirst_(row, ['หน่วยงาน_UP', 'คณะ', 'หน่วยงาน', 'up_unit']),
    institution: inbound
      ? pickFirst_(row, ['สถาบันต้นทาง', 'สถาบัน', 'origin_institution'])
      : pickFirst_(row, ['สถาบันปลายทาง', 'สถาบัน_ปลายทาง', 'destination_institution']),
    project: pickFirst_(row, ['โครงการ', 'ชื่อโครงการ', 'project_name']),
    purpose: pickFirst_(row, ['วัตถุประสงค์', 'purpose']),
    participant_type: pickFirst_(row, ['ประเภทผู้เข้าร่วม', 'ประเภท', 'participant_type']),
    participant_count: safeCount_(row),
    fiscal_year: pickFirst_(row, ['ปีงบ', 'fiscal_year']),
    start_date: startDate,
    end_date: endDate,
    status: statusByDate_(startDate, endDate)
  };
}

function sanitizePublicTravel_(row) {
  const startDate = pickFirst_(row, ['วันเริ่ม', 'start_date']);
  const endDate = pickFirst_(row, ['วันสิ้นสุด', 'end_date']);

  return {
    direction: 'travel',
    country: pickFirst_(row, ['ประเทศ', 'country']),
    continent: pickFirst_(row, ['ทวีป', 'continent']),
    city: pickFirst_(row, ['เมือง', 'city']),
    up_unit: pickFirst_(row, ['หน่วยงาน_UP', 'คณะ', 'หน่วยงาน', 'up_unit']),
    project: pickFirst_(row, ['ชื่อโครงการ', 'โครงการ', 'project_name']),
    purpose: pickFirst_(row, ['วัตถุประสงค์', 'purpose']),
    participant_count: safeCount_(row),
    fiscal_year: pickFirst_(row, ['ปีงบ', 'fiscal_year']),
    start_date: startDate,
    end_date: endDate,
    status: statusByDate_(startDate, endDate)
  };
}

function sanitizePublicScholarship_(row) {
  const openDate = pickFirst_(row, ['วันเปิดรับ', 'open_date']);
  const closeDate = pickFirst_(row, ['วันปิดรับ', 'close_date']);
  const fileUrl = pickFirst_(row, ['ไฟล์_URL', 'file_url']);
  const canShowFile = isTruthy_(pickFirst_(row, ['public_file', 'public_file_allowed', 'public_allowed']));

  return {
    scholarship_id: pickFirst_(row, ['ID', 'scholarship_id']),
    title: pickFirst_(row, ['ชื่อทุน', 'title', 'title_th']),
    country: pickFirst_(row, ['ประเทศ', 'country']),
    institution: pickFirst_(row, ['สถาบัน', 'institution']),
    level: pickFirst_(row, ['ระดับ', 'level']),
    publish_date: pickFirst_(row, ['วันประชาสัมพันธ์', 'publish_date']),
    open_date: openDate,
    close_date: closeDate,
    coverage: pickFirst_(row, ['ครอบคลุม', 'coverage']),
    link_url: pickFirst_(row, ['Link', 'link_url', 'detail_url', 'apply_url']),
    poster_url: pickFirst_(row, ['Poster_URL', 'poster_url']),
    public_file_url: canShowFile ? fileUrl : '',
    pin: pickFirst_(row, ['Pin', 'pin']),
    status: scholarStatus_(row)
  };
}

function sanitizePublicEvent_(row) {
  const startDate = pickFirst_(row, ['วันเริ่ม', 'start_date']);
  const endDate = pickFirst_(row, ['วันสิ้นสุด', 'end_date']);
  const fileUrl = pickFirst_(row, ['ไฟล์_URL', 'file_url']);
  const canShowFile = isTruthy_(pickFirst_(row, ['public_file', 'public_file_allowed', 'public_allowed']));

  return {
    event_id: pickFirst_(row, ['ID', 'event_id']),
    title: pickFirst_(row, ['ชื่อกิจกรรม', 'title', 'title_th']),
    type: pickFirst_(row, ['ประเภท', 'event_type', 'type']),
    country: pickFirst_(row, ['ประเทศ', 'country']),
    continent: pickFirst_(row, ['ทวีป', 'continent']),
    organizer: pickFirst_(row, ['หน่วยงาน', 'หน่วยงาน_UP', 'organizer_unit']),
    location: pickFirst_(row, ['สถานที่', 'location']),
    participant_count: safeCount_(row),
    start_date: startDate,
    end_date: endDate,
    start_time: pickFirst_(row, ['เวลาเริ่ม', 'start_time']),
    end_time: pickFirst_(row, ['เวลาสิ้นสุด', 'end_time']),
    detail: pickFirst_(row, ['รายละเอียด', 'detail', 'detail_th']),
    poster_url: pickFirst_(row, ['Poster_URL', 'poster_url']),
    public_file_url: canShowFile ? fileUrl : '',
    status: statusByDate_(startDate, endDate)
  };
}

function safeCount_(row) {
  const explicit = pickFirst_(row, ['participant_count', 'จำนวน', 'จำนวนคน', 'ผู้เข้าร่วม']);
  const n = Number(String(explicit || '').replace(/[^0-9.]/g, ''));
  if (!isNaN(n) && n > 0) return n;

  const nameList = pickFirst_(row, ['ชื่อผู้เดินทาง', 'ชื่อ_สกุล', 'ชื่อ-สกุล', 'ชื่อ']);
  if (nameList) {
    const parts = String(nameList).split(/[,;、，\n]+/).map(v => v.trim()).filter(Boolean);
    return Math.max(parts.length, 1);
  }

  return 1;
}

function pickFirst_(row, keys, fallback) {
  for (const key of keys) {
    const v = row[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return fallback === undefined ? '' : fallback;
}

function isTruthy_(value) {
  const s = String(value || '').trim().toLowerCase();
  return ['true', 'yes', 'y', '1', 'public', 'เผยแพร่', 'ใช่', 'อนุญาต'].indexOf(s) >= 0;
}

function buildSummary_(data) {
  const countries = [
    ...data.mou.map(r => r['ประเทศ']),
    ...data.scholar.map(r => r['ประเทศ']),
    ...data.event.map(r => r['ประเทศ']),
    ...data.travel.map(r => r['ประเทศ']),
    ...data.inbound.map(r => r['ประเทศ']),
    ...data.outbound.map(r => r['ประเทศ']),
  ];

  const faculties = [
    ...data.mou.map(r => pick_(r, ['หน่วยงาน_UP', 'หน่วยงาน'])),
    ...data.event.map(r => pick_(r, ['หน่วยงาน', 'หน่วยงาน_UP'])),
    ...data.travel.map(r => pick_(r, ['คณะ', 'หน่วยงาน_UP', 'หน่วยงาน'])),
    ...data.inbound.map(r => pick_(r, ['หน่วยงาน_UP', 'คณะ'])),
    ...data.outbound.map(r => pick_(r, ['คณะ', 'หน่วยงาน_UP'])),
  ];

  const budget = {
    scholar: sumMoney_(data.scholar, ['จำนวนเงิน', 'งบประมาณ']),
    event: sumMoney_(data.event, ['จำนวนเงิน', 'งบประมาณ']),
    travel: sumMoney_(data.travel, ['จำนวนเงิน', 'งบประมาณ']),
    inbound: sumMoney_(data.inbound, ['จำนวนเงิน', 'งบประมาณ']),
    outbound: sumMoney_(data.outbound, ['จำนวนเงิน', 'งบประมาณ']),
  };
  budget.all = budget.scholar + budget.event + budget.travel + budget.inbound + budget.outbound;

  return {
    countries: uniqueCount_(countries),
    mouCountries: uniqueCount_(data.mou.map(r => r['ประเทศ'])),
    byCountry: groupCount_(countries),
    byFaculty: groupCount_(faculties),
    byScholarLevel: groupCount_(data.scholar.map(r => r['ระดับ'])),
    byEventType: groupCount_(data.event.map(r => r['ประเภท'])),
    byMouType: groupCount_(data.mou.map(r => r['ประเภท'])),
    budget
  };
}

// ============================================================
// Write helpers
// ============================================================

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function addRow(sheetName, data) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet: ' + sheetName };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const payload = Object.assign({}, data || {});

  if (headers.indexOf('ID') >= 0 && !payload.ID) {
    payload.ID = getPrefix_(sheetName) + '-' + String(Math.max(sheet.getLastRow(), 1)).padStart(3, '0');
  }
  if (headers.indexOf('วันที่บันทึก') >= 0 && !payload['วันที่บันทึก']) {
    payload['วันที่บันทึก'] = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  }

  sheet.appendRow(headers.map(h => payload[h] !== undefined ? payload[h] : ''));
  clearCache_();
  return { success: true, id: payload.ID || '', message: 'เพิ่มข้อมูลสำเร็จ' };
}

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function editRow(sheetName, id, data) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet: ' + sheetName };

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('ID');
  if (idCol < 0) return { success: false, error: 'ไม่พบคอลัมน์ ID' };

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      headers.forEach((h, j) => {
        if (data[h] !== undefined) sheet.getRange(i + 1, j + 1).setValue(data[h]);
      });
      clearCache_();
      return { success: true, message: 'แก้ไขข้อมูลสำเร็จ' };
    }
  }
  return { success: false, error: 'ไม่พบ ID: ' + id };
}

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function deleteRow(sheetName, id) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'ไม่พบ Sheet: ' + sheetName };

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('ID');
  if (idCol < 0) return { success: false, error: 'ไม่พบคอลัมน์ ID' };

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      clearCache_();
      return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    }
  }
  return { success: false, error: 'ไม่พบ ID: ' + id };
}

function clearCache_() {
  const cache = CacheService.getScriptCache();
  cache.remove('iroup_report_clean_all');
  for (let y = 2560; y <= 2585; y++) cache.remove('iroup_report_clean_' + y);
}

function getPrefix_(sheetName) {
  const map = {};
  map[SHEET_NAMES.MOU] = 'MOU';
  map[SHEET_NAMES.SCHOLAR] = 'SCH';
  map[SHEET_NAMES.EVENT] = 'EVT';
  map[SHEET_NAMES.TRAVEL] = 'TRV';
  map[SHEET_NAMES.INBOUND] = 'IN';
  map[SHEET_NAMES.OUTBOUND] = 'OUT';
  return map[sheetName] || 'ROW';
}

// ============================================================
// Date / grouping helpers
// ============================================================

function fiscalYearOf_(value) {
  if (!value) return '';
  const s = String(value).trim();
  if (/^25\d{2}$/.test(s)) return s;
  if (/^20\d{2}$/.test(s)) return String(Number(s) + 543);

  const d = new Date(value);
  if (isNaN(d.getTime())) return '';

  let y = d.getFullYear();
  const m = d.getMonth() + 1;
  if (m >= 10) y += 1;
  if (y < 2400) y += 543;
  return String(y);
}

function rowFiscalYear_(row, keys) {
  for (const key of keys) {
    const explicit = String(row[key] || '').trim();
    const fy = fiscalYearOf_(explicit);
    if (fy) return fy;
  }
  return '';
}

function startDay_(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function statusByDate_(startValue, endValue, soonDays) {
  const today = startDay_(new Date());
  const start = new Date(startValue);
  const end = new Date(endValue);
  const validStart = !isNaN(start.getTime());
  const validEnd = !isNaN(end.getTime());

  if (validStart && today < startDay_(start)) return 'upcoming';
  if (validEnd && today > startDay_(end)) return 'expired';

  if (validEnd) {
    const diff = Math.ceil((startDay_(end) - today) / (1000 * 60 * 60 * 24));
    if (soonDays && diff >= 0 && diff <= soonDays) return 'soon';
    if (diff >= 0 && diff <= 7) return 'urgent';
  }
  return 'active';
}

function scholarStatus_(row) {
  return statusByDate_(row['วันเปิดรับ'], row['วันปิดรับ'], 30);
}

function groupCount_(arr) {
  const obj = {};
  arr.map(v => String(v || '').trim()).filter(Boolean).forEach(v => {
    obj[v] = (obj[v] || 0) + 1;
  });
  return obj;
}

function uniqueCount_(arr) {
  return Object.keys(groupCount_(arr)).length;
}

function sumMoney_(rows, keys) {
  return rows.reduce((sum, row) => {
    const v = pick_(row, keys, 0);
    const n = Number(String(v || 0).replace(/,/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

// ============================================================
// Upload helpers
// ============================================================

function getUploadPolicy_() {
  return {
    // TODO: Enforce this policy after adminToken propagation is added to the frontend.
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxBytes: 10 * 1024 * 1024,
    requireAdminToken: true
  };
}

function validateUploadForFuture_(contentType, bytes) {
  const policy = getUploadPolicy_();
  const mime = String(contentType || '').toLowerCase().trim();
  const size = bytes && bytes.length ? bytes.length : 0;

  if (policy.allowedMimeTypes.indexOf(mime) < 0) {
    return { success: false, error: 'Unsupported upload type: ' + contentType };
  }
  if (size > policy.maxBytes) {
    return { success: false, error: 'Upload file is too large' };
  }
  return { success: true };
}

function getOrCreateUploadFolder(folderName) {
  const rootName = 'iROUP Uploads';
  const roots = DriveApp.getFoldersByName(rootName);
  const root = roots.hasNext() ? roots.next() : DriveApp.createFolder(rootName);

  const targetName = folderName || 'General';
  const folders = root.getFoldersByName(targetName);
  return folders.hasNext() ? folders.next() : root.createFolder(targetName);
}

function decodeBase64File(base64, fileName) {
  if (!base64) throw new Error('ไม่พบข้อมูลไฟล์ base64');
  const matches = String(base64).match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');

  const contentType = matches[1];
  const bytes = Utilities.base64Decode(matches[2]);
  return Utilities.newBlob(bytes, contentType, fileName || ('iroup-upload-' + Date.now()));
}

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function uploadFile(base64, fileName, folderName) {
  const folder = getOrCreateUploadFolder(folderName || 'Files');
  const file = folder.createFile(decodeBase64File(base64, fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    success: true,
    url: file.getUrl(),
    fileUrl: file.getUrl(),
    id: file.getId(),
    name: file.getName(),
    mimeType: file.getMimeType()
  };
}

// ADMIN-ONLY LEGACY ENDPOINT — must be protected before production.
function uploadImage(base64, fileName, folderName) {
  return uploadFile(base64, fileName, folderName || 'Images');
  
}
function getEventStatus(start, end){
  const today = new Date();
  const s = new Date(start);
  const e = end ? new Date(end) : s;

  const diff = Math.ceil((s - today) / (1000*60*60*24));

  if(today > e) return { text:'จบแล้ว', cls:'done' };
  if(today >= s && today <= e) return { text:'กำลังจัด', cls:'ongoing' };
  if(diff === 0) return { text:'วันนี้', cls:'today' };
  if(diff <= 7) return { text:`อีก ${diff} วัน`, cls:'soon' };
  return { text:`อีก ${diff} วัน`, cls:'upcoming' };
}
