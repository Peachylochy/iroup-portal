/**
 * IROUP Database V2.2 header repair helpers.
 *
 * Repairs only row 1 headers for known Schema Fix Pass 1 drift. Does not clear
 * data rows, delete sheets, modify other sheets, deploy, or migrate data.
 */

function repairV22Headers() {
  const repairs = [
    {
      sheetName: IROUP_V2_SHEETS.FILE_ROLE_MASTER,
      headers: ['file_role_id', 'file_role_name', 'public_safe', 'active', 'sort_order']
    },
    {
      sheetName: IROUP_V2_SHEETS.PUBLIC_CACHE,
      headers: ['cache_id', 'module', 'schema_version', 'json_data', 'updated_at', 'expires_at']
    },
    {
      sheetName: IROUP_V2_SHEETS.TRAVEL_PARTICIPANT,
      headers: ['travel_participant_id', 'travel_id', 'person_source', 'person_id', 'full_name_snapshot', 'unit_id_snapshot', 'position_snapshot', 'role', 'is_deleted', 'created_by', 'created_at']
    }
  ];

  const summary = {
    success: true,
    repaired: [],
    errors: []
  };

  repairs.forEach(function (repair) {
    const result = repairV22SheetHeaders_(repair.sheetName, repair.headers);
    if (result.success) {
      summary.repaired.push(result.data);
    } else {
      summary.success = false;
      summary.errors.push({
        sheetName: repair.sheetName,
        error: result.error
      });
    }
  });

  return summary;
}

/**
 * Adds article-style public content columns to the existing SCHOLARSHIP sheet.
 *
 * Use this once on the live V2 spreadsheet before saving scholarship records with
 * content_th/content_en. It inserts the columns after coverage_en so existing data
 * remains aligned with the old headers.
 */
function addV2ScholarshipContentColumns() {
  const sheetResult = getV2Sheet_(IROUP_V2_SHEETS.SCHOLARSHIP);
  if (!sheetResult.success) {
    Logger.log('[V2 REPAIR][SCHOLARSHIP content] ERROR ' + sheetResult.error);
    return { success: false, data: null, error: sheetResult.error };
  }

  const sheet = sheetResult.data;
  const headers = getV22RepairHeaders_(sheet, sheet.getLastColumn());
  const existingContentTh = headers.indexOf('content_th');
  const existingContentEn = headers.indexOf('content_en');

  if (existingContentTh >= 0 && existingContentEn >= 0) {
    return {
      success: true,
      data: {
        sheetName: IROUP_V2_SHEETS.SCHOLARSHIP,
        changed: false,
        headers: headers
      },
      error: ''
    };
  }

  const coverageEnIndex = headers.indexOf('coverage_en');
  if (coverageEnIndex < 0) {
    const error = 'coverage_en header was not found; cannot safely insert scholarship content columns.';
    Logger.log('[V2 REPAIR][SCHOLARSHIP content] ERROR ' + error);
    return { success: false, data: null, error: error };
  }

  const insertAfterColumn = coverageEnIndex + 1;
  const missingHeaders = [];
  if (existingContentTh < 0) missingHeaders.push('content_th');
  if (existingContentEn < 0) missingHeaders.push('content_en');

  sheet.insertColumnsAfter(insertAfterColumn, missingHeaders.length);
  sheet.getRange(1, insertAfterColumn + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  SpreadsheetApp.flush();

  const after = getV22RepairHeaders_(sheet, sheet.getLastColumn());
  Logger.log('[V2 REPAIR][SCHOLARSHIP content] after=' + JSON.stringify(after));

  return {
    success: true,
    data: {
      sheetName: IROUP_V2_SHEETS.SCHOLARSHIP,
      changed: true,
      inserted_after: 'coverage_en',
      inserted_headers: missingHeaders,
      headers: after
    },
    error: ''
  };
}

/**
 * Makes existing Scholarship attachment files public-safe for public pages.
 *
 * Use once if Scholarship attachments were uploaded before the admin form started
 * saving attachment visibility as public. Poster/cover image files are left as-is.
 */
function makeV2ScholarshipAttachmentsPublic() {
  const sheetResult = getV2Sheet_(IROUP_V2_SHEETS.FILES);
  if (!sheetResult.success) {
    Logger.log('[V2 REPAIR][SCHOLARSHIP attachments] ERROR ' + sheetResult.error);
    return { success: false, updated: 0, error: sheetResult.error };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const moduleIndex = headers.indexOf('module');
  const roleIndex = headers.indexOf('file_role_id');
  const visibilityIndex = headers.indexOf('visibility_level');

  if (moduleIndex < 0 || roleIndex < 0 || visibilityIndex < 0) {
    const error = 'FILES sheet is missing module, file_role_id, or visibility_level.';
    Logger.log('[V2 REPAIR][SCHOLARSHIP attachments] ERROR ' + error);
    return { success: false, updated: 0, error: error };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: true, updated: 0, error: '' };

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  let updated = 0;
  values.forEach(function (row, index) {
    const module = String(row[moduleIndex] || '').trim().toLowerCase();
    const role = String(row[roleIndex] || '').trim().toLowerCase();
    if (module !== 'scholarship') return;
    if (role !== 'attachment') return;
    if (String(row[visibilityIndex] || '').trim() === 'public') return;

    sheet.getRange(index + 2, visibilityIndex + 1).setValue('public');
    updated++;
  });

  SpreadsheetApp.flush();
  Logger.log('[V2 REPAIR][SCHOLARSHIP attachments] updated=' + updated);
  return { success: true, updated: updated, error: '' };
}

function repairV22SheetHeaders_(sheetName, requiredHeaders) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    Logger.log('[V2.2 REPAIR][' + sheetName + '] ERROR ' + sheetResult.error);
    return { success: false, data: null, error: sheetResult.error };
  }

  try {
    const sheet = sheetResult.data;
    const before = getV22RepairHeaders_(sheet, requiredHeaders.length);

    Logger.log('[V2.2 REPAIR][' + sheetName + '] before=' + JSON.stringify(before));

    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, requiredHeaders.length);
    SpreadsheetApp.flush();

    const after = getV22RepairHeaders_(sheet, requiredHeaders.length);
    Logger.log('[V2.2 REPAIR][' + sheetName + '] after=' + JSON.stringify(after));

    return {
      success: true,
      data: {
        sheetName: sheetName,
        before: before,
        after: after
      },
      error: ''
    };
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    Logger.log('[V2.2 REPAIR][' + sheetName + '] ERROR ' + message);
    return { success: false, data: null, error: message };
  }
}

function getV22RepairHeaders_(sheet, headerCount) {
  if (!sheet || sheet.getLastColumn() < 1) return [];
  const width = Math.max(headerCount || 1, sheet.getLastColumn());
  return sheet.getRange(1, 1, 1, width).getValues()[0]
    .map(function (header) {
      return String(header || '').trim();
    });
}
