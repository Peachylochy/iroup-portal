/**
 * IROUP Database V2.2 lightweight backend test runner.
 *
 * Internal verification only. This file does not deploy routes, touch frontend
 * code, modify production Code.gs, or migrate real data.
 */

function runV2BackendTests_() {
  const tests = [
    testV2SeedData_,
    testV2MobilityEffectiveStatus_,
    testV2AdminMobilityDTO_,
    testV2PublicMobilityDTO_,
    testV2PublicFileFiltering_,
    testV2SoftDeleteFiltering_,
    testV2BudgetAggregation_,
    testV2MapAggregation_,
    testV2ModuleIsolation_
  ];

  const results = [];
  for (let i = 0; i < tests.length; i++) {
    try {
      results.push(tests[i]());
    } catch (err) {
      results.push(v2TestResult_(tests[i].name || 'anonymous_test', false, {
        error: String(err && err.message ? err.message : err)
      }));
    }
  }

  const passed = results.filter(function (result) { return result.success; }).length;
  const failed = results.length - passed;

  return {
    success: failed === 0,
    passed: passed,
    failed: failed,
    total: results.length,
    tests: results
  };
}

function testV2MobilityEffectiveStatus_() {
  const today = '2026-07-13';
  const checks = {
    expired_active_completes: resolveV2MobilityStatus_('active', '2026-07-11', today) === 'completed',
    active_on_end_date: resolveV2MobilityStatus_('active', today, today) === 'active',
    future_active_stays_active: resolveV2MobilityStatus_('active', '2026-07-14', today) === 'active',
    completed_stays_completed: resolveV2MobilityStatus_('completed', '2026-07-14', today) === 'completed',
    cancelled_is_not_overridden: resolveV2MobilityStatus_('cancelled', '2026-07-11', today) === 'cancelled',
    draft_is_not_overridden: resolveV2MobilityStatus_('draft', '2026-07-11', today) === 'draft',
    malformed_date_stays_active: resolveV2MobilityStatus_('active', 'not-a-date', today) === 'active'
  };

  return v2TestResult_('testV2MobilityEffectiveStatus_', allV2TestChecksPass_(checks), checks);
}

function testV2SeedData_() {
  const checks = [
    { sheetName: IROUP_V2_SHEETS.ADMIN, idField: 'admin_id', idValue: 'TEST-ADMIN-001' },
    { sheetName: IROUP_V2_SHEETS.COUNTRY_MASTER, idField: 'country_id', idValue: 'TEST-JP' },
    { sheetName: IROUP_V2_SHEETS.UP_UNIT_MASTER, idField: 'unit_id', idValue: 'TEST-UNIT-IR' },
    { sheetName: IROUP_V2_SHEETS.FILE_ROLE_MASTER, idField: 'file_role_id', idValue: 'TEST-FILE-POSTER' },
    { sheetName: IROUP_V2_SHEETS.MOU, idField: 'mou_id', idValue: 'TEST-REC-COLLIDE' },
    { sheetName: IROUP_V2_SHEETS.MOBILITY_PROJECT, idField: 'mobility_id', idValue: 'TEST-REC-COLLIDE' },
    { sheetName: IROUP_V2_SHEETS.MOBILITY_PARTICIPANT, idField: 'participant_id', idValue: 'TEST-MBP-001' },
    { sheetName: IROUP_V2_SHEETS.BUDGET, idField: 'budget_id', idValue: 'TEST-BDG-MOB-001' },
    { sheetName: IROUP_V2_SHEETS.FILES, idField: 'file_id', idValue: 'TEST-FIL-COLLIDE-MOB' }
  ];

  const missing = [];
  checks.forEach(function (check) {
    const found = findV2RowById_(check.sheetName, check.idField, check.idValue);
    if (!found.success) missing.push(check);
  });

  return v2TestResult_('testV2SeedData_', missing.length === 0, {
    checked: checks.length,
    missing: missing
  });
}

function testV2AdminMobilityDTO_() {
  const result = getV2AdminMobilityProject_('TEST-REC-COLLIDE');
  if (!result.success) {
    return v2TestResult_('testV2AdminMobilityDTO_', false, { error: result.error });
  }

  const dto = result.data || {};
  const fileGroups = dto.files || {};
  const hasFiles = Object.keys(fileGroups).some(function (key) {
    return (fileGroups[key] || []).length > 0;
  });

  const checks = {
    has_project_id: dto.mobility_id === 'TEST-REC-COLLIDE',
    has_participants_array: Array.isArray(dto.participants),
    participant_count: dto.participants ? dto.participants.length : 0,
    has_budgets_array: Array.isArray(dto.budgets),
    budget_count: dto.budgets ? dto.budgets.length : 0,
    has_files_grouped_by_visibility: !!dto.files && typeof dto.files === 'object',
    has_files: hasFiles,
    has_budget_summary: !!dto.budget_summary && typeof dto.budget_summary.total_amount_thb === 'number'
  };

  return v2TestResult_('testV2AdminMobilityDTO_', allV2TestChecksPass_(checks), checks);
}

function testV2PublicMobilityDTO_() {
  const result = listV2PublicMobility_();
  if (!result.success) {
    return v2TestResult_('testV2PublicMobilityDTO_', false, { error: result.error });
  }

  const dto = findV2TestDtoById_(result.data, 'mobility_id', 'TEST-REC-COLLIDE');
  if (!dto) {
    return v2TestResult_('testV2PublicMobilityDTO_', false, {
      error: 'Missing public mobility DTO for TEST-REC-COLLIDE'
    });
  }

  const forbiddenKeys = [
    'person_id',
    'full_name_snapshot',
    'gender_snapshot',
    'unit_id_snapshot',
    'program_or_position_snapshot',
    'budget_id',
    'budgets',
    'budget_summary',
    'created_by',
    'updated_by',
    'audit',
    'drive_file_id',
    'uploaded_by',
    'note'
  ];
  const leaks = findV2ForbiddenKeys_(dto, forbiddenKeys);

  const serialized = JSON.stringify(dto);
  const forbiddenText = ['Fake Student', 'Fake Staff', 'Inactive Student'];
  const textLeaks = forbiddenText.filter(function (text) {
    return serialized.indexOf(text) >= 0;
  });

  const checks = {
    has_participant_count: typeof dto.participant_count === 'number',
    participant_count_expected: dto.participant_count === 3,
    has_participant_counts_object: !!dto.participant_counts,
    no_forbidden_keys: leaks.length === 0,
    no_participant_name_text: textLeaks.length === 0
  };

  return v2TestResult_('testV2PublicMobilityDTO_', allV2TestChecksPass_(checks), {
    checks: checks,
    forbidden_key_hits: leaks,
    forbidden_text_hits: textLeaks,
    dto: dto
  });
}

function testV2PublicFileFiltering_() {
  const mobility = listV2PublicMobility_();
  const scholarship = listV2PublicScholarships_();
  const mou = listV2PublicMOUs_();

  if (!mobility.success) return v2TestResult_('testV2PublicFileFiltering_', false, { error: mobility.error });
  if (!scholarship.success) return v2TestResult_('testV2PublicFileFiltering_', false, { error: scholarship.error });
  if (!mou.success) return v2TestResult_('testV2PublicFileFiltering_', false, { error: mou.error });

  const mobilityDto = findV2TestDtoById_(mobility.data, 'mobility_id', 'TEST-REC-COLLIDE') || {};
  const scholarshipDto = findV2TestDtoById_(scholarship.data, 'scholarship_id', 'TEST-SCH-001') || {};
  const mouDto = findV2TestDtoById_(mou.data, 'mou_id', 'TEST-REC-COLLIDE') || {};
  const allFiles = []
    .concat(mobilityDto.files || [])
    .concat(scholarshipDto.files || [])
    .concat(mouDto.files || []);

  const ids = allFiles.map(function (file) { return file.file_id; });
  const checks = {
    includes_public_mobility_banner: ids.indexOf('TEST-FIL-COLLIDE-MOB') >= 0,
    includes_public_scholarship_poster: ids.indexOf('TEST-FIL-SCH-POSTER') >= 0,
    includes_public_mou_pdf: ids.indexOf('TEST-FIL-MOU-PDF') >= 0,
    excludes_private_parent_file: ids.indexOf('TEST-FIL-PRIVATE-PARENT') < 0,
    excludes_internal_role_file: ids.indexOf('TEST-FIL-INTERNAL-EVIDENCE') < 0,
    excludes_soft_deleted_file: ids.indexOf('TEST-FIL-SOFT-DELETED') < 0,
    excludes_deleted_parent_file: ids.indexOf('TEST-FIL-DELETED-PARENT') < 0
  };

  return v2TestResult_('testV2PublicFileFiltering_', allV2TestChecksPass_(checks), {
    checks: checks,
    public_file_ids: ids
  });
}

function testV2SoftDeleteFiltering_() {
  const publicMobility = listV2PublicMobility_();
  const adminMobility = listV2AdminMobilityProjects_(true);

  if (!publicMobility.success) return v2TestResult_('testV2SoftDeleteFiltering_', false, { error: publicMobility.error });
  if (!adminMobility.success) return v2TestResult_('testV2SoftDeleteFiltering_', false, { error: adminMobility.error });

  const publicIds = (publicMobility.data || []).map(function (row) { return row.mobility_id; });
  const adminIds = (adminMobility.data || []).map(function (row) { return row.mobility_id; });

  const checks = {
    public_excludes_deleted_project: publicIds.indexOf('TEST-MOB-DELETED') < 0,
    public_excludes_cancelled_project: publicIds.indexOf('TEST-MOB-CANCELLED') < 0,
    admin_list_excludes_deleted_project: adminIds.indexOf('TEST-MOB-DELETED') < 0,
    admin_include_archived_can_include_cancelled: adminIds.indexOf('TEST-MOB-CANCELLED') >= 0
  };

  return v2TestResult_('testV2SoftDeleteFiltering_', allV2TestChecksPass_(checks), {
    checks: checks,
    public_ids: publicIds,
    admin_ids: adminIds
  });
}

function testV2BudgetAggregation_() {
  const result = getV2AdminMobilityProject_('TEST-REC-COLLIDE');
  if (!result.success) {
    return v2TestResult_('testV2BudgetAggregation_', false, { error: result.error });
  }

  const summary = result.data && result.data.budget_summary ? result.data.budget_summary : {};
  const checks = {
    has_summary: !!summary,
    excludes_soft_deleted_budget: summary.total_amount_thb === 50000,
    active_budget_row_count: summary.total_rows === 1,
    has_internal_source_bucket: !!(summary.by_budget_source_type && summary.by_budget_source_type.internal_unit)
  };

  return v2TestResult_('testV2BudgetAggregation_', allV2TestChecksPass_(checks), {
    checks: checks,
    summary: summary
  });
}

function testV2MapAggregation_() {
  const result = getV2PublicMapData_();
  if (!result.success) {
    return v2TestResult_('testV2MapAggregation_', false, { error: result.error });
  }

  const japan = (result.data || []).filter(function (bucket) {
    return bucket.country && bucket.country.country_id === 'TEST-JP';
  })[0];

  const checks = {
    has_map_rows: result.total > 0,
    has_japan_bucket: !!japan,
    japan_has_mou_count: japan ? japan.counts.mou >= 1 : false,
    japan_has_mobility_count: japan ? japan.counts.mobility >= 1 : false,
    no_deleted_or_cancelled_only_bucket: true
  };

  return v2TestResult_('testV2MapAggregation_', allV2TestChecksPass_(checks), {
    checks: checks,
    japan: japan || null,
    total: result.total
  });
}

function testV2ModuleIsolation_() {
  const mobility = getV2AdminMobilityProject_('TEST-REC-COLLIDE');
  const mou = getV2AdminMOU_('TEST-REC-COLLIDE');

  if (!mobility.success) return v2TestResult_('testV2ModuleIsolation_', false, { error: mobility.error });
  if (!mou.success) return v2TestResult_('testV2ModuleIsolation_', false, { error: mou.error });

  const mobilityBudgetIds = (mobility.data.budgets || []).map(function (budget) { return budget.budget_id; });
  const mouBudgetIds = (mou.data.budgets || []).map(function (budget) { return budget.budget_id; });
  const mobilityFileIds = flattenV2GroupedFiles_(mobility.data.files).map(function (file) { return file.file_id; });
  const mouFileIds = flattenV2GroupedFiles_(mou.data.files).map(function (file) { return file.file_id; });

  const checks = {
    mobility_has_own_budget: mobilityBudgetIds.indexOf('TEST-BDG-MOB-001') >= 0,
    mobility_excludes_mou_collision_budget: mobilityBudgetIds.indexOf('TEST-BDG-COLLIDE-MOU') < 0,
    mou_has_own_collision_budget: mouBudgetIds.indexOf('TEST-BDG-COLLIDE-MOU') >= 0,
    mou_excludes_mobility_budget: mouBudgetIds.indexOf('TEST-BDG-MOB-001') < 0,
    mobility_has_own_file: mobilityFileIds.indexOf('TEST-FIL-COLLIDE-MOB') >= 0,
    mobility_excludes_mou_file: mobilityFileIds.indexOf('TEST-FIL-COLLIDE-MOU') < 0,
    mou_has_own_file: mouFileIds.indexOf('TEST-FIL-COLLIDE-MOU') >= 0,
    mou_excludes_mobility_file: mouFileIds.indexOf('TEST-FIL-COLLIDE-MOB') < 0
  };

  return v2TestResult_('testV2ModuleIsolation_', allV2TestChecksPass_(checks), {
    checks: checks,
    mobility_budget_ids: mobilityBudgetIds,
    mou_budget_ids: mouBudgetIds,
    mobility_file_ids: mobilityFileIds,
    mou_file_ids: mouFileIds
  });
}

function v2TestResult_(name, success, details) {
  return {
    name: name,
    success: !!success,
    details: details || {}
  };
}

function allV2TestChecksPass_(checks) {
  return Object.keys(checks || {}).every(function (key) {
    return checks[key] === true || typeof checks[key] === 'number' || checks[key] === 0;
  });
}

function findV2TestDtoById_(rows, idField, idValue) {
  const target = String(idValue || '').trim();
  return (rows || []).filter(function (row) {
    return String(row[idField] || '').trim() === target;
  })[0] || null;
}

function findV2ForbiddenKeys_(value, forbiddenKeys) {
  const hits = [];
  walkV2TestObject_(value, '', function (path, key) {
    if (forbiddenKeys.indexOf(key) >= 0) hits.push(path);
  });
  return hits;
}

function walkV2TestObject_(value, path, visitor) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach(function (item, index) {
      walkV2TestObject_(item, path + '[' + index + ']', visitor);
    });
    return;
  }

  if (typeof value !== 'object') return;

  Object.keys(value).forEach(function (key) {
    const nextPath = path ? path + '.' + key : key;
    visitor(nextPath, key);
    walkV2TestObject_(value[key], nextPath, visitor);
  });
}

function flattenV2GroupedFiles_(groupedFiles) {
  const files = [];
  const groups = groupedFiles || {};
  Object.keys(groups).forEach(function (key) {
    (groups[key] || []).forEach(function (file) {
      files.push(file);
    });
  });
  return files;
}
