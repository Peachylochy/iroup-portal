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

function appendV2Row_(sheetName, data, options) {
  const appendOptions = options || {};
  const diagnostics = {
    sheetName: sheetName,
    idField: appendOptions.idField || '',
    idValue: '',
    headers: [],
    missingHeaders: [],
    unknownFields: [],
    emptyRequiredFields: [],
    enumErrors: [],
    checkboxErrors: [],
    validationWarnings: [],
    keyColumnIndex: 0,
    rowNumber: 0
  };

  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    return {
      success: false,
      data: null,
      error: sheetResult.error,
      total: 0,
      diagnostics: diagnostics
    };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  diagnostics.headers = headers;
  if (!headers.length) {
    diagnostics.missingHeaders = ['<all>'];
    return {
      success: false,
      data: null,
      error: 'Missing headers in V2 sheet: ' + sheetName,
      total: 0,
      diagnostics: diagnostics
    };
  }

  const payload = data || {};
  diagnostics.idValue = appendOptions.idField ? String(payload[appendOptions.idField] || '') : '';

  Object.keys(payload).forEach(function (field) {
    if (headers.indexOf(field) < 0) diagnostics.unknownFields.push(field);
  });

  (appendOptions.requiredFields || []).forEach(function (field) {
    if (headers.indexOf(field) < 0) {
      diagnostics.missingHeaders.push(field);
      return;
    }
    const value = payload[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      diagnostics.emptyRequiredFields.push(field);
    }
  });

  headers.forEach(function (header) {
    if (payload[header] === undefined || payload[header] === null || payload[header] === '') return;
    const enumCheck = validateV2AppendEnumValue_(header, payload[header]);
    if (!enumCheck.success) diagnostics.enumErrors.push(enumCheck);
    const checkboxCheck = validateV2AppendCheckboxValue_(header, payload[header]);
    if (!checkboxCheck.success) diagnostics.checkboxErrors.push(checkboxCheck);
  });

  if (diagnostics.missingHeaders.length || diagnostics.emptyRequiredFields.length || diagnostics.enumErrors.length || diagnostics.checkboxErrors.length) {
    return {
      success: false,
      data: null,
      error: 'V2 append preflight failed for ' + sheetName,
      total: 0,
      diagnostics: diagnostics
    };
  }

  const row = headers.map(function (header) {
    return payload[header] !== undefined ? payload[header] : '';
  });

  try {
    const keyColumnIndex = getV2AppendKeyColumnIndex_(headers, appendOptions.idField);
    diagnostics.keyColumnIndex = keyColumnIndex;
    diagnostics.rowNumber = findAppendRowByKey_(sheet, keyColumnIndex, appendOptions);

    sheet.getRange(diagnostics.rowNumber, 1, 1, headers.length).setValues([row]);

    if (appendOptions.validateWrite === true) {
      SpreadsheetApp.flush();
      const persistedKey = sheet.getRange(diagnostics.rowNumber, keyColumnIndex).getValue();
      if (String(persistedKey || '').trim() !== String(row[keyColumnIndex - 1] || '').trim()) {
        diagnostics.validationWarnings.push('Written key did not match persisted key cell after setValues');
      }
    }

    const inserted = rowToObjectV2_(headers, row);
    return {
      success: true,
      data: inserted,
      error: '',
      total: 1,
      diagnostics: diagnostics
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: String(err && err.message ? err.message : err),
      total: 0,
      diagnostics: diagnostics
    };
  }
}

function findAppendRowByKey_(sheet, keyColumnIndex, options) {
  const appendOptions = options || {};
  if (appendOptions.fillFirstEmpty === true) {
    return findFirstEmptyRowByKey_(sheet, keyColumnIndex);
  }

  const nextRow = Math.max(2, sheet.getLastRow() + 1);
  if (nextRow > sheet.getMaxRows()) {
    sheet.insertRowsAfter(sheet.getMaxRows(), nextRow - sheet.getMaxRows());
  }
  return nextRow;
}

function getV2AppendKeyColumnIndex_(headers, idField) {
  const keyField = String(idField || '').trim();
  if (keyField) {
    const idIndex = (headers || []).indexOf(keyField);
    if (idIndex >= 0) return idIndex + 1;
  }
  return 1;
}

function findFirstEmptyRowByKey_(sheet, keyColumnIndex) {
  const keyCol = Math.max(1, keyColumnIndex || 1);
  const firstDataRow = 2;
  const maxRows = Math.max(sheet.getMaxRows(), firstDataRow);
  const rowCount = maxRows - firstDataRow + 1;

  if (rowCount > 0) {
    const values = sheet.getRange(firstDataRow, keyCol, rowCount, 1).getValues();
    for (let i = 0; i < values.length; i++) {
      const value = values[i][0];
      if (value === '' || value === null || value === undefined) {
        return firstDataRow + i;
      }
    }
  }

  sheet.insertRowsAfter(maxRows, 1);
  return maxRows + 1;
}

function appendV2Rows_(sheetName, rows, options) {
  const appendOptions = options || {};
  const strictMode = appendOptions.strictMode === true;
  const summary = {
    sheetName: sheetName,
    inserted: 0,
    failed: 0,
    failedIds: [],
    errors: [],
    diagnostics: []
  };
  const insertedRows = [];

  (rows || []).forEach(function (row) {
    if (strictMode && summary.failed > 0) return;

    const result = appendV2Row_(sheetName, row, appendOptions);
    summary.diagnostics.push(result.diagnostics || {});

    if (result.success) {
      summary.inserted++;
      insertedRows.push(result.data);
    } else {
      summary.failed++;
      const idField = appendOptions.idField || '';
      const idValue = idField ? String((row || {})[idField] || '') : '';
      if (idValue) summary.failedIds.push(idValue);
      summary.errors.push({
        id: idValue,
        error: result.error || 'Unknown append failure',
        diagnostics: result.diagnostics || {}
      });
    }
  });

  return {
    success: summary.failed === 0,
    data: insertedRows,
    total: insertedRows.length,
    error: summary.failed ? 'V2 batch append failed for ' + summary.failed + ' row(s) in ' + sheetName : '',
    inserted: summary.inserted,
    failed: summary.failed,
    diagnostics: summary
  };
}

function validateV2AppendEnumValue_(fieldName, value) {
  const allowed = getV2AppendEnumAllowedValues_(fieldName);
  if (!allowed.length) {
    return { success: true, field: fieldName, value: value, allowed: [] };
  }

  const text = String(value || '').trim();
  if (allowed.indexOf(text) < 0) {
    return {
      success: false,
      field: fieldName,
      value: text,
      allowed: allowed,
      error: 'Invalid enum value for ' + fieldName + ': ' + text
    };
  }

  return { success: true, field: fieldName, value: text, allowed: allowed };
}

function getV2AppendEnumAllowedValues_(fieldName) {
  const enumMap = {
    status: IROUP_V2_ENUMS.status,
    module: IROUP_V2_MODULES,
    visibility_level: IROUP_V2_ENUMS.visibility_level,
    direction: IROUP_V2_ENUMS.direction,
    event_mode: IROUP_V2_ENUMS.event_mode,
    source_system: IROUP_V2_ENUMS.source_system,
    currency: IROUP_V2_ENUMS.currency
  };

  return enumMap[fieldName] || [];
}

function validateV2AppendCheckboxValue_(fieldName, value) {
  if (getV2AppendCheckboxFields_().indexOf(fieldName) < 0) {
    return { success: true, field: fieldName, value: value };
  }

  if (value === true || value === false) {
    return { success: true, field: fieldName, value: value };
  }

  const text = String(value || '').trim().toUpperCase();
  if (['TRUE', 'FALSE'].indexOf(text) >= 0) {
    return { success: true, field: fieldName, value: value };
  }

  return {
    success: false,
    field: fieldName,
    value: value,
    error: 'Invalid checkbox value for ' + fieldName + ': ' + value
  };
}

function getV2AppendCheckboxFields_() {
  return [
    'active',
    'is_deleted',
    'public_visible',
    'public_file_allowed',
    'public_safe',
    'is_internal',
    'pin'
  ];
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
