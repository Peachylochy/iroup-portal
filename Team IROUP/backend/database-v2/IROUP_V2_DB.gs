/**
 * IROUP Database V2.2 low-level sheet helpers.
 *
 * These helpers read/write normalized V2 sheets and return structured
 * objects only. They are intentionally isolated from production V1 Code.gs.
 */

function getV2SS_() {
  if (IROUP_V2_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(IROUP_V2_SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getV2Sheet_(sheetName) {
  try {
    const ss = getV2SS_();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return { success: false, data: null, error: 'Missing V2 sheet: ' + sheetName, total: 0 };
    }
    return { success: true, data: sheet, error: '', total: 1 };
  } catch (err) {
    return { success: false, data: null, error: String(err && err.message ? err.message : err), total: 0 };
  }
}

function readV2Sheet_(sheetName) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) return sheetResult;

  const sheet = sheetResult.data;
  const values = sheet.getDataRange().getValues();
  if (!values.length) {
    return { success: true, data: [], error: '', total: 0 };
  }

  const headers = getV2Headers_(sheet);
  const rows = values.slice(1)
    .filter(function (row) {
      return row.some(function (cell) { return cell !== '' && cell !== null; });
    })
    .map(function (row) {
      return rowToObjectV2_(headers, row);
    });

  return { success: true, data: rows, error: '', total: rows.length };
}

function getV2Headers_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (header) { return String(header || '').trim(); });
}

function rowToObjectV2_(headers, row) {
  const obj = {};
  (headers || []).forEach(function (header, index) {
    if (!header) return;
    obj[header] = normalizeV2Cell_(row[index]);
  });
  return obj;
}

function appendV2Row_(sheetName, data) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) return sheetResult;

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  if (!headers.length) {
    return { success: false, data: null, error: 'Missing headers in V2 sheet: ' + sheetName, total: 0 };
  }

  const payload = data || {};
  const row = headers.map(function (header) {
    return payload[header] !== undefined ? payload[header] : '';
  });

  sheet.appendRow(row);
  const inserted = rowToObjectV2_(headers, row);
  return { success: true, data: inserted, error: '', total: 1 };
}

function updateV2RowById_(sheetName, idField, idValue, patch) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) return sheetResult;

  const sheet = sheetResult.data;
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { success: false, data: null, error: 'No rows found in V2 sheet: ' + sheetName, total: 0 };
  }

  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf(idField);
  if (idIndex < 0) {
    return { success: false, data: null, error: 'Missing id field: ' + idField, total: 0 };
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      const nextRow = values[i].slice();
      headers.forEach(function (header, index) {
        if (!header) return;
        if (patch && patch[header] !== undefined) {
          nextRow[index] = patch[header];
          sheet.getRange(i + 1, index + 1).setValue(patch[header]);
        }
      });
      return { success: true, data: rowToObjectV2_(headers, nextRow), error: '', total: 1 };
    }
  }

  return { success: false, data: null, error: 'V2 row not found: ' + idValue, total: 0 };
}

function findV2RowById_(sheetName, idField, idValue) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) return sheetResult;

  const sheet = sheetResult.data;
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { success: false, data: null, error: 'No rows found in V2 sheet: ' + sheetName, total: 0 };
  }

  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf(idField);
  if (idIndex < 0) {
    return { success: false, data: null, error: 'Missing id field: ' + idField, total: 0 };
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      return { success: true, data: rowToObjectV2_(headers, values[i]), error: '', total: 1 };
    }
  }

  return { success: false, data: null, error: 'V2 row not found: ' + idValue, total: 0 };
}

function softDeleteV2RowById_(sheetName, idField, idValue) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) return sheetResult;

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  if (headers.indexOf('is_deleted') < 0) {
    return { success: false, data: null, error: 'Sheet does not support soft delete: ' + sheetName, total: 0 };
  }

  return updateV2RowById_(sheetName, idField, idValue, { is_deleted: true });
}

function generateV2Id_(prefix) {
  const cleanPrefix = String(prefix || 'V2').trim().toUpperCase();
  const stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmss');
  const random = Utilities.getUuid().split('-')[0].toUpperCase();
  return cleanPrefix + '-' + stamp + '-' + random;
}

function normalizeV2Cell_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  if (value === null || value === undefined) return '';
  return value;
}
