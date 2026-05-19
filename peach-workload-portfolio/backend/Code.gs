// ============================================================
//  PEACH Workload Portfolio — Google Apps Script Backend
//  สำหรับ นางสาวธาราทิพย์ สูงขาว งานวิเทศสัมพันธ์ มพ.
//  Version: 1.0.0
// ============================================================

// ─── CONFIG ─────────────────────────────────────────────────
var CONFIG = {
  SPREADSHEET_ID: '',          // ← ใส่ ID ของ Google Sheet ที่สร้างไว้
  DRIVE_FOLDER_ID: '',         // ← ใส่ ID ของ Google Drive Folder สำหรับเก็บหลักฐาน
  SHEET_WORKLOADS: 'Workloads',
  SHEET_EVIDENCE: 'Evidence',
  SHEET_CATEGORIES: 'Categories',
  SHEET_USERS: 'Users',
  SHEET_SETTINGS: 'Settings',
};

// ─── CORS HEADERS ────────────────────────────────────────────
function corsHeaders() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── MAIN ENTRY POINTS ───────────────────────────────────────
function doGet(e) {
  var action = e.parameter.action || 'list';
  var resource = e.parameter.resource || 'workloads';

  try {
    if (resource === 'workloads') {
      if (action === 'get' && e.parameter.id) {
        return jsonResponse(getWorkload(e.parameter.id));
      }
      return jsonResponse(listWorkloads(e.parameter));
    }
    if (resource === 'evidence') {
      return jsonResponse(listEvidence(e.parameter));
    }
    if (resource === 'categories') {
      return jsonResponse(getCategories());
    }
    if (resource === 'dashboard') {
      return jsonResponse(getDashboardStats(e.parameter.year));
    }
    if (resource === 'annual-summary') {
      return jsonResponse(getAnnualSummary(e.parameter.year));
    }
    if (resource === 'settings') {
      return jsonResponse(getSettings());
    }
    return jsonResponse({ error: 'Unknown resource', resource: resource });
  } catch (err) {
    return jsonResponse({ error: err.message, stack: err.stack });
  }
}

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ success: false, error: 'Invalid JSON: ' + err.message });
  }

  var action = data.action || e.parameter.action || '';
  var resource = data.resource || e.parameter.resource || 'workloads';

  try {
    if (resource === 'workloads') {
      if (action === 'create') return jsonResponse(createWorkload(data));
      if (action === 'update') return jsonResponse(updateWorkload(data));
      if (action === 'delete') return jsonResponse(deleteWorkload(data.id));
    }
    if (resource === 'evidence') {
      if (action === 'create') return jsonResponse(createEvidence(data));
      if (action === 'delete') return jsonResponse(deleteEvidence(data.id));
    }
    if (resource === 'categories') {
      if (action === 'create') return jsonResponse(createCategory(data));
      if (action === 'update') return jsonResponse(updateCategory(data));
      if (action === 'delete') return jsonResponse(deleteCategory(data.id));
    }
    if (resource === 'ai-import') {
      return jsonResponse(aiImportViaProxy(data));
    }
    if (resource === 'settings' && action === 'updateProfile') {
      return jsonResponse(updateProfileSettings(data));
    }
    if (resource === 'seed') {
      return jsonResponse(seedData());
    }
    if (resource === 'init') {
      return jsonResponse(initSpreadsheet());
    }
    return jsonResponse({ error: 'Unknown action', action: action, resource: resource });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ─── SPREADSHEET HELPER ──────────────────────────────────────
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  // fallback: ใช้ spreadsheet ที่ script ผูกอยู่ (bound script)
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function generateId() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 16);
}

function now() {
  return new Date().toISOString();
}

// ─── INIT SPREADSHEET ────────────────────────────────────────
function initSpreadsheet() {
  var ss = getSpreadsheet();

  // Workloads sheet
  var ws = ss.getSheetByName(CONFIG.SHEET_WORKLOADS) || ss.insertSheet(CONFIG.SHEET_WORKLOADS);
  if (ws.getLastRow() === 0) {
    ws.appendRow(['id','title','category','detail','workDate','hours','year','month',
                  'status','createdAt','updatedAt','evidenceCount']);
    ws.getRange(1,1,1,12).setFontWeight('bold').setBackground('#1e293b').setFontColor('#94a3b8');
  }

  // Evidence sheet
  var es = ss.getSheetByName(CONFIG.SHEET_EVIDENCE) || ss.insertSheet(CONFIG.SHEET_EVIDENCE);
  if (es.getLastRow() === 0) {
    es.appendRow(['id','workloadId','fileName','fileType','driveFileId','driveUrl',
                  'description','uploadedAt']);
    es.getRange(1,1,1,8).setFontWeight('bold').setBackground('#1e293b').setFontColor('#94a3b8');
  }

  // Categories sheet
  var cs = ss.getSheetByName(CONFIG.SHEET_CATEGORIES) || ss.insertSheet(CONFIG.SHEET_CATEGORIES);
  if (cs.getLastRow() === 0) {
    cs.appendRow(['id','name','nameEn','color','icon','description']);
    cs.getRange(1,1,1,6).setFontWeight('bold').setBackground('#1e293b').setFontColor('#94a3b8');
    _seedCategories(cs);
  }

  // Users sheet
  var us = ss.getSheetByName(CONFIG.SHEET_USERS) || ss.insertSheet(CONFIG.SHEET_USERS);
  if (us.getLastRow() === 0) {
    us.appendRow(['id','name','position','department','university','email','createdAt']);
    us.getRange(1,1,1,7).setFontWeight('bold').setBackground('#1e293b').setFontColor('#94a3b8');
    us.appendRow([generateId(),'นางสาวธาราทิพย์ สูงขาว','นักวิชาการศึกษา',
                  'กองวิเทศสัมพันธ์','มหาวิทยาลัยมหาสารคาม',
                  'tharathip.s@msu.ac.th', now()]);
  }

  // Settings sheet
  var ss2 = ss.getSheetByName(CONFIG.SHEET_SETTINGS) || ss.insertSheet(CONFIG.SHEET_SETTINGS);
  if (ss2.getLastRow() === 0) {
    ss2.appendRow(['key','value']);
    ss2.appendRow(['currentYear','2567']);
    ss2.appendRow(['driveFolderId', CONFIG.DRIVE_FOLDER_ID]);
    ss2.appendRow(['ownerName','นางสาวธาราทิพย์ สูงขาว']);
    ss2.appendRow(['department','กองวิเทศสัมพันธ์ มหาวิทยาลัยมหาสารคาม']);
  }

  return { success: true, message: 'Spreadsheet initialized' };
}

function _seedCategories(sheet) {
  var cats = [
    ['CAT01','การต้อนรับแขกต่างชาติ','Receiving Foreign Guests','#06b6d4','🤝','งานต้อนรับคณะผู้แทนและแขกจากต่างประเทศ'],
    ['CAT02','การจัดทำ MOU/MOA','MOU/MOA Management','#8b5cf6','📝','การจัดทำและดูแลบันทึกความเข้าใจ'],
    ['CAT03','การประสานงานทุนการศึกษา','Scholarship Coordination','#f59e0b','🎓','ประสานงานทุนการศึกษาต่างประเทศ'],
    ['CAT04','การแปลเอกสาร','Document Translation','#10b981','🌐','แปลเอกสารราชการและสัญญาต่างๆ'],
    ['CAT05','การจัดอบรม/สัมมนา','Training & Seminar','#f97316','📚','จัดและเข้าร่วมอบรม สัมมนาวิชาการ'],
    ['CAT06','การประชุมวิเทศสัมพันธ์','International Affairs Meeting','#ec4899','🏛️','ประชุมภายในและภายนอกด้านวิเทศสัมพันธ์'],
    ['CAT07','งานโครงการแลกเปลี่ยน','Exchange Program','#14b8a6','✈️','โครงการแลกเปลี่ยนนักศึกษาและบุคลากร'],
    ['CAT08','การดูแลนักศึกษาต่างชาติ','International Student Support','#a78bfa','🌏','ดูแลและให้บริการนักศึกษาต่างชาติ'],
    ['CAT09','การจัดทำเอกสาร/รายงาน','Documentation & Reports','#34d399','📄','จัดทำรายงาน เอกสารราชการ ข้อมูล'],
    ['CAT10','การพัฒนาตนเอง','Self Development','#fb7185','⭐','การอบรม สัมมนา พัฒนาศักยภาพตนเอง'],
    ['CAT11','งานธุรการวิเทศ','International Admin','#60a5fa','🗂️','งานธุรการ สารบรรณ โต้ตอบหนังสือราชการ'],
    ['CAT12','อื่นๆ','Others','#94a3b8','📌','งานอื่นๆ ที่ได้รับมอบหมาย'],
  ];
  cats.forEach(function(cat) { sheet.appendRow(cat); });
}

// ─── WORKLOADS CRUD ──────────────────────────────────────────
function listWorkloads(params) {
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  var headers = data[0];
  var rows = data.slice(1).map(function(row) {
    return rowToObj(headers, row);
  }).filter(function(r) { return r.id; });

  // Filter
  if (params && params.year) rows = rows.filter(function(r) { return r.year == params.year; });
  if (params && params.month) rows = rows.filter(function(r) { return r.month == params.month; });
  if (params && params.category) rows = rows.filter(function(r) { return r.category === params.category; });
  if (params && params.status) rows = rows.filter(function(r) { return r.status === params.status; });

  // Sort by workDate desc
  rows.sort(function(a, b) { return b.workDate > a.workDate ? 1 : -1; });

  return { success: true, data: rows, total: rows.length };
}

function getWorkload(id) {
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) return { success: true, data: rowToObj(headers, data[i]) };
  }
  return { success: false, error: 'Not found' };
}

function createWorkload(payload) {
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var id = generateId();
  var dateStr = payload.workDate || '';
  var year = payload.year || (dateStr ? extractThaiYear(dateStr) : '2567');
  var month = payload.month || (dateStr ? extractMonth(dateStr) : '');

  sheet.appendRow([
    id,
    payload.title || '',
    payload.category || '',
    payload.detail || '',
    dateStr,
    payload.hours || 0,
    year,
    month,
    payload.status || 'เสร็จสิ้น',
    now(),
    now(),
    0
  ]);
  return { success: true, id: id, message: 'Workload created' };
}

function updateWorkload(payload) {
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      var row = i + 1;
      var colMap = {};
      headers.forEach(function(h, idx) { colMap[h] = idx + 1; });

      if (payload.title !== undefined)    sheet.getRange(row, colMap['title']).setValue(payload.title);
      if (payload.category !== undefined) sheet.getRange(row, colMap['category']).setValue(payload.category);
      if (payload.detail !== undefined)   sheet.getRange(row, colMap['detail']).setValue(payload.detail);
      if (payload.workDate !== undefined) sheet.getRange(row, colMap['workDate']).setValue(payload.workDate);
      if (payload.hours !== undefined)    sheet.getRange(row, colMap['hours']).setValue(payload.hours);
      if (payload.status !== undefined)   sheet.getRange(row, colMap['status']).setValue(payload.status);
      if (payload.year !== undefined)     sheet.getRange(row, colMap['year']).setValue(payload.year);
      if (payload.month !== undefined)    sheet.getRange(row, colMap['month']).setValue(payload.month);
      sheet.getRange(row, colMap['updatedAt']).setValue(now());
      return { success: true, message: 'Updated' };
    }
  }
  return { success: false, error: 'Not found' };
}

function deleteWorkload(id) {
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Deleted' };
    }
  }
  return { success: false, error: 'Not found' };
}

// ─── EVIDENCE CRUD ───────────────────────────────────────────
function listEvidence(params) {
  var sheet = getSheet(CONFIG.SHEET_EVIDENCE);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  var headers = data[0];
  var rows = data.slice(1).map(function(row) {
    return rowToObj(headers, row);
  }).filter(function(r) { return r.id; });

  if (params && params.workloadId) {
    rows = rows.filter(function(r) { return r.workloadId === params.workloadId; });
  }
  return { success: true, data: rows, total: rows.length };
}

function createEvidence(payload) {
  var sheet = getSheet(CONFIG.SHEET_EVIDENCE);
  var id = generateId();
  sheet.appendRow([
    id,
    payload.workloadId || '',
    payload.fileName || '',
    payload.fileType || '',
    payload.driveFileId || '',
    payload.driveUrl || '',
    payload.description || '',
    now()
  ]);
  // Update evidenceCount on workload
  _incrementEvidenceCount(payload.workloadId);
  return { success: true, id: id, message: 'Evidence created' };
}

function deleteEvidence(id) {
  var sheet = getSheet(CONFIG.SHEET_EVIDENCE);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var workloadId = data[i][1];
      sheet.deleteRow(i + 1);
      _decrementEvidenceCount(workloadId);
      return { success: true, message: 'Deleted' };
    }
  }
  return { success: false, error: 'Not found' };
}

function _incrementEvidenceCount(workloadId) {
  _updateEvidenceCount(workloadId, 1);
}

function _decrementEvidenceCount(workloadId) {
  _updateEvidenceCount(workloadId, -1);
}

function _updateEvidenceCount(workloadId, delta) {
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colIdx = headers.indexOf('evidenceCount') + 1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === workloadId) {
      var current = parseInt(data[i][colIdx - 1]) || 0;
      sheet.getRange(i + 1, colIdx).setValue(Math.max(0, current + delta));
      break;
    }
  }
}

// ─── CATEGORIES ──────────────────────────────────────────────
function getCategories() {
  var sheet = getSheet(CONFIG.SHEET_CATEGORIES);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };
  var headers = data[0];
  var rows = data.slice(1).map(function(row) { return rowToObj(headers, row); });
  return { success: true, data: rows };
}

function createCategory(payload) {
  var sheet = getSheet(CONFIG.SHEET_CATEGORIES);
  var data = sheet.getDataRange().getValues();
  // Auto-generate ID
  var existingIds = data.slice(1).map(function(r) { return r[0]; });
  var num = 13;
  while (existingIds.indexOf('CAT' + (num < 10 ? '0' + num : String(num))) !== -1) num++;
  var id = payload.id || ('CAT' + (num < 10 ? '0' + num : String(num)));
  sheet.appendRow([
    id,
    payload.name || '',
    payload.nameEn || '',
    payload.color || '#94a3b8',
    payload.icon || '📌',
    payload.description || ''
  ]);
  return { success: true, id: id, message: 'Category created' };
}

function updateCategory(payload) {
  var sheet = getSheet(CONFIG.SHEET_CATEGORIES);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      var row = i + 1;
      var colMap = {};
      headers.forEach(function(h, idx) { colMap[h] = idx + 1; });
      if (payload.name !== undefined)        sheet.getRange(row, colMap['name']).setValue(payload.name);
      if (payload.nameEn !== undefined)      sheet.getRange(row, colMap['nameEn']).setValue(payload.nameEn);
      if (payload.color !== undefined)       sheet.getRange(row, colMap['color']).setValue(payload.color);
      if (payload.icon !== undefined)        sheet.getRange(row, colMap['icon']).setValue(payload.icon);
      if (payload.description !== undefined) sheet.getRange(row, colMap['description']).setValue(payload.description);
      return { success: true, message: 'Category updated' };
    }
  }
  return { success: false, error: 'Not found' };
}

function deleteCategory(id) {
  var sheet = getSheet(CONFIG.SHEET_CATEGORIES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Category deleted' };
    }
  }
  return { success: false, error: 'Not found' };
}

// ─── SETTINGS ────────────────────────────────────────────────
function getSettings() {
  var sheet = getSheet(CONFIG.SHEET_SETTINGS);
  var data = sheet.getDataRange().getValues();
  var settings = {};
  data.slice(1).forEach(function(row) {
    if (row[0]) settings[row[0]] = row[1];
  });
  return { success: true, data: settings };
}

// ─── DASHBOARD STATS ─────────────────────────────────────────
function getDashboardStats(year) {
  year = year || '2567';
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: _emptyStats(year) };

  var headers = data[0];
  var rows = data.slice(1)
    .map(function(row) { return rowToObj(headers, row); })
    .filter(function(r) { return r.id && String(r.year) === String(year); });

  var totalWorkloads = rows.length;
  var totalHours = rows.reduce(function(sum, r) { return sum + (parseFloat(r.hours) || 0); }, 0);
  var completed = rows.filter(function(r) { return r.status === 'เสร็จสิ้น'; }).length;
  var inProgress = rows.filter(function(r) { return r.status === 'กำลังดำเนินการ'; }).length;

  // By category
  var byCat = {};
  rows.forEach(function(r) {
    byCat[r.category] = (byCat[r.category] || 0) + 1;
  });

  // By month
  var byMonth = {};
  for (var m = 1; m <= 12; m++) {
    byMonth[m] = rows.filter(function(r) { return parseInt(r.month) === m; }).length;
  }

  // Recent 5
  var recent = rows.slice(0, 5);

  // Evidence count
  var evSheet = getSheet(CONFIG.SHEET_EVIDENCE);
  var evData = evSheet.getDataRange().getValues();
  var totalEvidence = evData.length > 1 ? evData.length - 1 : 0;

  return {
    success: true,
    data: {
      year: year,
      totalWorkloads: totalWorkloads,
      totalHours: totalHours,
      completed: completed,
      inProgress: inProgress,
      pending: totalWorkloads - completed - inProgress,
      totalEvidence: totalEvidence,
      byCat: byCat,
      byMonth: byMonth,
      recent: recent
    }
  };
}

function _emptyStats(year) {
  var byMonth = {};
  for (var m = 1; m <= 12; m++) byMonth[m] = 0;
  return { year: year, totalWorkloads: 0, totalHours: 0, completed: 0,
           inProgress: 0, pending: 0, totalEvidence: 0, byCat: {}, byMonth: byMonth, recent: [] };
}

// ─── ANNUAL SUMMARY ──────────────────────────────────────────
function getAnnualSummary(year) {
  year = year || '2567';
  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: {} };

  var headers = data[0];
  var rows = data.slice(1)
    .map(function(row) { return rowToObj(headers, row); })
    .filter(function(r) { return r.id && String(r.year) === String(year); });

  // Summary by category
  var catSheet = getSheet(CONFIG.SHEET_CATEGORIES);
  var catData = catSheet.getDataRange().getValues();
  var catHeaders = catData[0];
  var categories = catData.slice(1).map(function(r) { return rowToObj(catHeaders, r); });

  var summary = categories.map(function(cat) {
    var catRows = rows.filter(function(r) { return r.category === cat.id; });
    var hours = catRows.reduce(function(s, r) { return s + (parseFloat(r.hours) || 0); }, 0);
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      count: catRows.length,
      hours: hours,
      items: catRows
    };
  }).filter(function(s) { return s.count > 0; });

  // Monthly breakdown
  var monthly = [];
  for (var m = 1; m <= 12; m++) {
    var mRows = rows.filter(function(r) { return parseInt(r.month) === m; });
    monthly.push({
      month: m,
      monthName: thaiMonthName(m),
      count: mRows.length,
      hours: mRows.reduce(function(s, r) { return s + (parseFloat(r.hours) || 0); }, 0)
    });
  }

  return {
    success: true,
    data: {
      year: year,
      total: rows.length,
      totalHours: rows.reduce(function(s, r) { return s + (parseFloat(r.hours) || 0); }, 0),
      summary: summary,
      monthly: monthly,
      allWorkloads: rows
    }
  };
}

// ─── SEED DATA ปี 2567 ───────────────────────────────────────
function seedData() {
  // Initialize sheets first
  initSpreadsheet();

  var sheet = getSheet(CONFIG.SHEET_WORKLOADS);
  // Check if already seeded
  if (sheet.getLastRow() > 1) {
    return { success: false, message: 'Data already exists. Clear sheet first.' };
  }

  var seeds = _getSeedData();
  seeds.forEach(function(s) {
    var dateStr = s.workDate;
    var year = '2567';
    var month = extractMonth(dateStr);
    sheet.appendRow([
      generateId(), s.title, s.category, s.detail,
      dateStr, s.hours, year, month,
      'เสร็จสิ้น', now(), now(), 0
    ]);
  });

  return { success: true, message: 'Seeded ' + seeds.length + ' records for ปี 2567' };
}

function _getSeedData() {
  // ข้อมูลภาระงาน ปี 2567 (2024) ของ นางสาวธาราทิพย์ สูงขาว
  // งานวิเทศสัมพันธ์ มหาวิทยาลัยมหาสารคาม
  return [
    // ─ มกราคม 2567 ─
    { title: 'ต้อนรับคณะผู้แทนจาก Xiamen University ประเทศจีน',
      category: 'CAT01', workDate: '2024-01-10', hours: 8,
      detail: 'ต้อนรับและบรรยายสรุปโครงการความร่วมมือ แลกเปลี่ยนข้อมูลด้านการศึกษา หารือแนวทางการทำ MOU' },

    { title: 'จัดทำร่าง MOU กับ Zhejiang Normal University',
      category: 'CAT02', workDate: '2024-01-15', hours: 12,
      detail: 'ร่าง MOU ฉบับภาษาอังกฤษ ประสานงานกับฝ่ายกฎหมาย และส่งให้คณะกรรมการพิจารณา' },

    { title: 'แปลหนังสือเชิญ Visiting Professor จาก Kyoto University',
      category: 'CAT04', workDate: '2024-01-18', hours: 3,
      detail: 'แปลหนังสือเชิญและเอกสารประกอบจากภาษาญี่ปุ่น-อังกฤษ เป็นภาษาไทย' },

    { title: 'ประชุมคณะกรรมการวิเทศสัมพันธ์ ครั้งที่ 1/2567',
      category: 'CAT06', workDate: '2024-01-22', hours: 3,
      detail: 'ประชุมวางแผนการดำเนินงานประจำปี 2567 กำหนดเป้าหมายและตัวชี้วัด' },

    { title: 'ดูแลนักศึกษาแลกเปลี่ยนจาก NTHU ไต้หวัน ภาคต้น 2/2566',
      category: 'CAT08', workDate: '2024-01-25', hours: 6,
      detail: 'ช่วยเหลือนักศึกษาต่างชาติ 4 คนในการลงทะเบียนเรียน จัดหาที่พัก แนะนำการใช้บริการในมหาวิทยาลัย' },

    // ─ กุมภาพันธ์ 2567 ─
    { title: 'ประสานงานทุน ASEAN Scholarship 2567',
      category: 'CAT03', workDate: '2024-02-05', hours: 8,
      detail: 'รวบรวมใบสมัครทุน ASEAN Scholarship ประสานงานกับสำนักงาน กพ. และส่งเอกสารให้ผู้สมัคร 12 ราย' },

    { title: 'จัดอบรม "Academic English Writing for Staff"',
      category: 'CAT05', workDate: '2024-02-12', hours: 16,
      detail: 'จัดอบรมภาษาอังกฤษเชิงวิชาการสำหรับบุคลากร 2 วัน วิทยากรจาก British Council ผู้เข้าร่วม 25 คน' },

    { title: 'แปลสัญญา MOU ฉบับสมบูรณ์ กับ Kanazawa University',
      category: 'CAT04', workDate: '2024-02-15', hours: 10,
      detail: 'แปลสัญญา MOU ฉบับสมบูรณ์ทั้งภาษาอังกฤษและภาษาไทย พร้อมตรวจทานโดยผู้เชี่ยวชาญ' },

    { title: 'จัดทำรายงานประจำปี 2566 งานวิเทศสัมพันธ์',
      category: 'CAT09', workDate: '2024-02-20', hours: 20,
      detail: 'รวบรวมและวิเคราะห์ข้อมูลผลการดำเนินงานประจำปี 2566 จัดทำรายงานฉบับสมบูรณ์สำหรับผู้บริหาร' },

    { title: 'เข้าร่วมอบรม "International Protocol and Etiquette"',
      category: 'CAT10', workDate: '2024-02-26', hours: 6,
      detail: 'เข้าร่วมอบรมพัฒนาศักยภาพด้านพิธีการทูตและมารยาทสากล จัดโดย กระทรวงการต่างประเทศ' },

    // ─ มีนาคม 2567 ─
    { title: 'ต้อนรับคณะ Delegation จาก Gadjah Mada University อินโดนีเซีย',
      category: 'CAT01', workDate: '2024-03-04', hours: 8,
      detail: 'ต้อนรับคณะผู้แทน 6 ท่าน นำเยี่ยมชมมหาวิทยาลัย ประชุมหารือความร่วมมือทางวิชาการ' },

    { title: 'ลงนาม MOU กับ Zhejiang Normal University',
      category: 'CAT02', workDate: '2024-03-12', hours: 12,
      detail: 'เตรียมพิธีลงนาม MOU จัดทำเอกสาร ต้อนรับคณะผู้แทน ถ่ายภาพ บันทึกการประชุม' },

    { title: 'รับสมัครนักศึกษาโครงการแลกเปลี่ยน Semester Exchange 2567',
      category: 'CAT07', workDate: '2024-03-18', hours: 10,
      detail: 'เปิดรับสมัครและคัดเลือกนักศึกษาเข้าร่วมโครงการแลกเปลี่ยน ณ 8 มหาวิทยาลัยคู่สัญญา' },

    { title: 'จัดทำฐานข้อมูลมหาวิทยาลัยคู่สัญญา (Partner University Database)',
      category: 'CAT09', workDate: '2024-03-25', hours: 15,
      detail: 'รวบรวมและปรับปรุงข้อมูลมหาวิทยาลัยคู่สัญญาทั้งหมด 45 แห่ง ใน 20 ประเทศ' },

    // ─ เมษายน 2567 ─
    { title: 'ประชุมออนไลน์ Erasmus+ Consortium Meeting',
      category: 'CAT06', workDate: '2024-04-03', hours: 4,
      detail: 'ประชุมออนไลน์ผ่าน Zoom กับ consortium partners 7 มหาวิทยาลัยในยุโรป รายงานความคืบหน้าโครงการ' },

    { title: 'ส่งนักศึกษาแลกเปลี่ยนไป Tohoku University ญี่ปุ่น',
      category: 'CAT07', workDate: '2024-04-08', hours: 8,
      detail: 'ดูแลนักศึกษา 3 คนก่อนออกเดินทาง จัดทำเอกสารวีซ่า ทำสัญญา Insurance ให้คำแนะนำการปรับตัว' },

    { title: 'แปลเอกสาร Partnership Agreement กับ Monash University',
      category: 'CAT04', workDate: '2024-04-15', hours: 8,
      detail: 'แปลข้อตกลงความร่วมมือฉบับใหม่กับ Monash University ออสเตรเลีย ทั้งภาษาอังกฤษและภาษาไทย' },

    { title: 'จัดทำสรุปรายงานโครงการ JICA ประจำไตรมาส 1',
      category: 'CAT09', workDate: '2024-04-22', hours: 6,
      detail: 'สรุปผลการดำเนินงานโครงการ JICA ประจำไตรมาส 1 ปี 2567 ส่งรายงานให้ประสานงาน JICA Thailand' },

    // ─ พฤษภาคม 2567 ─
    { title: 'จัดโครงการ English Camp สำหรับนักศึกษา มมส.',
      category: 'CAT05', workDate: '2024-05-06', hours: 24,
      detail: 'จัดค่ายภาษาอังกฤษ 3 วัน 2 คืน สำหรับนักศึกษา 60 คน วิทยากรชาวต่างชาติ 4 ท่าน' },

    { title: 'ต้อนรับ Visiting Professor จาก Seoul National University',
      category: 'CAT01', workDate: '2024-05-13', hours: 6,
      detail: 'ต้อนรับ Prof. Kim และคณะ จัดเตรียมห้องพัก ประสานงานตารางการบรรยาย Tour campus' },

    { title: 'ประสานงานทุน MEXT Japanese Government Scholarship 2567',
      category: 'CAT03', workDate: '2024-05-20', hours: 12,
      detail: 'รวบรวมเอกสารผู้สมัครทุน MEXT 8 ราย ตรวจสอบคุณสมบัติ ส่งเอกสารไปสถานทูตญี่ปุ่น' },

    { title: 'เข้าร่วมอบรม "ASEAN University Network Quality Assurance (AUN-QA)"',
      category: 'CAT10', workDate: '2024-05-27', hours: 8,
      detail: 'เข้าร่วมอบรมเชิงปฏิบัติการ AUN-QA จัดโดย สำนักงานเลขาธิการ AUN กรุงเทพฯ' },

    // ─ มิถุนายน 2567 ─
    { title: 'จัดทำ MOU กับ University of Malaya มาเลเซีย',
      category: 'CAT02', workDate: '2024-06-03', hours: 15,
      detail: 'เจรจา ร่าง และตรวจทาน MOU กับ University of Malaya ประสานงานฝ่ายกฎหมายทั้งสองฝ่าย' },

    { title: 'รายงานผลนักศึกษาแลกเปลี่ยนกลับจาก Tohoku University',
      category: 'CAT07', workDate: '2024-06-10', hours: 6,
      detail: 'รับรายงานตัวนักศึกษาที่กลับจาก Tohoku University สัมภาษณ์ประเมินผล จัดทำรายงานสรุป' },

    { title: 'ดูแลนักศึกษาต่างชาติภาคฤดูร้อน (Summer Program)',
      category: 'CAT08', workDate: '2024-06-17', hours: 10,
      detail: 'ดูแลนักศึกษาต่างชาติ 8 คนที่เข้าร่วม Summer Program จัดกิจกรรมทัศนศึกษาและแลกเปลี่ยนวัฒนธรรม' },

    { title: 'ประชุมคณะกรรมการวิเทศสัมพันธ์ ครั้งที่ 2/2567',
      category: 'CAT06', workDate: '2024-06-24', hours: 3,
      detail: 'รายงานผลการดำเนินงานครึ่งปีแรก วางแผนกิจกรรมครึ่งปีหลัง พิจารณา MOU ใหม่' },

    // ─ กรกฎาคม 2567 ─
    { title: 'ต้อนรับและจัดพิธีเปิด International Summer School 2024',
      category: 'CAT01', workDate: '2024-07-01', hours: 10,
      detail: 'จัดพิธีเปิด International Summer School ต้อนรับนักศึกษาต่างชาติ 25 คนจาก 12 ประเทศ' },

    { title: 'แปลเอกสารสมัครทุน Fulbright ปีการศึกษา 2568',
      category: 'CAT04', workDate: '2024-07-09', hours: 10,
      detail: 'แปลเอกสารประกอบการสมัครทุน Fulbright ของอาจารย์ 2 ท่าน พร้อมตรวจทานความถูกต้อง' },

    { title: 'ลงนาม MOU กับ University of Malaya',
      category: 'CAT02', workDate: '2024-07-15', hours: 8,
      detail: 'เดินทางไปมาเลเซียเพื่อร่วมพิธีลงนาม MOU ระหว่าง มมส. และ University of Malaya' },

    { title: 'จัดอบรมเชิงปฏิบัติการ "Cross-Cultural Communication"',
      category: 'CAT05', workDate: '2024-07-22', hours: 12,
      detail: 'จัดอบรมการสื่อสารข้ามวัฒนธรรมสำหรับบุคลากร มมส. ผู้เข้าร่วม 30 คน วิทยากรจาก Chulalongkorn University' },

    { title: 'งานธุรการ: โต้ตอบหนังสือราชการต่างประเทศประจำเดือน',
      category: 'CAT11', workDate: '2024-07-29', hours: 8,
      detail: 'โต้ตอบหนังสือราชการและอีเมลต่างประเทศ จัดทำหนังสือเชิญ หนังสือตอบรับ จดหมายแนะนำ 15 ฉบับ' },

    // ─ สิงหาคม 2567 ─
    { title: 'รับสมัครโครงการ Double Degree กับ Chuo University ญี่ปุ่น',
      category: 'CAT07', workDate: '2024-08-05', hours: 12,
      detail: 'เปิดรับสมัครนักศึกษาปริญญาโทเข้าร่วม Double Degree Program กับ Chuo University คัดเลือก 5 คน' },

    { title: 'ประสานงานทุน ADB-JSP Scholarship สำหรับนักศึกษาปริญญาโท',
      category: 'CAT03', workDate: '2024-08-12', hours: 10,
      detail: 'ประสานงานทุน ADB-JSP สำหรับนักศึกษา 6 คน จัดทำเอกสาร ติดตามสถานะการสมัคร' },

    { title: 'จัดนิทรรศการ "Discover MSU to the World"',
      category: 'CAT05', workDate: '2024-08-19', hours: 16,
      detail: 'จัดนิทรรศการแนะนำมหาวิทยาลัยสู่เวทีนานาชาติ ออกบูธในงาน Thailand International Education Expo 2024' },

    { title: 'ประชุมออนไลน์ UMAP (University Mobility in Asia and the Pacific)',
      category: 'CAT06', workDate: '2024-08-26', hours: 4,
      detail: 'เข้าร่วมประชุม UMAP Annual Meeting 2024 ออนไลน์ รายงานสถิตินักศึกษาแลกเปลี่ยน' },

    // ─ กันยายน 2567 ─
    { title: 'ต้อนรับคณะจาก Hanoi University of Science and Technology เวียดนาม',
      category: 'CAT01', workDate: '2024-09-02', hours: 8,
      detail: 'ต้อนรับคณะผู้แทน 8 ท่าน หารือโครงการแลกเปลี่ยนนักศึกษาร่วมกัน' },

    { title: 'จัดทำ Annual Report งานวิเทศสัมพันธ์ ปี 2567 (Draft)',
      category: 'CAT09', workDate: '2024-09-10', hours: 20,
      detail: 'รวบรวมข้อมูลและจัดทำร่างรายงานประจำปี 2567 ครอบคลุมกิจกรรมทั้งหมดช่วงมกราคม–สิงหาคม' },

    { title: 'อบรมโปรแกรม IMIS (International Mobility Information System)',
      category: 'CAT10', workDate: '2024-09-16', hours: 6,
      detail: 'เข้าร่วมอบรมการใช้งานระบบ IMIS สำหรับบันทึกข้อมูลความเคลื่อนไหวนักศึกษาต่างชาติ' },

    { title: 'ดูแลนักศึกษาต่างชาติ Inbound Semester 1/2567',
      category: 'CAT08', workDate: '2024-09-23', hours: 12,
      detail: 'ดูแลนักศึกษาต่างชาติ 11 คนที่เดินทางมาเรียน มมส. ภาคต้น 1/2567 ช่วยด้านเอกสารวีซ่าและที่พัก' },

    // ─ ตุลาคม 2567 ─
    { title: 'เข้าร่วมประชุม ASEAN International Mobility for Students (AIMS)',
      category: 'CAT06', workDate: '2024-10-07', hours: 12,
      detail: 'เดินทางเข้าร่วมประชุม AIMS ที่กรุงกัวลาลัมเปอร์ มาเลเซีย นำเสนอผลงานวิเทศสัมพันธ์' },

    { title: 'จัดอบรม IELTS Preparation Workshop สำหรับนักศึกษา',
      category: 'CAT05', workDate: '2024-10-14', hours: 16,
      detail: 'จัดอบรมเตรียมความพร้อม IELTS สำหรับนักศึกษาที่สนใจสมัครทุนและโครงการแลกเปลี่ยน 40 คน' },

    { title: 'ประสานงานการเยือน มมส. ของ Ambassador จากสหภาพยุโรป',
      category: 'CAT01', workDate: '2024-10-21', hours: 10,
      detail: 'ประสานงานการเยือนอย่างเป็นทางการของเอกอัครราชทูต EU ประจำประเทศไทย เตรียมสูจิบัตรและล่าม' },

    { title: 'จัดทำฐานข้อมูลทุนการศึกษาต่างประเทศ ประจำปี 2568',
      category: 'CAT09', workDate: '2024-10-28', hours: 10,
      detail: 'รวบรวมข้อมูลทุนการศึกษาจากประเทศต่างๆ สำหรับปี 2568 จัดทำคู่มือสำหรับนักศึกษา' },

    // ─ พฤศจิกายน 2567 ─
    { title: 'ต้อนรับและจัดประชุม Consortium Meeting โครงการ ERASMUS+',
      category: 'CAT01', workDate: '2024-11-04', hours: 16,
      detail: 'เป็นเจ้าภาพจัดประชุม ERASMUS+ Consortium Meeting ต้อนรับผู้แทนจาก 6 มหาวิทยาลัยยุโรป' },

    { title: 'ส่งนักศึกษาแลกเปลี่ยน Double Degree ไป Chuo University',
      category: 'CAT07', workDate: '2024-11-11', hours: 8,
      detail: 'ดูแลนักศึกษา 5 คนก่อนออกเดินทาง จัดเตรียมเอกสาร Orientation เรื่องชีวิตในญี่ปุ่น' },

    { title: 'ประสานงานทุน Thailand-EU Connectivity Scholarship',
      category: 'CAT03', workDate: '2024-11-18', hours: 8,
      detail: 'ประสานงานทุนนักศึกษาปริญญาเอกภายใต้โครงการ Thailand-EU Connectivity รับสมัคร 3 ราย' },

    { title: 'งานธุรการ: จัดทำทะเบียน MOU ประจำปี 2567',
      category: 'CAT11', workDate: '2024-11-25', hours: 6,
      detail: 'รวบรวมและปรับปรุงทะเบียน MOU/MOA ทั้งหมด จัดทำฐานข้อมูล สถานะความตกลง วันหมดอายุ' },

    // ─ ธันวาคม 2567 ─
    { title: 'จัดงาน International Day 2024 "MSU Connects the World"',
      category: 'CAT05', workDate: '2024-12-02', hours: 24,
      detail: 'จัดงาน International Day 2024 นิทรรศการประเทศต่างๆ กิจกรรมวัฒนธรรม 15 บูธ ผู้เข้าร่วม 500+ คน' },

    { title: 'ประชุมสรุปผลการดำเนินงานวิเทศสัมพันธ์ ประจำปี 2567',
      category: 'CAT06', workDate: '2024-12-09', hours: 4,
      detail: 'ประชุมสรุปผลงานประจำปี 2567 นำเสนอผลสำเร็จ ปัญหา และแผนการดำเนินงาน ปี 2568' },

    { title: 'จัดทำรายงานประจำปี 2567 งานวิเทศสัมพันธ์ (ฉบับสมบูรณ์)',
      category: 'CAT09', workDate: '2024-12-16', hours: 24,
      detail: 'จัดทำรายงานประจำปีฉบับสมบูรณ์ พร้อมภาพถ่ายกิจกรรม สถิติ และตัวชี้วัดครบถ้วน นำเสนอผู้บริหาร' },

    { title: 'เข้าร่วมงาน Thailand International Education Expo ครั้งที่ 2',
      category: 'CAT10', workDate: '2024-12-20', hours: 8,
      detail: 'เข้าร่วมงาน TIEE ออกบูธแนะนำ มมส. และโครงการต่างประเทศ พบนักศึกษาที่สนใจเรียนต่อนอก' },

    { title: 'สรุปและส่งมอบงาน: อัปเดตฐานข้อมูลวิเทศสัมพันธ์ปลายปี',
      category: 'CAT11', workDate: '2024-12-26', hours: 6,
      detail: 'อัปเดตฐานข้อมูลความร่วมมือ MOU ทุนการศึกษา นักศึกษาแลกเปลี่ยน ให้เป็นปัจจุบัน ณ สิ้นปี 2567' },
  ];
}

// ─── AI IMPORT VIA ANTHROPIC (CLAUDE) API PROXY ─────────────
function aiImportViaProxy(payload) {
  var apiKey = payload.apiKey || '';
  if (!apiKey) return { success: false, error: 'ไม่พบ Anthropic API Key' };

  var fileBase64    = payload.fileBase64 || '';
  var fileMediaType = payload.fileMediaType || 'application/pdf';
  var fileName      = payload.fileName || 'document';

  var promptText = 'คุณเป็นผู้ช่วย AI สำหรับระบบบันทึกภาระงานของบุคลากรมหาวิทยาลัย\n' +
    'กรุณาอ่านเอกสารนี้ชื่อ "' + fileName + '" และดึงข้อมูลต่อไปนี้:\n\n' +
    '1. ชื่อกิจกรรม/ภาระงาน (title) - สั้นกระชับ ไม่เกิน 100 ตัวอักษร\n' +
    '2. วันที่ปฏิบัติงาน (workDate) - รูปแบบ YYYY-MM-DD (ปี ค.ศ.)\n' +
    '3. หมวดงาน (category) - เลือกหนึ่งจาก: CAT01=ต้อนรับแขกต่างชาติ, CAT02=จัดทำ MOU/MOA, CAT03=ประสานงานทุน, CAT04=แปลเอกสาร, CAT05=จัดอบรม/สัมมนา, CAT06=ประชุมวิเทศสัมพันธ์, CAT07=โครงการแลกเปลี่ยน, CAT08=ดูแลนักศึกษาต่างชาติ, CAT09=จัดทำเอกสาร/รายงาน, CAT10=พัฒนาตนเอง, CAT11=งานธุรการวิเทศ, CAT12=อื่นๆ\n' +
    '4. ระยะเวลา (hours) - จำนวนชั่วโมง (ตัวเลข)\n' +
    '5. รายละเอียด (detail) - สรุปสั้นๆ ไม่เกิน 200 ตัวอักษร\n\n' +
    'ตอบในรูปแบบ JSON เท่านั้น ไม่ต้องมีคำอธิบาย:\n' +
    '{"title":"...","workDate":"YYYY-MM-DD","category":"CATxx","hours":8,"detail":"...","confidence":"high/medium/low"}';

  var isImage = fileMediaType.startsWith('image/');
  var isPDF   = fileMediaType === 'application/pdf';

  // Build content blocks สำหรับ Anthropic Messages API
  var contentBlocks = [];
  if (isImage) {
    contentBlocks.push({
      type: 'image',
      source: { type: 'base64', media_type: fileMediaType, data: fileBase64 }
    });
  } else if (isPDF) {
    contentBlocks.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 }
    });
  }
  contentBlocks.push({ type: 'text', text: promptText });

  var requestBody = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: contentBlocks }]
  };

  try {
    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    });

    var result = JSON.parse(response.getContentText());
    if (result.error) return { success: false, error: result.error.message || JSON.stringify(result.error) };

    var text = (result.content && result.content[0] && result.content[0].text) || '';

    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { success: false, error: 'AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง' };

    var data = JSON.parse(jsonMatch[0]);
    return { success: true, data: data };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ─── UPDATE PROFILE IN SETTINGS SHEET ───────────────────────
function updateProfileSettings(data) {
  try {
    var sheet = getSheet(CONFIG.SHEET_SETTINGS);
    var rows = sheet.getDataRange().getValues();
    var updates = { ownerName: data.name, ownerPosition: data.position,
                    department: data.dept, currentYear: data.year };
    Object.keys(updates).forEach(function(key) {
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(updates[key]);
          found = true; break;
        }
      }
      if (!found) sheet.appendRow([key, updates[key]]);
    });
    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ─── UTILITY ─────────────────────────────────────────────────
function rowToObj(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i] : ''; });
  return obj;
}

function extractThaiYear(dateStr) {
  // dateStr format: YYYY-MM-DD (Gregorian)
  // ปีงบประมาณ: ก.ค.(7)–ธ.ค.(12) นับเป็นปีถัดไป
  // เช่น 1 ก.ค. 2568 – 30 มิ.ย. 2569 = ปีงบประมาณ 2569
  if (!dateStr) return '2569';
  var parts = dateStr.split('-');
  var year  = parseInt(parts[0]);
  var month = parseInt(parts[1]) || 1;
  if (month >= 7) return String(year + 543 + 1);
  return String(year + 543);
}

function extractMonth(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  return parts.length >= 2 ? parseInt(parts[1]) : '';
}

function thaiMonthName(m) {
  var names = ['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
               'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return names[m] || '';
}
