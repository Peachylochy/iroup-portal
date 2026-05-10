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
