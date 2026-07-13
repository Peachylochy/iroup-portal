/**
 * IROUP Database V2.2 lookup/master DTO helpers.
 *
 * Lookup routes return active, sanitized master data for frontend selectors.
 */

function listV2LookupCountries_() {
  return listV2LookupSheet_(IROUP_V2_SHEETS.COUNTRY_MASTER, mapV2LookupCountryDto_);
}

function listV2LookupUnits_() {
  return listV2LookupSheet_(IROUP_V2_SHEETS.UP_UNIT_MASTER, mapV2LookupUnitDto_);
}

function listV2LookupStudents_() {
  return listV2PersonLookupSheet_(IROUP_V2_SHEETS.PERSON_STUDENT, mapV2LookupStudentDto_);
}

function listV2LookupStaff_() {
  return listV2PersonLookupSheet_(IROUP_V2_SHEETS.PERSON_STAFF, mapV2LookupStaffDto_);
}

function searchV2AdminPeople_(request) {
  const params = request && request.params ? request.params : {};
  const query = normalizeV2PersonSearchText_(params.q || params.query || params.search || params.term || '');
  const type = String(params.type || params.person_type || 'all').trim().toLowerCase();
  const limit = clampV2PersonSearchLimit_(params.limit || params.page_size || 10);

  if (query.length < 2) {
    return publicResponseV2_(true, [], 0, '');
  }

  const results = [];
  if (type !== 'staff') {
    appendV2PersonSearchResults_(results, IROUP_V2_SHEETS.PERSON_STUDENT, mapV2PersonSearchStudentDto_, query);
  }
  if (type !== 'student') {
    appendV2PersonSearchResults_(results, IROUP_V2_SHEETS.PERSON_STAFF, mapV2PersonSearchStaffDto_, query);
  }

  results.sort(function (a, b) {
    if (a._score !== b._score) return a._score - b._score;
    return String(a.full_name_th || a.full_name_en || '').localeCompare(String(b.full_name_th || b.full_name_en || ''));
  });

  const dtos = results.slice(0, limit).map(function (row) {
    delete row._score;
    return row;
  });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function resolveV2AdminPeopleBatch_(request) {
  const payload = extractV2PersonBatchPayload_(request);
  const parsed = parseV2PersonBatchIds_(payload.ids || payload.person_ids || payload.text || '');
  if (!parsed.ids.length) {
    return publicResponseV2_(false, {
      matched: [],
      not_found: [],
      duplicate_ids: parsed.duplicate_ids
    }, 0, 'At least one person ID is required.');
  }
  if (parsed.ids.length > 200) {
    return publicResponseV2_(false, null, 0, 'A batch can contain at most 200 unique IDs.');
  }

  const studentRead = readV2Sheet_(IROUP_V2_SHEETS.PERSON_STUDENT);
  if (!studentRead.success) return publicResponseV2_(false, null, 0, studentRead.error);
  const staffRead = readV2Sheet_(IROUP_V2_SHEETS.PERSON_STAFF);
  if (!staffRead.success) return publicResponseV2_(false, null, 0, staffRead.error);

  const studentMap = buildV2ActivePersonMap_(studentRead.data || [], 'student_id');
  const staffMap = buildV2ActivePersonMap_(staffRead.data || [], 'staff_id');
  const matched = [];
  const notFound = [];
  parsed.ids.forEach(function (id) {
    const key = normalizeV2PersonBatchId_(id);
    if (studentMap[key]) {
      matched.push(mapV2PersonSearchStudentDto_(studentMap[key]));
    } else if (staffMap[key]) {
      matched.push(mapV2PersonSearchStaffDto_(staffMap[key]));
    } else {
      notFound.push(id);
    }
  });

  const existingKeys = {};
  const mobilityId = cleanV2EventText_(payload.mobility_id || '');
  if (mobilityId) {
    const participantRead = readV2Sheet_(IROUP_V2_SHEETS.MOBILITY_PARTICIPANT);
    if (!participantRead.success) return publicResponseV2_(false, null, 0, participantRead.error);
    (participantRead.data || []).forEach(function (row) {
      if (String(row.mobility_id || '').trim() !== mobilityId || isSoftDeletedV2_(row)) return;
      existingKeys[normalizeV2MobilityPersonKey_(row.person_source, row.person_id)] = true;
    });
  }

  matched.forEach(function (person) {
    person.already_linked = !!existingKeys[normalizeV2MobilityPersonKey_(person.source, person.person_id)];
  });

  return publicResponseV2_(true, {
    matched: matched,
    not_found: notFound,
    duplicate_ids: parsed.duplicate_ids,
    requested_count: parsed.requested_count,
    unique_count: parsed.ids.length,
    matched_count: matched.length,
    not_found_count: notFound.length,
    already_linked_count: matched.filter(function (person) { return person.already_linked; }).length
  }, matched.length, '');
}

function extractV2PersonBatchPayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || params.payload || body;
  if (candidate && typeof candidate === 'object') return candidate;
  if (typeof candidate === 'string') {
    try { return JSON.parse(candidate); } catch (err) { return { text: candidate }; }
  }
  return params;
}

function parseV2PersonBatchIds_(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/[\s,;]+/);
  const seen = {};
  const ids = [];
  const duplicates = [];
  let requestedCount = 0;
  source.forEach(function (raw) {
    const id = cleanV2EventText_(raw || '');
    if (!id) return;
    requestedCount++;
    const key = normalizeV2PersonBatchId_(id);
    if (seen[key]) {
      if (duplicates.indexOf(id) < 0) duplicates.push(id);
      return;
    }
    seen[key] = true;
    ids.push(id);
  });
  return { ids: ids, duplicate_ids: duplicates, requested_count: requestedCount };
}

function normalizeV2PersonBatchId_(value) {
  return String(value || '').trim().toUpperCase();
}

function buildV2ActivePersonMap_(rows, idField) {
  const map = {};
  (rows || []).forEach(function (row) {
    if (isSoftDeletedV2_(row)) return;
    if (typeof row.active !== 'undefined' && row.active !== '' && !isTruthyV2_(row.active)) return;
    const key = normalizeV2PersonBatchId_(row[idField]);
    if (key && !map[key]) map[key] = row;
  });
  return map;
}

function normalizeV2MobilityPersonKey_(source, personId) {
  return String(source || '').trim().toUpperCase() + '|' + normalizeV2PersonBatchId_(personId);
}

function listV2LookupFileRoles_() {
  return listV2LookupSheet_(IROUP_V2_SHEETS.FILE_ROLE_MASTER, mapV2LookupFileRoleDto_);
}

function listV2LookupBudgetTypes_() {
  return listV2LookupSheet_(IROUP_V2_SHEETS.BUDGET_TYPE_MASTER, mapV2LookupBudgetTypeDto_);
}

function listV2LookupEventTypes_() {
  const read = readV2Sheet_('MASTER_EVENT_TYPES');
  if (!read.success) {
    return publicResponseV2_(false, null, 0, read.error || 'Unable to read V2 lookup sheet', 'V2_LOOKUP_READ_FAILED');
  }

  const rows = read.data || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      return isTruthyV2_(row.is_active);
    })
    .map(mapV2LookupEventTypeDto_)
    .sort(function (a, b) {
      const aSort = typeof a.sort_order === 'undefined' ? 999999 : Number(a.sort_order);
      const bSort = typeof b.sort_order === 'undefined' ? 999999 : Number(b.sort_order);
      if (aSort !== bSort) return aSort - bSort;
      return String(a.name_en || a.name_th || '').localeCompare(String(b.name_en || b.name_th || ''));
    });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function listV2PersonLookupSheet_(sheetName, mapper) {
  const read = readV2Sheet_(sheetName);
  if (!read.success) {
    return publicResponseV2_(false, null, 0, read.error || 'Unable to read V2 person lookup sheet', 'V2_LOOKUP_READ_FAILED');
  }

  const rows = read.data || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (typeof row.active === 'undefined' || row.active === '') return true;
      return isTruthyV2_(row.active);
    })
    .map(mapper)
    .sort(function (a, b) {
      return String(a.full_name_th || a.full_name_en || '').localeCompare(String(b.full_name_th || b.full_name_en || ''));
    });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function listV2LookupSheet_(sheetName, mapper) {
  const read = readV2Sheet_(sheetName);
  if (!read.success) {
    return publicResponseV2_(false, null, 0, read.error || 'Unable to read V2 lookup sheet', 'V2_LOOKUP_READ_FAILED');
  }

  const rows = read.data || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (typeof row.active === 'undefined' || row.active === '') return true;
      return isTruthyV2_(row.active);
    })
    .map(mapper)
    .sort(function (a, b) {
      const aSort = typeof a.sort_order === 'undefined' ? 999999 : Number(a.sort_order);
      const bSort = typeof b.sort_order === 'undefined' ? 999999 : Number(b.sort_order);
      if (aSort !== bSort) return aSort - bSort;
      return String(a.label || '').localeCompare(String(b.label || ''));
    });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function mapV2LookupCountryDto_(row) {
  return {
    country_id: row.country_id || '',
    iso2: row.iso2 || '',
    iso3: row.iso3 || '',
    country_name_en: row.country_name_en || '',
    country_name_th: row.country_name_th || '',
    continent_en: row.continent_en || '',
    continent_th: row.continent_th || '',
    flag_emoji: row.flag_emoji || '',
    label: row.country_name_en || row.country_name_th || row.country_id || '',
    sort_order: toNumberV2_(row.sort_order)
  };
}

function mapV2LookupUnitDto_(row) {
  return {
    unit_id: row.unit_id || '',
    unit_code: row.unit_code || '',
    unit_name_th: row.unit_name_th || '',
    unit_name_en: row.unit_name_en || '',
    unit_type: row.unit_type || '',
    parent_unit_id: row.parent_unit_id || '',
    label: row.unit_name_en || row.unit_name_th || row.unit_code || row.unit_id || '',
    sort_order: toNumberV2_(row.sort_order)
  };
}

function mapV2LookupStudentDto_(row) {
  return {
    student_id: row.student_id || '',
    full_name_th: row.full_name_th || '',
    full_name_en: row.full_name_en || '',
    gender: row.gender || '',
    unit_id: row.unit_id || '',
    program_th: row.program_th || '',
    degree_level: row.degree_level || '',
    student_status: row.student_status || ''
  };
}

function mapV2LookupStaffDto_(row) {
  return {
    staff_id: row.staff_id || '',
    full_name_th: row.full_name_th || '',
    full_name_en: row.full_name_en || '',
    gender: row.gender || '',
    unit_id: row.unit_id || '',
    position: row.position || '',
    staff_type: row.staff_type || ''
  };
}

function appendV2PersonSearchResults_(results, sheetName, mapper, query) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success || !sheetResult.data) return;

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) return;

  const rowNumbers = findV2PersonSearchCandidateRows_(sheet, headers, sheetName, query);
  rowNumbers.forEach(function (rowNumber) {
    const values = sheet.getRange(rowNumber, 1, 1, lastColumn).getValues()[0];
    const row = rowToObjectV2_(headers, values);
    if (isSoftDeletedV2_(row)) return;
    if (typeof row.active !== 'undefined' && row.active !== '' && !isTruthyV2_(row.active)) return;

    const dto = mapper(row);
    const haystack = normalizeV2PersonSearchText_([
      dto.person_id,
      dto.full_name_th,
      dto.full_name_en,
      dto.unit_id,
      dto.program_or_position,
      dto.degree_level,
      dto.status
    ].join(' '));

    if (haystack.indexOf(query) < 0) return;
    dto._score = getV2PersonSearchScore_(dto, query);
    results.push(dto);
  });
}

function findV2PersonSearchCandidateRows_(sheet, headers, sheetName, query) {
  const columnNames = getV2PersonSearchColumnNames_(sheetName);
  const lastRow = sheet.getLastRow();
  const maxCandidates = 300;
  const seen = {};
  const rows = [];

  for (let i = 0; i < columnNames.length; i++) {
    const colIndex = headers.indexOf(columnNames[i]);
    if (colIndex < 0) continue;

    const range = sheet.getRange(2, colIndex + 1, lastRow - 1, 1);
    const matches = range
      .createTextFinder(query)
      .matchCase(false)
      .matchEntireCell(false)
      .findAll();

    for (let j = 0; j < matches.length; j++) {
      const rowNumber = matches[j].getRow();
      if (seen[rowNumber]) continue;
      seen[rowNumber] = true;
      rows.push(rowNumber);
      if (rows.length >= maxCandidates) return rows;
    }
  }

  return rows;
}

function getV2PersonSearchColumnNames_(sheetName) {
  if (sheetName === IROUP_V2_SHEETS.PERSON_STUDENT) {
    return [
      'student_id',
      'full_name_th',
      'full_name_en',
      'first_name_th',
      'last_name_th',
      'first_name_en',
      'last_name_en',
      'unit_id',
      'program_th',
      'degree_level',
      'student_status'
    ];
  }
  if (sheetName === IROUP_V2_SHEETS.PERSON_STAFF) {
    return [
      'staff_id',
      'full_name_th',
      'full_name_en',
      'first_name_th',
      'last_name_th',
      'first_name_en',
      'last_name_en',
      'unit_id',
      'position',
      'staff_type'
    ];
  }
  return [];
}

function mapV2PersonSearchStudentDto_(row) {
  return {
    source: 'PERSON_STUDENT',
    participant_type: 'student',
    person_id: row.student_id || '',
    full_name_th: row.full_name_th || '',
    full_name_en: row.full_name_en || '',
    gender: row.gender || '',
    unit_id: row.unit_id || '',
    program_or_position: row.program_th || row.degree_level || '',
    degree_level: row.degree_level || '',
    status: row.student_status || '',
    type_label: 'นิสิต'
  };
}

function mapV2PersonSearchStaffDto_(row) {
  return {
    source: 'PERSON_STAFF',
    participant_type: 'staff',
    person_id: row.staff_id || '',
    full_name_th: row.full_name_th || '',
    full_name_en: row.full_name_en || '',
    gender: row.gender || '',
    unit_id: row.unit_id || '',
    program_or_position: row.position || row.staff_type || '',
    degree_level: '',
    status: row.staff_type || '',
    type_label: 'บุคลากร'
  };
}

function normalizeV2PersonSearchText_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function clampV2PersonSearchLimit_(value) {
  const limit = Number(value || 10);
  if (!Number.isFinite(limit) || limit <= 0) return 10;
  return Math.min(20, Math.max(1, Math.floor(limit)));
}

function getV2PersonSearchScore_(dto, query) {
  const id = normalizeV2PersonSearchText_(dto.person_id);
  const th = normalizeV2PersonSearchText_(dto.full_name_th);
  const en = normalizeV2PersonSearchText_(dto.full_name_en);
  if (id === query || th === query || en === query) return 0;
  if (id.indexOf(query) === 0 || th.indexOf(query) === 0 || en.indexOf(query) === 0) return 1;
  if (th.indexOf(query) >= 0 || en.indexOf(query) >= 0) return 2;
  return 3;
}

function mapV2LookupFileRoleDto_(row) {
  return {
    file_role_id: row.file_role_id || '',
    file_role_name: row.file_role_name || '',
    public_safe: isTruthyV2_(row.public_safe),
    label: row.file_role_name || row.file_role_id || '',
    sort_order: toNumberV2_(row.sort_order)
  };
}

function mapV2LookupBudgetTypeDto_(row) {
  return {
    budget_type_id: row.budget_type_id || '',
    budget_type_name: row.budget_type_name || '',
    label: row.budget_type_name || row.budget_type_id || '',
    sort_order: toNumberV2_(row.sort_order)
  };
}

function mapV2LookupEventTypeDto_(row) {
  return {
    event_type_id: row.event_type_id || '',
    name_th: row.name_th || '',
    name_en: row.name_en || '',
    icon: row.icon || '',
    color_token: row.color_token || '',
    sort_order: toNumberV2_(row.sort_order)
  };
}
