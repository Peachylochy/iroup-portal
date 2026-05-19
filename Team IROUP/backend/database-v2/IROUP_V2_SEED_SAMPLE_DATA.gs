/**
 * IROUP Database V2.2 fake sample data seed.
 *
 * Backend/API testing only. Do not use for real migration data.
 */

const IROUP_V2_SAMPLE_PREFIXES = ['TEST-', 'FAKE-', 'DUMMY-'];
const IROUP_V2_SAMPLE_STRICT_MODE = false;

const IROUP_V2_SAMPLE_ID_FIELDS = {
  SYSTEM_SETTINGS: 'setting_key',
  ADMIN: 'admin_id',
  COUNTRY_MASTER: 'country_id',
  UP_UNIT_MASTER: 'unit_id',
  PERSON_STUDENT: 'student_id',
  PERSON_STAFF: 'staff_id',
  PERSON_MANUAL: 'person_id',
  BUDGET_TYPE_MASTER: 'budget_type_id',
  FILE_ROLE_MASTER: 'file_role_id',
  MOU: 'mou_id',
  MOBILITY_PROJECT: 'mobility_id',
  MOBILITY_PARTICIPANT: 'participant_id',
  TRAVEL: 'travel_id',
  TRAVEL_PARTICIPANT: 'travel_participant_id',
  SCHOLARSHIP: 'scholarship_id',
  EVENT: 'event_id',
  BUDGET: 'budget_id',
  FILES: 'file_id',
  AUDIT_LOG: 'log_id',
  PUBLIC_CACHE: 'cache_id'
};

const IROUP_V2_SAMPLE_REQUIRED_FIELDS = {
  SYSTEM_SETTINGS: ['setting_key'],
  ADMIN: ['admin_id', 'email', 'active'],
  COUNTRY_MASTER: ['country_id'],
  UP_UNIT_MASTER: ['unit_id'],
  PERSON_STUDENT: ['student_id'],
  PERSON_STAFF: ['staff_id'],
  PERSON_MANUAL: ['person_id'],
  BUDGET_TYPE_MASTER: ['budget_type_id'],
  FILE_ROLE_MASTER: ['file_role_id'],
  MOU: ['mou_id', 'status', 'public_visible', 'is_deleted'],
  MOBILITY_PROJECT: ['mobility_id', 'direction', 'status', 'public_visible', 'is_deleted'],
  MOBILITY_PARTICIPANT: ['participant_id', 'mobility_id', 'participant_type', 'person_source', 'person_id', 'is_deleted'],
  TRAVEL: ['travel_id', 'status', 'public_visible', 'is_deleted'],
  TRAVEL_PARTICIPANT: ['travel_participant_id', 'travel_id', 'person_source', 'person_id', 'is_deleted'],
  SCHOLARSHIP: ['scholarship_id', 'status', 'public_visible', 'is_deleted'],
  EVENT: ['event_id', 'event_mode', 'status', 'public_visible', 'is_deleted'],
  BUDGET: ['budget_id', 'module', 'record_id', 'budget_type_id', 'budget_source_type', 'currency', 'amount_thb', 'is_deleted'],
  FILES: ['file_id', 'module', 'record_id', 'file_role_id', 'visibility_level', 'is_deleted'],
  AUDIT_LOG: ['log_id', 'module', 'record_id', 'action'],
  PUBLIC_CACHE: ['cache_id', 'module', 'schema_version', 'json_data']
};

function seedV2SampleData() {
  const cleanup = cleanupV2SampleData();
  const summary = {
    cleanup: cleanup,
    inserted: {},
    failed: {},
    errors: [],
    diagnostics: {
      strictMode: IROUP_V2_SAMPLE_STRICT_MODE,
      schemaAlignment: [],
      tables: {}
    }
  };

  const batches = getV2SampleDataBatches_();
  summary.diagnostics.schemaAlignment = diagnoseV2SeedSchemaAlignment_(batches, [
    IROUP_V2_SHEETS.BUDGET,
    IROUP_V2_SHEETS.FILES,
    IROUP_V2_SHEETS.MOBILITY_PARTICIPANT,
    IROUP_V2_SHEETS.TRAVEL_PARTICIPANT
  ]);

  Object.keys(batches).forEach(function (sheetName) {
    if (IROUP_V2_SAMPLE_STRICT_MODE && summary.errors.length) return;

    const rows = batches[sheetName];
    const result = appendV2Rows_(sheetName, rows, {
      idField: IROUP_V2_SAMPLE_ID_FIELDS[sheetName] || '',
      requiredFields: IROUP_V2_SAMPLE_REQUIRED_FIELDS[sheetName] || [],
      strictMode: IROUP_V2_SAMPLE_STRICT_MODE
    });

    summary.inserted[sheetName] = result.inserted || 0;
    summary.failed[sheetName] = result.failed || 0;
    summary.diagnostics.tables[sheetName] = result.diagnostics;

    if (!result.success) {
      summary.errors.push({
        sheetName: sheetName,
        error: result.error,
        failedIds: result.diagnostics ? result.diagnostics.failedIds : [],
        diagnostics: result.diagnostics
      });
    }

    logV2SeedTableSummary_(sheetName, result);
  });

  summary.diagnostics.schemaAlignment.forEach(function (item) {
    if (!item.success) {
      Logger.log('[V2 SEED][SCHEMA] ' + item.sheetName + ' alignment issue: ' + JSON.stringify(item));
    } else {
      Logger.log('[V2 SEED][SCHEMA] ' + item.sheetName + ' headers aligned');
    }
  });

  Logger.log('[V2 SEED][SUMMARY] inserted=' + countV2SeedSummary_(summary.inserted) +
    ' failed=' + countV2SeedSummary_(summary.failed) +
    ' strictMode=' + IROUP_V2_SAMPLE_STRICT_MODE);

  return {
    success: summary.errors.length === 0,
    inserted: summary.inserted,
    failed: summary.failed,
    diagnostics: summary.diagnostics,
    data: summary,
    error: summary.errors.length ? 'Some V2 sample rows failed to insert' : '',
    total: countV2SeedSummary_(summary.inserted)
  };
}

function logV2SeedTableSummary_(sheetName, result) {
  const diagnostics = result && result.diagnostics ? result.diagnostics : {};
  Logger.log('[V2 SEED][' + sheetName + '] inserted=' + (result.inserted || 0) +
    ' failed=' + (result.failed || 0) +
    ' failedIds=' + JSON.stringify(diagnostics.failedIds || []));

  (diagnostics.errors || []).forEach(function (err) {
    Logger.log('[V2 SEED][' + sheetName + '][ERROR] ' + JSON.stringify({
      id: err.id || '',
      error: err.error || '',
      missingHeaders: err.diagnostics ? err.diagnostics.missingHeaders : [],
      unknownFields: err.diagnostics ? err.diagnostics.unknownFields : [],
      emptyRequiredFields: err.diagnostics ? err.diagnostics.emptyRequiredFields : [],
      enumErrors: err.diagnostics ? err.diagnostics.enumErrors : [],
      checkboxErrors: err.diagnostics ? err.diagnostics.checkboxErrors : [],
      validationWarnings: err.diagnostics ? err.diagnostics.validationWarnings : []
    }));
  });
}

function diagnoseV2SeedSchemaAlignment_(batches, sheetNames) {
  return (sheetNames || []).map(function (sheetName) {
    const sheetResult = getV2Sheet_(sheetName);
    if (!sheetResult.success) {
      return {
        sheetName: sheetName,
        success: false,
        error: sheetResult.error,
        missingHeaders: [],
        unusedHeaders: [],
        headers: [],
        sampleFields: []
      };
    }

    const headers = getV2Headers_(sheetResult.data);
    const sampleFields = {};
    (batches[sheetName] || []).forEach(function (row) {
      Object.keys(row || {}).forEach(function (field) {
        sampleFields[field] = true;
      });
    });

    const sampleFieldList = Object.keys(sampleFields);
    const missingHeaders = sampleFieldList.filter(function (field) {
      return headers.indexOf(field) < 0;
    });
    const unusedHeaders = headers.filter(function (header) {
      return sampleFieldList.indexOf(header) < 0;
    });

    return {
      sheetName: sheetName,
      success: missingHeaders.length === 0,
      error: missingHeaders.length ? 'Seed row fields missing from sheet headers' : '',
      missingHeaders: missingHeaders,
      unusedHeaders: unusedHeaders,
      headers: headers,
      sampleFields: sampleFieldList
    };
  });
}

function countV2SeedSummary_(counts) {
  return Object.keys(counts || {}).reduce(function (sum, sheetName) {
    return sum + (counts[sheetName] || 0);
  }, 0);
}

function cleanupV2SampleData() {
  const sheetNames = [
    IROUP_V2_SHEETS.PUBLIC_CACHE,
    IROUP_V2_SHEETS.AUDIT_LOG,
    IROUP_V2_SHEETS.FILES,
    IROUP_V2_SHEETS.BUDGET,
    IROUP_V2_SHEETS.TRAVEL_PARTICIPANT,
    IROUP_V2_SHEETS.MOBILITY_PARTICIPANT,
    IROUP_V2_SHEETS.EVENT,
    IROUP_V2_SHEETS.SCHOLARSHIP,
    IROUP_V2_SHEETS.TRAVEL,
    IROUP_V2_SHEETS.MOBILITY_PROJECT,
    IROUP_V2_SHEETS.MOU,
    IROUP_V2_SHEETS.PERSON_MANUAL,
    IROUP_V2_SHEETS.PERSON_STAFF,
    IROUP_V2_SHEETS.PERSON_STUDENT,
    IROUP_V2_SHEETS.FILE_ROLE_MASTER,
    IROUP_V2_SHEETS.BUDGET_TYPE_MASTER,
    IROUP_V2_SHEETS.UP_UNIT_MASTER,
    IROUP_V2_SHEETS.COUNTRY_MASTER,
    IROUP_V2_SHEETS.ADMIN,
    IROUP_V2_SHEETS.SYSTEM_SETTINGS
  ];

  const summary = { deleted: {}, errors: [] };

  sheetNames.forEach(function (sheetName) {
    const result = cleanupV2SampleSheet_(sheetName);
    summary.deleted[sheetName] = result.deleted || 0;
    if (!result.success) {
      summary.errors.push({ sheetName: sheetName, error: result.error });
    }
  });

  return {
    success: summary.errors.length === 0,
    data: summary,
    error: summary.errors.length ? 'Some V2 sample rows failed cleanup' : '',
    total: Object.keys(summary.deleted).reduce(function (sum, sheetName) {
      return sum + summary.deleted[sheetName];
    }, 0)
  };
}

function cleanupV2SampleSheet_(sheetName) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    return { success: false, deleted: 0, error: sheetResult.error };
  }

  const idField = IROUP_V2_SAMPLE_ID_FIELDS[sheetName];
  if (!idField) {
    return { success: true, deleted: 0, error: '' };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf(idField);
  if (idIndex < 0) {
    return { success: false, deleted: 0, error: 'Missing sample cleanup id field: ' + idField };
  }

  const values = sheet.getDataRange().getValues();
  let deleted = 0;
  for (let rowIndex = values.length - 1; rowIndex >= 1; rowIndex--) {
    const idValue = values[rowIndex][idIndex];
    if (isV2SampleId_(idValue)) {
      sheet.deleteRow(rowIndex + 1);
      deleted++;
    }
  }

  return { success: true, deleted: deleted, error: '' };
}

function isV2SampleId_(value) {
  const text = String(value || '').trim().toUpperCase();
  return IROUP_V2_SAMPLE_PREFIXES.some(function (prefix) {
    return text.indexOf(prefix) === 0;
  });
}

function seedMasterEventTypes() {
  const sheetName = 'MASTER_EVENT_TYPES';
  const idField = 'event_type_id';
  const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  const rows = [
    { event_type_id: 'EVT-TYPE-001', name_th: 'ประชุม', name_en: 'Meeting', icon: '📋', color_token: '#3B82F6', is_active: true, sort_order: 10, created_at: now, updated_at: now },
    { event_type_id: 'EVT-TYPE-002', name_th: 'อบรม', name_en: 'Workshop', icon: '📚', color_token: '#8B5CF6', is_active: true, sort_order: 20, created_at: now, updated_at: now },
    { event_type_id: 'EVT-TYPE-003', name_th: 'Inbound', name_en: 'Inbound', icon: '✈️', color_token: '#10B981', is_active: true, sort_order: 30, created_at: now, updated_at: now },
    { event_type_id: 'EVT-TYPE-004', name_th: 'Exchange', name_en: 'Exchange', icon: '🔄', color_token: '#F59E0B', is_active: true, sort_order: 40, created_at: now, updated_at: now },
    { event_type_id: 'EVT-TYPE-005', name_th: 'การเดินทาง', name_en: 'Travel', icon: '🗺️', color_token: '#EF4444', is_active: true, sort_order: 50, created_at: now, updated_at: now }
  ];

  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    return { success: false, inserted: 0, skipped: 0, error: sheetResult.error, data: [] };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf(idField);
  const missingHeaders = Object.keys(rows[0]).filter(function (field) {
    return headers.indexOf(field) < 0;
  });

  if (idIndex < 0 || missingHeaders.length) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      error: 'MASTER_EVENT_TYPES seed headers are missing',
      diagnostics: {
        missingIdField: idIndex < 0 ? idField : '',
        missingHeaders: missingHeaders,
        headers: headers
      },
      data: []
    };
  }

  const values = sheet.getDataRange().getValues();
  const existingIds = {};
  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const existingId = String(values[rowIndex][idIndex] || '').trim();
    if (existingId) existingIds[existingId] = true;
  }

  const insertedRows = [];
  const skippedIds = [];
  rows.forEach(function (row) {
    const eventTypeId = String(row.event_type_id || '').trim();
    if (existingIds[eventTypeId]) {
      skippedIds.push(eventTypeId);
      return;
    }

    const targetRow = findFirstEmptyRowByKey_(sheet, idIndex + 1);
    const rowValues = headers.map(function (header) {
      return row[header] !== undefined ? row[header] : '';
    });
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([rowValues]);
    existingIds[eventTypeId] = true;
    insertedRows.push(row);
  });

  SpreadsheetApp.flush();
  Logger.log('[V2 SEED][MASTER_EVENT_TYPES] inserted=' + insertedRows.length +
    ' skipped=' + skippedIds.length +
    ' skippedIds=' + JSON.stringify(skippedIds));

  return {
    success: true,
    inserted: insertedRows.length,
    skipped: skippedIds.length,
    skippedIds: skippedIds,
    data: insertedRows,
    error: ''
  };
}

function seedUPUnitMaster() {
  const rows = [
    { unit_id: 'UNIT-IR-001', unit_code: 'IR', unit_name_th: 'งานวิเทศสัมพันธ์', unit_name_en: 'International Relations Office', unit_type: 'office', active: true, sort_order: 10 },
    { unit_id: 'UNIT-SCI-001', unit_code: 'SCI', unit_name_th: 'คณะวิทยาศาสตร์', unit_name_en: 'Faculty of Science', unit_type: 'faculty', active: true, sort_order: 20 },
    { unit_id: 'UNIT-ENG-001', unit_code: 'ENG', unit_name_th: 'คณะวิศวกรรมศาสตร์', unit_name_en: 'Faculty of Engineering', unit_type: 'faculty', active: true, sort_order: 30 },
    { unit_id: 'UNIT-MED-001', unit_code: 'MED', unit_name_th: 'คณะแพทยศาสตร์', unit_name_en: 'Faculty of Medicine', unit_type: 'faculty', active: true, sort_order: 40 },
    { unit_id: 'UNIT-NUR-001', unit_code: 'NUR', unit_name_th: 'คณะพยาบาลศาสตร์', unit_name_en: 'Faculty of Nursing', unit_type: 'faculty', active: true, sort_order: 50 },
    { unit_id: 'UNIT-LAW-001', unit_code: 'LAW', unit_name_th: 'คณะนิติศาสตร์', unit_name_en: 'Faculty of Law', unit_type: 'faculty', active: true, sort_order: 60 },
    { unit_id: 'UNIT-BUS-001', unit_code: 'BUS', unit_name_th: 'คณะบริหารธุรกิจและนิเทศศาสตร์', unit_name_en: 'Faculty of Business Administration and Communication Arts', unit_type: 'faculty', active: true, sort_order: 70 },
    { unit_id: 'UNIT-EDU-001', unit_code: 'EDU', unit_name_th: 'คณะครุศาสตร์', unit_name_en: 'Faculty of Education', unit_type: 'faculty', active: true, sort_order: 80 },
    { unit_id: 'UNIT-DEN-001', unit_code: 'DEN', unit_name_th: 'คณะทันตแพทยศาสตร์', unit_name_en: 'Faculty of Dentistry', unit_type: 'faculty', active: true, sort_order: 90 },
    { unit_id: 'UNIT-PHA-001', unit_code: 'PHA', unit_name_th: 'คณะเภสัชศาสตร์', unit_name_en: 'Faculty of Pharmaceutical Sciences', unit_type: 'faculty', active: true, sort_order: 100 },
    { unit_id: 'UNIT-AGR-001', unit_code: 'AGR', unit_name_th: 'คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ', unit_name_en: 'Faculty of Agriculture and Natural Resources', unit_type: 'faculty', active: true, sort_order: 110 },
    { unit_id: 'UNIT-ARC-001', unit_code: 'ARC', unit_name_th: 'คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์', unit_name_en: 'Faculty of Architecture and Fine Arts', unit_type: 'faculty', active: true, sort_order: 120 },
    { unit_id: 'UNIT-ICT-001', unit_code: 'ICT', unit_name_th: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร', unit_name_en: 'Faculty of Information and Communication Technology', unit_type: 'faculty', active: true, sort_order: 130 },
    { unit_id: 'UNIT-HUM-001', unit_code: 'HUM', unit_name_th: 'คณะรัฐศาสตร์และสังคมศาสตร์', unit_name_en: 'Faculty of Political Science and Social Science', unit_type: 'faculty', active: true, sort_order: 140 },
    { unit_id: 'UNIT-REG-001', unit_code: 'REG', unit_name_th: 'สำนักทะเบียนและประมวลผล', unit_name_en: 'Office of the Registrar', unit_type: 'office', active: true, sort_order: 150 }
  ];

  return seedV2MasterRowsSkippingDuplicates_(IROUP_V2_SHEETS.UP_UNIT_MASTER, 'unit_id', rows, 'UP_UNIT_MASTER');
}

function seedCountryMaster() {
  return upsertV2GlobalCountryMaster();
}

function deleteV2RowsByKeyPrefix_(sheetName, idField, prefix) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    return { success: false, deleted: 0, error: sheetResult.error };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf(idField);
  if (idIndex < 0) {
    return { success: false, deleted: 0, error: 'Missing cleanup id field: ' + idField };
  }

  const values = sheet.getDataRange().getValues();
  let deleted = 0;
  for (let rowIndex = values.length - 1; rowIndex >= 1; rowIndex--) {
    const idValue = String(values[rowIndex][idIndex] || '').trim();
    if (idValue.indexOf(prefix) === 0) {
      sheet.deleteRow(rowIndex + 1);
      deleted++;
    }
  }

  Logger.log('[V2 SEED][' + sheetName + '] deleted existing ' + prefix + ' rows=' + deleted);
  return { success: true, deleted: deleted, error: '' };
}

function seedV2MasterRowsSkippingDuplicates_(sheetName, idField, rows, label) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    return { success: false, inserted: 0, skipped: 0, error: sheetResult.error, data: [] };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf(idField);
  const missingHeaders = Object.keys(rows[0] || {}).filter(function (field) {
    return headers.indexOf(field) < 0;
  });

  if (idIndex < 0 || missingHeaders.length) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      error: label + ' seed headers are missing',
      diagnostics: {
        missingIdField: idIndex < 0 ? idField : '',
        missingHeaders: missingHeaders,
        headers: headers
      },
      data: []
    };
  }

  const values = sheet.getDataRange().getValues();
  const existingIds = {};
  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const existingId = String(values[rowIndex][idIndex] || '').trim();
    if (existingId) existingIds[existingId] = true;
  }

  const insertedRows = [];
  const skippedIds = [];
  rows.forEach(function (row) {
    const id = String(row[idField] || '').trim();
    if (existingIds[id]) {
      skippedIds.push(id);
      return;
    }

    const targetRow = findFirstEmptyRowByKey_(sheet, idIndex + 1);
    const rowValues = headers.map(function (header) {
      return row[header] !== undefined ? row[header] : '';
    });
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([rowValues]);
    existingIds[id] = true;
    insertedRows.push(row);
  });

  SpreadsheetApp.flush();
  Logger.log('[V2 SEED][' + label + '] inserted=' + insertedRows.length +
    ' skipped=' + skippedIds.length +
    ' skippedIds=' + JSON.stringify(skippedIds));

  return {
    success: true,
    inserted: insertedRows.length,
    skipped: skippedIds.length,
    skippedIds: skippedIds,
    data: insertedRows,
    error: ''
  };
}

function getV2SampleDataBatches_() {
  const now = v2SeedDate_(0);
  const yesterday = v2SeedDate_(-1);
  const lastMonth = v2SeedDate_(-30);
  const nextWeek = v2SeedDate_(7);
  const nextMonth = v2SeedDate_(30);
  const nextQuarter = v2SeedDate_(90);
  const expiredStart = v2SeedDate_(-180);
  const expiredEnd = v2SeedDate_(-120);

  const batches = {};

  batches[IROUP_V2_SHEETS.SYSTEM_SETTINGS] = [
    { setting_key: 'TEST-SAMPLE_DATA_VERSION', setting_value: '1', description: 'Fake V2 sample data version', updated_at: now, updated_by: 'TEST-SEED' },
    { setting_key: 'TEST-SAMPLE_DATA_MODE', setting_value: 'backend-api-test', description: 'Marks removable fake sample data', updated_at: now, updated_by: 'TEST-SEED' }
  ];

  batches[IROUP_V2_SHEETS.ADMIN] = [
    { admin_id: 'TEST-ADMIN-001', email: 'admin.test@example.invalid', name: 'Test Admin', role: 'admin', active: true, created_at: now },
    { admin_id: 'TEST-ADMIN-002', email: 'viewer.test@example.invalid', name: 'Test Viewer', role: 'viewer', active: true, created_at: now }
  ];

  batches[IROUP_V2_SHEETS.COUNTRY_MASTER] = [
    { country_id: 'TEST-TH', iso2: 'TH', iso3: 'THA', country_name_en: 'Thailand', country_name_th: 'Thailand Test', continent_en: 'Asia', continent_th: 'Asia', flag_emoji: 'TH', search_alias: 'thai,thailand', active: true, sort_order: 10 },
    { country_id: 'TEST-JP', iso2: 'JP', iso3: 'JPN', country_name_en: 'Japan', country_name_th: 'Japan Test', continent_en: 'Asia', continent_th: 'Asia', flag_emoji: 'JP', search_alias: 'japan', active: true, sort_order: 20 },
    { country_id: 'TEST-KR', iso2: 'KR', iso3: 'KOR', country_name_en: 'South Korea', country_name_th: 'Korea Test', continent_en: 'Asia', continent_th: 'Asia', flag_emoji: 'KR', search_alias: 'korea,south korea', active: true, sort_order: 30 },
    { country_id: 'TEST-AU', iso2: 'AU', iso3: 'AUS', country_name_en: 'Australia', country_name_th: 'Australia Test', continent_en: 'Oceania', continent_th: 'Oceania', flag_emoji: 'AU', search_alias: 'australia', active: true, sort_order: 40 },
    { country_id: 'TEST-OLD-COUNTRY', iso2: 'ZZ', iso3: 'ZZZ', country_name_en: 'Inactive Test Country', country_name_th: 'Inactive Test Country', continent_en: 'Test', continent_th: 'Test', flag_emoji: 'ZZ', search_alias: 'inactive', active: false, sort_order: 999 }
  ];

  batches[IROUP_V2_SHEETS.UP_UNIT_MASTER] = [
    { unit_id: 'TEST-UNIT-IR', unit_code: 'IR', unit_name_th: 'Test International Relations Office', unit_name_en: 'Test International Relations Office', unit_type: 'office', parent_unit_id: '', active: true, sort_order: 10 },
    { unit_id: 'TEST-UNIT-SCI', unit_code: 'SCI', unit_name_th: 'Test Faculty of Science', unit_name_en: 'Test Faculty of Science', unit_type: 'faculty', parent_unit_id: '', active: true, sort_order: 20 },
    { unit_id: 'TEST-UNIT-ENG', unit_code: 'ENG', unit_name_th: 'Test Faculty of Engineering', unit_name_en: 'Test Faculty of Engineering', unit_type: 'faculty', parent_unit_id: '', active: true, sort_order: 30 },
    { unit_id: 'TEST-UNIT-OLD', unit_code: 'OLD', unit_name_th: 'Inactive Test Unit', unit_name_en: 'Inactive Test Unit', unit_type: 'other', parent_unit_id: '', active: false, sort_order: 999 }
  ];

  batches[IROUP_V2_SHEETS.BUDGET_TYPE_MASTER] = [
    { budget_type_id: 'TEST-BUDGET-INTERNAL', budget_type_name: 'internal budget', active: true },
    { budget_type_id: 'TEST-BUDGET-UNIVERSITY', budget_type_name: 'university budget', active: true },
    { budget_type_id: 'TEST-BUDGET-EXTERNAL', budget_type_name: 'external partner budget', active: true },
    { budget_type_id: 'TEST-BUDGET-SELF', budget_type_name: 'self funded', active: true },
    { budget_type_id: 'TEST-BUDGET-NONE', budget_type_name: 'no budget', active: true }
  ];

  batches[IROUP_V2_SHEETS.FILE_ROLE_MASTER] = [
    { file_role_id: 'TEST-FILE-POSTER', file_role_name: 'poster', public_safe: true, active: true, sort_order: 10 },
    { file_role_id: 'TEST-FILE-BANNER', file_role_name: 'banner', public_safe: true, active: true, sort_order: 20 },
    { file_role_id: 'TEST-FILE-PUBLIC-PDF', file_role_name: 'public_pdf', public_safe: true, active: true, sort_order: 30 },
    { file_role_id: 'TEST-FILE-EVIDENCE', file_role_name: 'evidence', public_safe: false, active: true, sort_order: 40 },
    { file_role_id: 'TEST-FILE-LETTER', file_role_name: 'letter', public_safe: false, active: true, sort_order: 50 }
  ];

  batches[IROUP_V2_SHEETS.PERSON_STUDENT] = [
    { student_id: 'TEST-STU-001', prefix_th: 'Mr.', first_name_th: 'Fake Student One', last_name_th: 'Sample', full_name_th: 'Fake Student One Sample', gender: 'male', unit_id: 'TEST-UNIT-SCI', program_th: 'Test Science Program', degree_level: 'bachelor', student_status: 'active', active: true, source_system: 'MANUAL_CSV', updated_at: now },
    { student_id: 'TEST-STU-002', prefix_th: 'Ms.', first_name_th: 'Fake Student Two', last_name_th: 'Sample', full_name_th: 'Fake Student Two Sample', gender: 'female', unit_id: 'TEST-UNIT-ENG', program_th: 'Test Engineering Program', degree_level: 'master', student_status: 'active', active: true, source_system: 'MANUAL_CSV', updated_at: now },
    { student_id: 'TEST-STU-003', prefix_th: 'Mr.', first_name_th: 'Inactive Student', last_name_th: 'Sample', full_name_th: 'Inactive Student Sample', gender: 'male', unit_id: 'TEST-UNIT-SCI', program_th: 'Inactive Program', degree_level: 'bachelor', student_status: 'inactive', active: false, source_system: 'MANUAL_CSV', updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.PERSON_STAFF] = [
    { staff_id: 'TEST-STF-001', prefix_th: 'Ms.', first_name_th: 'Fake Staff One', last_name_th: 'Sample', full_name_th: 'Fake Staff One Sample', first_name_en: 'Fake Staff One', last_name_en: 'Sample', full_name_en: 'Fake Staff One Sample', gender: 'female', unit_id: 'TEST-UNIT-IR', position: 'Test Officer', staff_type: 'support', active: true, source_system: 'MANUAL_CSV', updated_at: now },
    { staff_id: 'TEST-STF-002', prefix_th: 'Dr.', first_name_th: 'Fake Lecturer', last_name_th: 'Sample', full_name_th: 'Fake Lecturer Sample', first_name_en: 'Fake Lecturer', last_name_en: 'Sample', full_name_en: 'Fake Lecturer Sample', gender: 'male', unit_id: 'TEST-UNIT-SCI', position: 'Test Lecturer', staff_type: 'academic', active: true, source_system: 'MANUAL_CSV', updated_at: now },
    { staff_id: 'TEST-STF-003', prefix_th: 'Mr.', first_name_th: 'Inactive Staff', last_name_th: 'Sample', full_name_th: 'Inactive Staff Sample', first_name_en: 'Inactive Staff', last_name_en: 'Sample', full_name_en: 'Inactive Staff Sample', gender: 'male', unit_id: 'TEST-UNIT-OLD', position: 'Inactive', staff_type: 'support', active: false, source_system: 'MANUAL_CSV', updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.PERSON_MANUAL] = [
    { person_id: 'TEST-PER-001', person_type: 'guest', prefix: 'Ms.', first_name: 'Fake Guest', last_name: 'Sample', full_name: 'Fake Guest Sample', gender: 'female', unit_id: 'TEST-UNIT-IR', program_or_position: 'Guest speaker', source_note: 'Seeded manual guest', created_at: now, created_by: 'TEST-SEED', active: true },
    { person_id: 'TEST-PER-002', person_type: 'external', prefix: 'Mr.', first_name: 'Fake External', last_name: 'Sample', full_name: 'Fake External Sample', gender: 'male', unit_id: '', program_or_position: 'External partner staff', source_note: 'Seeded manual external person', created_at: now, created_by: 'TEST-SEED', active: true }
  ];

  batches[IROUP_V2_SHEETS.MOU] = [
    { mou_id: 'TEST-REC-COLLIDE', up_unit_id: 'TEST-UNIT-IR', partner_org_name: 'Fake Japan Partner University', partner_org_name_en: 'Fake Japan Partner University', country_id: 'TEST-JP', mou_type: 'MOU', start_date: lastMonth, end_date: nextQuarter, fiscal_year: '2569', status: 'active', public_visible: true, public_file_allowed: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mou_id: 'TEST-MOU-PRIVATE', up_unit_id: 'TEST-UNIT-SCI', partner_org_name: 'Fake Private Partner', partner_org_name_en: 'Fake Private Partner', country_id: 'TEST-KR', mou_type: 'MOA', start_date: lastMonth, end_date: nextQuarter, fiscal_year: '2569', status: 'active', public_visible: false, public_file_allowed: false, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mou_id: 'TEST-MOU-EXPIRED', up_unit_id: 'TEST-UNIT-ENG', partner_org_name: 'Fake Expired Partner', partner_org_name_en: 'Fake Expired Partner', country_id: 'TEST-AU', mou_type: 'MOU', start_date: expiredStart, end_date: expiredEnd, fiscal_year: '2568', status: 'expired', public_visible: true, public_file_allowed: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mou_id: 'TEST-MOU-DELETED', up_unit_id: 'TEST-UNIT-IR', partner_org_name: 'Fake Deleted Partner', partner_org_name_en: 'Fake Deleted Partner', country_id: 'TEST-JP', mou_type: 'MOU', start_date: lastMonth, end_date: nextQuarter, fiscal_year: '2569', status: 'active', public_visible: true, public_file_allowed: true, is_deleted: true, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.MOBILITY_PROJECT] = [
    { mobility_id: 'TEST-REC-COLLIDE', direction: 'inbound', project_name: 'Fake Inbound Active Project', institution_name: 'Fake Japan University', country_id: 'TEST-JP', city: 'Tokyo', up_unit_id: 'TEST-UNIT-IR', purpose: 'exchange', level: 'bachelor', participant_group: 'student', start_date: lastMonth, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 3, student_count: 2, staff_count: 1, status: 'active', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-OUT-UPCOMING', direction: 'outbound', project_name: 'Fake Outbound Upcoming Project', institution_name: 'Fake Korea University', country_id: 'TEST-KR', city: 'Seoul', up_unit_id: 'TEST-UNIT-SCI', purpose: 'study visit', level: 'master', participant_group: 'student', start_date: nextWeek, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 2, student_count: 2, staff_count: 0, status: 'upcoming', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-COMPLETED', direction: 'outbound', project_name: 'Fake Completed Project', institution_name: 'Fake Australia University', country_id: 'TEST-AU', city: 'Sydney', up_unit_id: 'TEST-UNIT-ENG', purpose: 'research', level: 'staff', participant_group: 'staff', start_date: expiredStart, end_date: expiredEnd, fiscal_year: '2568', participant_count_cached: 1, student_count: 0, staff_count: 1, status: 'completed', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-CANCELLED', direction: 'inbound', project_name: 'Fake Cancelled Public Project', institution_name: 'Fake Cancelled University', country_id: 'TEST-JP', city: 'Osaka', up_unit_id: 'TEST-UNIT-IR', purpose: 'exchange', level: 'bachelor', participant_group: 'student', start_date: nextWeek, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 1, student_count: 1, staff_count: 0, status: 'cancelled', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-PRIVATE', direction: 'inbound', project_name: 'Fake Private Mobility Project', institution_name: 'Fake Private Institution', country_id: 'TEST-KR', city: 'Busan', up_unit_id: 'TEST-UNIT-SCI', purpose: 'internal', level: 'staff', participant_group: 'staff', start_date: lastMonth, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 1, student_count: 0, staff_count: 1, status: 'active', public_visible: false, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-ORPHAN', direction: 'inbound', project_name: 'Fake Orphan Project No Participants', institution_name: 'Fake No Participant Institution', country_id: 'TEST-JP', city: 'Kyoto', up_unit_id: 'TEST-UNIT-IR', purpose: 'exchange', level: 'bachelor', participant_group: 'student', start_date: nextWeek, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 0, student_count: 0, staff_count: 0, status: 'upcoming', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-NOBUDGET', direction: 'outbound', project_name: 'Fake No Budget Project', institution_name: 'Fake Self Funded Institution', country_id: 'TEST-AU', city: 'Melbourne', up_unit_id: 'TEST-UNIT-ENG', purpose: 'conference', level: 'staff', participant_group: 'staff', start_date: nextWeek, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 1, student_count: 0, staff_count: 1, status: 'upcoming', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { mobility_id: 'TEST-MOB-DELETED', direction: 'inbound', project_name: 'Fake Deleted Mobility Project', institution_name: 'Fake Deleted Institution', country_id: 'TEST-JP', city: 'Tokyo', up_unit_id: 'TEST-UNIT-IR', purpose: 'exchange', level: 'bachelor', participant_group: 'student', start_date: lastMonth, end_date: nextMonth, fiscal_year: '2569', participant_count_cached: 1, student_count: 1, staff_count: 0, status: 'active', public_visible: true, is_deleted: true, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.TRAVEL] = [
    { travel_id: 'TEST-TRV-001', project_name: 'Fake Public Staff Travel', purpose: 'conference', country_id: 'TEST-JP', city: 'Tokyo', start_date: lastMonth, end_date: nextMonth, fiscal_year: '2569', status: 'active', participant_count: 2, public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { travel_id: 'TEST-TRV-PRIVATE', project_name: 'Fake Private Staff Travel', purpose: 'internal meeting', country_id: 'TEST-KR', city: 'Seoul', start_date: nextWeek, end_date: nextMonth, fiscal_year: '2569', status: 'upcoming', participant_count: 1, public_visible: false, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { travel_id: 'TEST-TRV-DELETED', project_name: 'Fake Deleted Staff Travel', purpose: 'conference', country_id: 'TEST-AU', city: 'Sydney', start_date: expiredStart, end_date: expiredEnd, fiscal_year: '2568', status: 'completed', participant_count: 1, public_visible: true, is_deleted: true, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.SCHOLARSHIP] = [
    { scholarship_id: 'TEST-SCH-001', title_th: 'Fake Public Scholarship', title_en: 'Fake Public Scholarship', institution_name: 'Fake Japan Foundation', country_id: 'TEST-JP', scholarship_type: 'exchange', funding_type: 'full', target_group: 'student', cover_summary: 'Fake coverage summary', coverage_th: 'Fake coverage TH', coverage_en: 'Fake coverage EN', content_th: 'Fake public scholarship content TH', content_en: 'Fake public scholarship content EN', publish_date: yesterday, open_date: yesterday, close_date: nextMonth, detail_url: 'https://example.invalid/test-scholarship', apply_url: 'https://example.invalid/apply', link_url: 'https://example.invalid/link', pin: true, status: 'active', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { scholarship_id: 'TEST-SCH-DRAFT', title_th: 'Fake Draft Scholarship', title_en: 'Fake Draft Scholarship', institution_name: 'Fake Draft Foundation', country_id: 'TEST-KR', scholarship_type: 'degree', funding_type: 'partial', target_group: 'student', cover_summary: 'Draft only', coverage_th: 'Draft', coverage_en: 'Draft', content_th: 'Draft content TH', content_en: 'Draft content EN', publish_date: now, open_date: nextWeek, close_date: nextMonth, detail_url: '', apply_url: '', link_url: '', pin: false, status: 'draft', public_visible: false, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { scholarship_id: 'TEST-SCH-EXPIRED', title_th: 'Fake Expired Scholarship', title_en: 'Fake Expired Scholarship', institution_name: 'Fake Expired Foundation', country_id: 'TEST-AU', scholarship_type: 'short course', funding_type: 'full', target_group: 'student', cover_summary: 'Expired', coverage_th: 'Expired', coverage_en: 'Expired', content_th: 'Expired content TH', content_en: 'Expired content EN', publish_date: expiredStart, open_date: expiredStart, close_date: expiredEnd, detail_url: 'https://example.invalid/expired', apply_url: '', link_url: '', pin: false, status: 'expired', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.EVENT] = [
    { event_id: 'TEST-EVT-001', title_th: 'Fake Public Hybrid Event', title_en: 'Fake Public Hybrid Event', event_type: 'seminar', event_mode: 'hybrid', organizer_unit_id: 'TEST-UNIT-IR', country_id: 'TEST-TH', location: 'Fake Hall', meeting_url: 'https://example.invalid/meeting', start_date: nextWeek, end_date: nextWeek, start_time: '09:00', end_time: '12:00', participant_count: 80, detail_th: 'Fake public event detail', detail_en: 'Fake public event detail', link_url: 'https://example.invalid/event', pin: true, status: 'upcoming', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { event_id: 'TEST-EVT-PRIVATE', title_th: 'Fake Private Internal Event', title_en: 'Fake Private Internal Event', event_type: 'meeting', event_mode: 'offline', organizer_unit_id: 'TEST-UNIT-IR', country_id: 'TEST-TH', location: 'Fake Meeting Room', meeting_url: '', start_date: nextWeek, end_date: nextWeek, start_time: '13:00', end_time: '15:00', participant_count: 12, detail_th: 'Private only', detail_en: 'Private only', link_url: '', pin: false, status: 'upcoming', public_visible: false, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now },
    { event_id: 'TEST-EVT-CANCELLED', title_th: 'Fake Cancelled Event', title_en: 'Fake Cancelled Event', event_type: 'workshop', event_mode: 'online', organizer_unit_id: 'TEST-UNIT-SCI', country_id: 'TEST-TH', location: 'Online', meeting_url: 'https://example.invalid/cancelled', start_date: nextWeek, end_date: nextWeek, start_time: '10:00', end_time: '11:00', participant_count: 0, detail_th: 'Cancelled', detail_en: 'Cancelled', link_url: '', pin: false, status: 'cancelled', public_visible: true, is_deleted: false, created_by: 'TEST-SEED', updated_by: 'TEST-SEED', created_at: now, updated_at: now }
  ];

  batches[IROUP_V2_SHEETS.MOBILITY_PARTICIPANT] = [
    { participant_id: 'TEST-MBP-001', mobility_id: 'TEST-REC-COLLIDE', participant_type: 'student', person_source: 'STUDENT', person_id: 'TEST-STU-001', unit_id_snapshot: 'TEST-UNIT-SCI', full_name_snapshot: 'Fake Student One Sample', gender_snapshot: 'male', program_or_position_snapshot: 'Test Science Program', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-002', mobility_id: 'TEST-REC-COLLIDE', participant_type: 'student', person_source: 'STUDENT', person_id: 'TEST-STU-002', unit_id_snapshot: 'TEST-UNIT-ENG', full_name_snapshot: 'Fake Student Two Sample', gender_snapshot: 'female', program_or_position_snapshot: 'Test Engineering Program', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-003', mobility_id: 'TEST-REC-COLLIDE', participant_type: 'staff', person_source: 'STAFF', person_id: 'TEST-STF-001', unit_id_snapshot: 'TEST-UNIT-IR', full_name_snapshot: 'Fake Staff One Sample', gender_snapshot: 'female', program_or_position_snapshot: 'Test Officer', role: 'coordinator', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-004', mobility_id: 'TEST-MOB-OUT-UPCOMING', participant_type: 'student', person_source: 'STUDENT', person_id: 'TEST-STU-001', unit_id_snapshot: 'TEST-UNIT-SCI', full_name_snapshot: 'Fake Student One Sample', gender_snapshot: 'male', program_or_position_snapshot: 'Test Science Program', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-005', mobility_id: 'TEST-MOB-OUT-UPCOMING', participant_type: 'student', person_source: 'STUDENT', person_id: 'TEST-STU-002', unit_id_snapshot: 'TEST-UNIT-ENG', full_name_snapshot: 'Fake Student Two Sample', gender_snapshot: 'female', program_or_position_snapshot: 'Test Engineering Program', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-006', mobility_id: 'TEST-MOB-COMPLETED', participant_type: 'staff', person_source: 'STAFF', person_id: 'TEST-STF-002', unit_id_snapshot: 'TEST-UNIT-SCI', full_name_snapshot: 'Fake Lecturer Sample', gender_snapshot: 'male', program_or_position_snapshot: 'Test Lecturer', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-007', mobility_id: 'TEST-MOB-CANCELLED', participant_type: 'guest', person_source: 'MANUAL', person_id: 'TEST-PER-001', unit_id_snapshot: 'TEST-UNIT-IR', full_name_snapshot: 'Fake Guest Sample', gender_snapshot: 'female', program_or_position_snapshot: 'Guest speaker', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-008', mobility_id: 'TEST-MOB-PRIVATE', participant_type: 'external', person_source: 'MANUAL', person_id: 'TEST-PER-002', unit_id_snapshot: '', full_name_snapshot: 'Fake External Sample', gender_snapshot: 'male', program_or_position_snapshot: 'External partner staff', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-009', mobility_id: 'TEST-MOB-DELETED', participant_type: 'student', person_source: 'STUDENT', person_id: 'TEST-STU-001', unit_id_snapshot: 'TEST-UNIT-SCI', full_name_snapshot: 'Fake Student One Sample', gender_snapshot: 'male', program_or_position_snapshot: 'Test Science Program', role: 'participant', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { participant_id: 'TEST-MBP-DELETED', mobility_id: 'TEST-REC-COLLIDE', participant_type: 'student', person_source: 'STUDENT', person_id: 'TEST-STU-003', unit_id_snapshot: 'TEST-UNIT-SCI', full_name_snapshot: 'Inactive Student Sample', gender_snapshot: 'male', program_or_position_snapshot: 'Inactive Program', role: 'participant', is_deleted: true, created_by: 'TEST-SEED', created_at: now }
  ];

  batches[IROUP_V2_SHEETS.TRAVEL_PARTICIPANT] = [
    { travel_participant_id: 'TEST-TVP-001', travel_id: 'TEST-TRV-001', person_source: 'STAFF', person_id: 'TEST-STF-001', full_name_snapshot: 'Fake Staff One Sample', unit_id_snapshot: 'TEST-UNIT-IR', position_snapshot: 'Test Officer', role: 'traveler', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { travel_participant_id: 'TEST-TVP-002', travel_id: 'TEST-TRV-001', person_source: 'STAFF', person_id: 'TEST-STF-002', full_name_snapshot: 'Fake Lecturer Sample', unit_id_snapshot: 'TEST-UNIT-SCI', position_snapshot: 'Test Lecturer', role: 'traveler', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { travel_participant_id: 'TEST-TVP-003', travel_id: 'TEST-TRV-PRIVATE', person_source: 'MANUAL', person_id: 'TEST-PER-002', full_name_snapshot: 'Fake External Sample', unit_id_snapshot: '', position_snapshot: 'External partner staff', role: 'observer', is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { travel_participant_id: 'TEST-TVP-DELETED', travel_id: 'TEST-TRV-001', person_source: 'STAFF', person_id: 'TEST-STF-003', full_name_snapshot: 'Inactive Staff Sample', unit_id_snapshot: 'TEST-UNIT-OLD', position_snapshot: 'Inactive', role: 'traveler', is_deleted: true, created_by: 'TEST-SEED', created_at: now }
  ];

  batches[IROUP_V2_SHEETS.BUDGET] = [
    { budget_id: 'TEST-BDG-MOB-001', module: 'mobility', record_id: 'TEST-REC-COLLIDE', budget_type_id: 'TEST-BUDGET-INTERNAL', budget_source_type: 'internal_unit', budget_source_unit_id: 'TEST-UNIT-IR', budget_source_name: 'Test IR Office Budget', currency: 'THB', exchange_rate: 1, amount: 50000, amount_thb: 50000, budget_note: 'Fake internal budget', is_internal: true, is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { budget_id: 'TEST-BDG-TRV-001', module: 'travel', record_id: 'TEST-TRV-001', budget_type_id: 'TEST-BUDGET-UNIVERSITY', budget_source_type: 'university', budget_source_unit_id: '', budget_source_name: 'Test University Budget', currency: 'THB', exchange_rate: 1, amount: 75000, amount_thb: 75000, budget_note: 'Fake university budget', is_internal: true, is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { budget_id: 'TEST-BDG-EVT-001', module: 'event', record_id: 'TEST-EVT-001', budget_type_id: 'TEST-BUDGET-EXTERNAL', budget_source_type: 'external_partner', budget_source_unit_id: '', budget_source_name: 'Fake External Sponsor', currency: 'USD', exchange_rate: 36, amount: 1000, amount_thb: 36000, budget_note: 'Fake external budget', is_internal: false, is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { budget_id: 'TEST-BDG-NONE', module: 'mobility', record_id: 'TEST-MOB-NOBUDGET', budget_type_id: 'TEST-BUDGET-NONE', budget_source_type: 'none', budget_source_unit_id: '', budget_source_name: 'No budget', currency: 'THB', exchange_rate: 1, amount: 0, amount_thb: 0, budget_note: 'No-budget test project', is_internal: false, is_deleted: false, created_by: 'TEST-SEED', created_at: now },
    { budget_id: 'TEST-BDG-DELETED', module: 'mobility', record_id: 'TEST-REC-COLLIDE', budget_type_id: 'TEST-BUDGET-INTERNAL', budget_source_type: 'internal_unit', budget_source_unit_id: 'TEST-UNIT-IR', budget_source_name: 'Deleted fake budget', currency: 'THB', exchange_rate: 1, amount: 99999, amount_thb: 99999, budget_note: 'Should be excluded from summaries', is_internal: true, is_deleted: true, created_by: 'TEST-SEED', created_at: now },
    { budget_id: 'TEST-BDG-COLLIDE-MOU', module: 'mou', record_id: 'TEST-REC-COLLIDE', budget_type_id: 'TEST-BUDGET-NONE', budget_source_type: 'none', budget_source_unit_id: '', budget_source_name: 'No budget', currency: 'THB', exchange_rate: 1, amount: 0, amount_thb: 0, budget_note: 'Cross-module record_id collision test for MOU', is_internal: false, is_deleted: false, created_by: 'TEST-SEED', created_at: now }
  ];

  batches[IROUP_V2_SHEETS.FILES] = [
    { file_id: 'TEST-FIL-SCH-POSTER', module: 'scholarship', record_id: 'TEST-SCH-001', file_role_id: 'TEST-FILE-POSTER', file_name: 'fake-public-scholarship-poster.png', mime_type: 'image/png', drive_file_id: 'TEST-DRIVE-SCH-POSTER', file_url: 'https://example.invalid/files/fake-public-scholarship-poster.png', thumbnail_url: 'https://example.invalid/files/fake-public-scholarship-poster-thumb.png', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Should be exposed publicly' },
    { file_id: 'TEST-FIL-MOU-PDF', module: 'mou', record_id: 'TEST-REC-COLLIDE', file_role_id: 'TEST-FILE-PUBLIC-PDF', file_name: 'fake-public-mou.pdf', mime_type: 'application/pdf', drive_file_id: 'TEST-DRIVE-MOU-PDF', file_url: 'https://example.invalid/files/fake-public-mou.pdf', thumbnail_url: '', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Should be exposed publicly when parent visible' },
    { file_id: 'TEST-FIL-PRIVATE-PARENT', module: 'mou', record_id: 'TEST-MOU-PRIVATE', file_role_id: 'TEST-FILE-PUBLIC-PDF', file_name: 'fake-private-parent-public-file.pdf', mime_type: 'application/pdf', drive_file_id: 'TEST-DRIVE-PRIVATE-PARENT', file_url: 'https://example.invalid/files/fake-private-parent-public-file.pdf', thumbnail_url: '', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Must not be public because parent is private' },
    { file_id: 'TEST-FIL-INTERNAL-EVIDENCE', module: 'mobility', record_id: 'TEST-REC-COLLIDE', file_role_id: 'TEST-FILE-EVIDENCE', file_name: 'fake-internal-evidence.pdf', mime_type: 'application/pdf', drive_file_id: 'TEST-DRIVE-EVIDENCE', file_url: 'https://example.invalid/files/fake-internal-evidence.pdf', thumbnail_url: '', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Must not be public because role public_safe is false' },
    { file_id: 'TEST-FIL-SOFT-DELETED', module: 'scholarship', record_id: 'TEST-SCH-001', file_role_id: 'TEST-FILE-POSTER', file_name: 'fake-deleted-public-file.png', mime_type: 'image/png', drive_file_id: 'TEST-DRIVE-DELETED-FILE', file_url: 'https://example.invalid/files/fake-deleted-public-file.png', thumbnail_url: '', visibility_level: 'public', is_deleted: true, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Must not be public because file is soft-deleted' },
    { file_id: 'TEST-FIL-DELETED-PARENT', module: 'mobility', record_id: 'TEST-MOB-DELETED', file_role_id: 'TEST-FILE-POSTER', file_name: 'fake-deleted-parent-file.png', mime_type: 'image/png', drive_file_id: 'TEST-DRIVE-DELETED-PARENT', file_url: 'https://example.invalid/files/fake-deleted-parent-file.png', thumbnail_url: '', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Must not be public because parent is soft-deleted' },
    { file_id: 'TEST-FIL-COLLIDE-MOU', module: 'mou', record_id: 'TEST-REC-COLLIDE', file_role_id: 'TEST-FILE-BANNER', file_name: 'fake-collide-mou-banner.png', mime_type: 'image/png', drive_file_id: 'TEST-DRIVE-COLLIDE-MOU', file_url: 'https://example.invalid/files/fake-collide-mou-banner.png', thumbnail_url: '', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Cross-module record_id collision file for MOU' },
    { file_id: 'TEST-FIL-COLLIDE-MOB', module: 'mobility', record_id: 'TEST-REC-COLLIDE', file_role_id: 'TEST-FILE-BANNER', file_name: 'fake-collide-mobility-banner.png', mime_type: 'image/png', drive_file_id: 'TEST-DRIVE-COLLIDE-MOB', file_url: 'https://example.invalid/files/fake-collide-mobility-banner.png', thumbnail_url: '', visibility_level: 'public', is_deleted: false, uploaded_by: 'TEST-SEED', uploaded_at: now, note: 'Cross-module record_id collision file for Mobility' }
  ];

  batches[IROUP_V2_SHEETS.AUDIT_LOG] = [
    { log_id: 'TEST-LOG-001', module: 'mobility', record_id: 'TEST-REC-COLLIDE', action: 'create', before_json: '{}', after_json: '{"status":"active"}', performed_by: 'TEST-SEED', performed_at: now },
    { log_id: 'TEST-LOG-002', module: 'mobility', record_id: 'TEST-MOB-DELETED', action: 'soft_delete', before_json: '{"is_deleted":false}', after_json: '{"is_deleted":true}', performed_by: 'TEST-SEED', performed_at: now },
    { log_id: 'TEST-LOG-003', module: 'event', record_id: 'TEST-EVT-001', action: 'public_cache_refresh', before_json: '{}', after_json: '{"cached":true}', performed_by: 'TEST-SEED', performed_at: now }
  ];

  batches[IROUP_V2_SHEETS.PUBLIC_CACHE] = [
    { cache_id: 'TEST-CACHE-MOBILITY', module: 'mobility', schema_version: IROUP_V2_SCHEMA_VERSION, json_data: '{"module":"mobility","test":true}', updated_at: now, expires_at: nextWeek },
    { cache_id: 'TEST-CACHE-EXPIRED', module: 'event', schema_version: IROUP_V2_SCHEMA_VERSION, json_data: '{"module":"event","expired":true}', updated_at: expiredStart, expires_at: expiredEnd }
  ];

  return batches;
}

function v2SeedDate_(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return Utilities.formatDate(date, 'Asia/Bangkok', 'yyyy-MM-dd');
}
