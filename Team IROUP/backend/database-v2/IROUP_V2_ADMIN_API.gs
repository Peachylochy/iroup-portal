/**
 * IROUP Database V2.2 admin/test read API layer.
 *
 * Isolated from production Code.gs. These functions shape normalized V2 sheet
 * data into DTOs for backend/API testing before frontend migration.
 */

function adminResponseV2_(success, data, total, error) {
  return {
    success: !!success,
    data: data === undefined ? null : data,
    total: total || 0,
    error: error || ''
  };
}

function getV2AdminMobilityProject_(mobilityId) {
  const valid = validateModuleRecordLinkV2_('mobility', mobilityId);
  if (!valid.success) return adminResponseV2_(false, null, 0, valid.error);

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const project = valid.details.row;
  const dto = mapV2AdminMobilityProjectDto_(project, context.data, true);
  return adminResponseV2_(true, dto, dto ? 1 : 0, '');
}

function listV2AdminMobilityProjects_(includeArchived) {
  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.MOBILITY_PROJECT] || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (includeArchived === true) return true;
      return ['cancelled', 'archived'].indexOf(String(row.status || '').trim()) < 0;
    })
    .map(function (row) {
      return mapV2AdminMobilityProjectSummaryDto_(row, ctx);
    });

  return adminResponseV2_(true, dtos, dtos.length, '');
}

function getV2AdminMOU_(mouId) {
  const valid = validateModuleRecordLinkV2_('mou', mouId);
  if (!valid.success) return adminResponseV2_(false, null, 0, valid.error);

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const mou = valid.details.row;
  const dto = mapV2AdminMOUDto_(mou, context.data, true);
  return adminResponseV2_(true, dto, dto ? 1 : 0, '');
}

function listV2AdminMOUs_(includeArchived) {
  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.MOU] || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (includeArchived === true) return true;
      return ['archived'].indexOf(String(row.status || '').trim()) < 0;
    })
    .map(function (row) {
      return mapV2AdminMOUSummaryDto_(row, ctx);
    });

  return adminResponseV2_(true, dtos, dtos.length, '');
}

function getV2AdminScholarship_(scholarshipId) {
  const valid = validateModuleRecordLinkV2_('scholarship', scholarshipId);
  if (!valid.success) return adminResponseV2_(false, null, 0, valid.error);

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const scholarship = valid.details.row;
  const dto = mapV2AdminScholarshipDto_(scholarship, context.data, true);
  return adminResponseV2_(true, dto, dto ? 1 : 0, '');
}

function listV2AdminScholarships_(includeArchived) {
  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.SCHOLARSHIP] || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (includeArchived === true) return true;
      return ['archived'].indexOf(String(row.status || '').trim()) < 0;
    })
    .map(function (row) {
      return mapV2AdminScholarshipSummaryDto_(row, ctx);
    });

  return adminResponseV2_(true, dtos, dtos.length, '');
}

function getV2AdminEvent_(eventId) {
  const valid = validateModuleRecordLinkV2_('event', eventId);
  if (!valid.success) return adminResponseV2_(false, null, 0, valid.error);

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const event = valid.details.row;
  const dto = mapV2AdminEventDto_(event, context.data, true);
  return adminResponseV2_(true, dto, dto ? 1 : 0, '');
}

function listV2AdminEvents_(includeArchived) {
  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.EVENT] || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (includeArchived === true) return true;
      return ['archived'].indexOf(String(row.status || '').trim()) < 0;
    })
    .map(function (row) {
      return mapV2AdminEventSummaryDto_(row, ctx);
    });

  return adminResponseV2_(true, dtos, dtos.length, '');
}

function buildV2AdminContext_() {
  const sheetNames = [
    IROUP_V2_SHEETS.COUNTRY_MASTER,
    IROUP_V2_SHEETS.UP_UNIT_MASTER,
    IROUP_V2_SHEETS.BUDGET_TYPE_MASTER,
    IROUP_V2_SHEETS.FILE_ROLE_MASTER,
    IROUP_V2_SHEETS.MOU,
    IROUP_V2_SHEETS.MOBILITY_PROJECT,
    IROUP_V2_SHEETS.MOBILITY_PARTICIPANT,
    IROUP_V2_SHEETS.SCHOLARSHIP,
    IROUP_V2_SHEETS.EVENT,
    IROUP_V2_SHEETS.BUDGET,
    IROUP_V2_SHEETS.FILES
  ];

  const tables = {};
  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const read = readV2Sheet_(sheetName);
    if (!read.success) {
      return adminResponseV2_(false, null, 0, read.error);
    }
    tables[sheetName] = read.data || [];
  }

  return adminResponseV2_(true, {
    tables: tables,
    countriesById: indexV2RowsById_(tables[IROUP_V2_SHEETS.COUNTRY_MASTER], 'country_id'),
    unitsById: indexV2RowsById_(tables[IROUP_V2_SHEETS.UP_UNIT_MASTER], 'unit_id'),
    budgetTypesById: indexV2RowsById_(tables[IROUP_V2_SHEETS.BUDGET_TYPE_MASTER], 'budget_type_id'),
    fileRolesById: indexV2RowsById_(tables[IROUP_V2_SHEETS.FILE_ROLE_MASTER], 'file_role_id')
  }, 1, '');
}

function indexV2RowsById_(rows, idField) {
  const index = {};
  (rows || []).forEach(function (row) {
    const id = String(row[idField] || '').trim();
    if (id) index[id] = row;
  });
  return index;
}

function findV2RelationRows_(ctx, sheetName, module, recordId) {
  const rows = ctx.tables[sheetName] || [];
  return rows.filter(function (row) {
    return String(row.module || '').trim() === module
      && String(row.record_id || '').trim() === String(recordId || '').trim()
      && !isSoftDeletedV2_(row);
  });
}

function findV2MobilityParticipants_(ctx, mobilityId) {
  const rows = ctx.tables[IROUP_V2_SHEETS.MOBILITY_PARTICIPANT] || [];
  return rows.filter(function (row) {
    return String(row.mobility_id || '').trim() === String(mobilityId || '').trim()
      && !isSoftDeletedV2_(row);
  });
}

function mapV2AdminMobilityProjectDto_(row, ctx, includeChildren) {
  const mobilityId = row.mobility_id || '';
  const module = 'mobility';
  const participants = findV2MobilityParticipants_(ctx, mobilityId).map(mapV2AdminMobilityParticipantDto_);
  const budgets = findV2RelationRows_(ctx, IROUP_V2_SHEETS.BUDGET, module, mobilityId);
  const files = findV2RelationRows_(ctx, IROUP_V2_SHEETS.FILES, module, mobilityId);

  const dto = {
    mobility_id: mobilityId,
    direction: row.direction || '',
    project_name: row.project_name || '',
    institution_name: row.institution_name || '',
    country: mapV2CountryRef_(ctx, row.country_id),
    city: row.city || '',
    up_unit: mapV2UnitRef_(ctx, row.up_unit_id),
    purpose: row.purpose || '',
    level: row.level || '',
    participant_group: row.participant_group || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    fiscal_year: row.fiscal_year || '',
    status: row.status || '',
    public_visible: isTruthyV2_(row.public_visible),
    is_deleted: isSoftDeletedV2_(row),
    aggregate_counts: {
      participant_count_cached: toNumberV2_(row.participant_count_cached),
      participant_count_actual: participants.length,
      student_count_actual: countV2ByField_(participants, 'participant_type', 'student'),
      staff_count_actual: countV2ByField_(participants, 'participant_type', 'staff'),
      external_count_actual: countV2ByField_(participants, 'participant_type', 'external'),
      guest_count_actual: countV2ByField_(participants, 'participant_type', 'guest')
    },
    budget_summary: summarizeV2Budgets_(budgets, ctx),
    file_summary: summarizeV2Files_(files, ctx),
    audit: mapV2AuditDto_(row)
  };

  if (includeChildren) {
    dto.participants = participants;
    dto.budgets = budgets.map(function (budget) { return mapV2BudgetDto_(budget, ctx); });
    dto.files = groupV2FilesByVisibility_(files, ctx);
  }

  return dto;
}

function mapV2AdminMobilityProjectSummaryDto_(row, ctx) {
  return mapV2AdminMobilityProjectDto_(row, ctx, false);
}

function mapV2AdminMobilityParticipantDto_(row) {
  return {
    participant_id: row.participant_id || '',
    mobility_id: row.mobility_id || '',
    participant_type: row.participant_type || '',
    person_source: row.person_source || '',
    person_id: row.person_id || '',
    unit_id_snapshot: row.unit_id_snapshot || '',
    full_name_snapshot: row.full_name_snapshot || '',
    gender_snapshot: row.gender_snapshot || '',
    program_or_position_snapshot: row.program_or_position_snapshot || '',
    role: row.role || '',
    is_deleted: isSoftDeletedV2_(row),
    created_by: row.created_by || '',
    created_at: row.created_at || ''
  };
}

function mapV2AdminMOUDto_(row, ctx, includeChildren) {
  const mouId = row.mou_id || '';
  const module = 'mou';
  const budgets = findV2RelationRows_(ctx, IROUP_V2_SHEETS.BUDGET, module, mouId);
  const files = findV2RelationRows_(ctx, IROUP_V2_SHEETS.FILES, module, mouId);

  const dto = {
    mou_id: mouId,
    up_unit: mapV2UnitRef_(ctx, row.up_unit_id),
    partner_org_name: row.partner_org_name || '',
    partner_org_name_en: row.partner_org_name_en || '',
    country: mapV2CountryRef_(ctx, row.country_id),
    mou_type: row.mou_type || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    fiscal_year: row.fiscal_year || '',
    status: row.status || '',
    public_visible: isTruthyV2_(row.public_visible),
    public_file_allowed: isTruthyV2_(row.public_file_allowed),
    is_deleted: isSoftDeletedV2_(row),
    budget_summary: summarizeV2Budgets_(budgets, ctx),
    file_summary: summarizeV2Files_(files, ctx),
    audit: mapV2AuditDto_(row)
  };

  if (includeChildren) {
    dto.budgets = budgets.map(function (budget) { return mapV2BudgetDto_(budget, ctx); });
    dto.files = groupV2FilesByVisibility_(files, ctx);
  }

  return dto;
}

function mapV2AdminMOUSummaryDto_(row, ctx) {
  return mapV2AdminMOUDto_(row, ctx, false);
}

function mapV2AdminScholarshipDto_(row, ctx, includeChildren) {
  const scholarshipId = row.scholarship_id || '';
  const module = 'scholarship';
  const budgets = findV2RelationRows_(ctx, IROUP_V2_SHEETS.BUDGET, module, scholarshipId);
  const files = findV2RelationRows_(ctx, IROUP_V2_SHEETS.FILES, module, scholarshipId);

  const dto = {
    scholarship_id: scholarshipId,
    title_th: row.title_th || '',
    title_en: row.title_en || '',
    institution_name: row.institution_name || '',
    country: mapV2CountryRef_(ctx, row.country_id),
    scholarship_type: row.scholarship_type || '',
    funding_type: row.funding_type || '',
    target_group: row.target_group || '',
    cover_summary: row.cover_summary || '',
    coverage_th: row.coverage_th || '',
    coverage_en: row.coverage_en || '',
    publish_date: row.publish_date || '',
    open_date: row.open_date || '',
    close_date: row.close_date || '',
    detail_url: row.detail_url || '',
    apply_url: row.apply_url || '',
    link_url: row.link_url || '',
    pin: isTruthyV2_(row.pin),
    status: row.status || '',
    public_visible: isTruthyV2_(row.public_visible),
    is_deleted: isSoftDeletedV2_(row),
    budget_summary: summarizeV2Budgets_(budgets, ctx),
    file_summary: summarizeV2Files_(files, ctx),
    audit: mapV2AuditDto_(row)
  };

  if (includeChildren) {
    dto.budgets = budgets.map(function (budget) { return mapV2BudgetDto_(budget, ctx); });
    dto.files = groupV2FilesByVisibility_(files, ctx);
  }

  return dto;
}

function mapV2AdminScholarshipSummaryDto_(row, ctx) {
  return mapV2AdminScholarshipDto_(row, ctx, false);
}

function mapV2AdminEventDto_(row, ctx, includeChildren) {
  const eventId = row.event_id || '';
  const module = 'event';
  const budgets = findV2RelationRows_(ctx, IROUP_V2_SHEETS.BUDGET, module, eventId);
  const files = findV2RelationRows_(ctx, IROUP_V2_SHEETS.FILES, module, eventId);

  const dto = {
    event_id: eventId,
    title_th: row.title_th || '',
    title_en: row.title_en || '',
    event_type: row.event_type || '',
    event_mode: row.event_mode || '',
    organizer_unit: mapV2UnitRef_(ctx, row.organizer_unit_id),
    country: mapV2CountryRef_(ctx, row.country_id),
    location: row.location || '',
    meeting_url: row.meeting_url || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    start_time: row.start_time || '',
    end_time: row.end_time || '',
    participant_count: toNumberV2_(row.participant_count),
    detail_th: row.detail_th || '',
    detail_en: row.detail_en || '',
    link_url: row.link_url || '',
    pin: isTruthyV2_(row.pin),
    status: row.status || '',
    public_visible: isTruthyV2_(row.public_visible),
    is_deleted: isSoftDeletedV2_(row),
    budget_summary: summarizeV2Budgets_(budgets, ctx),
    file_summary: summarizeV2Files_(files, ctx),
    audit: mapV2AuditDto_(row)
  };

  if (includeChildren) {
    dto.budgets = budgets.map(function (budget) { return mapV2BudgetDto_(budget, ctx); });
    dto.files = groupV2FilesByVisibility_(files, ctx);
  }

  return dto;
}

function mapV2AdminEventSummaryDto_(row, ctx) {
  return mapV2AdminEventDto_(row, ctx, false);
}

function mapV2CountryRef_(ctx, countryId) {
  const id = String(countryId || '').trim();
  const row = ctx.countriesById[id] || {};
  return {
    country_id: id,
    iso2: row.iso2 || '',
    iso3: row.iso3 || '',
    country_name_en: row.country_name_en || '',
    country_name_th: row.country_name_th || '',
    continent_en: row.continent_en || '',
    continent_th: row.continent_th || '',
    flag_emoji: row.flag_emoji || '',
    active: isTruthyV2_(row.active)
  };
}

function mapV2UnitRef_(ctx, unitId) {
  const id = String(unitId || '').trim();
  const row = ctx.unitsById[id] || {};
  return {
    unit_id: id,
    unit_code: row.unit_code || '',
    unit_name_th: row.unit_name_th || '',
    unit_name_en: row.unit_name_en || '',
    unit_type: row.unit_type || '',
    parent_unit_id: row.parent_unit_id || '',
    active: isTruthyV2_(row.active)
  };
}

function mapV2BudgetTypeRef_(ctx, budgetTypeId) {
  const id = String(budgetTypeId || '').trim();
  const row = ctx.budgetTypesById[id] || {};
  return {
    budget_type_id: id,
    budget_type_name: row.budget_type_name || '',
    active: isTruthyV2_(row.active)
  };
}

function mapV2FileRoleRef_(ctx, fileRoleId) {
  const id = String(fileRoleId || '').trim();
  const row = ctx.fileRolesById[id] || {};
  return {
    file_role_id: id,
    file_role_name: row.file_role_name || '',
    public_safe: isTruthyV2_(row.public_safe),
    active: isTruthyV2_(row.active),
    sort_order: toNumberV2_(row.sort_order)
  };
}

function mapV2BudgetDto_(row, ctx) {
  return {
    budget_id: row.budget_id || '',
    module: row.module || '',
    record_id: row.record_id || '',
    budget_type: mapV2BudgetTypeRef_(ctx, row.budget_type_id),
    budget_source_type: row.budget_source_type || '',
    budget_source_unit: mapV2UnitRef_(ctx, row.budget_source_unit_id),
    budget_source_name: row.budget_source_name || '',
    currency: row.currency || '',
    exchange_rate: toNumberV2_(row.exchange_rate),
    amount: toNumberV2_(row.amount),
    amount_thb: toNumberV2_(row.amount_thb),
    budget_note: row.budget_note || '',
    is_internal: isTruthyV2_(row.is_internal),
    is_deleted: isSoftDeletedV2_(row),
    created_by: row.created_by || '',
    created_at: row.created_at || ''
  };
}

function mapV2FileDto_(row, ctx) {
  const role = mapV2FileRoleRef_(ctx, row.file_role_id);
  return {
    file_id: row.file_id || '',
    module: row.module || '',
    record_id: row.record_id || '',
    file_role: role,
    file_name: row.file_name || '',
    mime_type: row.mime_type || '',
    drive_file_id: row.drive_file_id || '',
    file_url: row.file_url || '',
    thumbnail_url: row.thumbnail_url || '',
    visibility_level: row.visibility_level || '',
    public_safe_role: role.public_safe,
    is_deleted: isSoftDeletedV2_(row),
    uploaded_by: row.uploaded_by || '',
    uploaded_at: row.uploaded_at || '',
    note: row.note || ''
  };
}

function groupV2FilesByVisibility_(files, ctx) {
  const grouped = {};
  (IROUP_V2_ENUMS.visibility_level || []).forEach(function (visibility) {
    grouped[visibility] = [];
  });

  (files || []).forEach(function (file) {
    const visibility = String(file.visibility_level || 'unknown').trim() || 'unknown';
    if (!grouped[visibility]) grouped[visibility] = [];
    grouped[visibility].push(mapV2FileDto_(file, ctx));
  });

  return grouped;
}

function summarizeV2Files_(files, ctx) {
  const summary = {
    total: 0,
    by_visibility_level: {},
    public_safe_count: 0
  };

  (files || []).forEach(function (file) {
    const visibility = String(file.visibility_level || 'unknown').trim() || 'unknown';
    const role = mapV2FileRoleRef_(ctx, file.file_role_id);
    summary.total++;
    summary.by_visibility_level[visibility] = (summary.by_visibility_level[visibility] || 0) + 1;
    if (visibility === 'public' && role.public_safe) summary.public_safe_count++;
  });

  return summary;
}

function summarizeV2Budgets_(budgets, ctx) {
  const summary = {
    total_rows: 0,
    total_amount_thb: 0,
    by_budget_type_id: {},
    by_budget_source_type: {},
    by_currency: {}
  };

  (budgets || []).forEach(function (budget) {
    const amountThb = toNumberV2_(budget.amount_thb);
    const budgetTypeId = String(budget.budget_type_id || '').trim() || 'unknown';
    const sourceType = String(budget.budget_source_type || '').trim() || 'unknown';
    const currency = String(budget.currency || '').trim() || 'unknown';

    summary.total_rows++;
    summary.total_amount_thb += amountThb;
    addV2AmountSummary_(summary.by_budget_type_id, budgetTypeId, amountThb, mapV2BudgetTypeRef_(ctx, budgetTypeId));
    addV2AmountSummary_(summary.by_budget_source_type, sourceType, amountThb, { budget_source_type: sourceType });
    addV2AmountSummary_(summary.by_currency, currency, amountThb, { currency: currency });
  });

  return summary;
}

function addV2AmountSummary_(bucket, key, amountThb, meta) {
  if (!bucket[key]) {
    bucket[key] = { count: 0, amount_thb: 0, meta: meta || {} };
  }
  bucket[key].count++;
  bucket[key].amount_thb += amountThb;
}

function countV2ByField_(rows, fieldName, expectedValue) {
  return (rows || []).filter(function (row) {
    return String(row[fieldName] || '').trim() === expectedValue;
  }).length;
}

function toNumberV2_(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(String(value).replace(/,/g, ''));
  return isNaN(number) ? 0 : number;
}

function mapV2AuditDto_(row) {
  return {
    created_by: row.created_by || '',
    updated_by: row.updated_by || '',
    created_at: row.created_at || '',
    updated_at: row.updated_at || ''
  };
}
