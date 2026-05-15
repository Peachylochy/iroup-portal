/**
 * IROUP Database V2.2 Travel DTO helpers.
 *
 * Finalized Travel-specific DTO layer for router/admin/public API use.
 * Public functions return aggregates only and never expose participant identity.
 */

function getV2AdminTravelList_(includeArchived) {
  const context = buildV2TravelDtoContext_(adminResponseV2_);
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.TRAVEL] || [];
  const dtos = rows
    .filter(function (row) {
      if (isSoftDeletedV2_(row)) return false;
      if (includeArchived === true) return true;
      return ['cancelled', 'archived'].indexOf(String(row.status || '').trim().toLowerCase()) < 0;
    })
    .map(function (row) {
      return mapV2AdminTravelSummaryDto_(row, ctx);
    });

  return adminResponseV2_(true, dtos, dtos.length, '');
}

function getV2AdminTravel_(travelId) {
  const id = String(travelId || '').trim();
  if (!id) {
    return adminResponseV2_(false, null, 0, 'travel_id is required for travel detail.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', id);
  if (!existing.success || !existing.data) {
    return adminResponseV2_(false, {
      travel_id: id
    }, 0, existing.error || 'Travel project not found.');
  }
  if (isSoftDeletedV2_(existing.data)) {
    return adminResponseV2_(false, {
      travel_id: id
    }, 0, 'Travel project is deleted.');
  }

  const context = buildV2TravelDtoContext_(adminResponseV2_);
  if (!context.success) return context;

  const dto = mapV2AdminTravelDetailDto_(existing.data, context.data);
  return adminResponseV2_(true, dto, dto ? 1 : 0, '');
}

function listV2PublicTravel_() {
  const context = buildV2TravelDtoContext_(publicResponseV2_);
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.TRAVEL] || [];
  const dtos = rows
    .filter(function (row) { return isV2PublicParentRow_(row, true); })
    .map(function (row) { return mapV2PublicTravelDto_(row, ctx); });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function getV2PublicTravelSummary_() {
  const context = buildV2TravelDtoContext_(publicResponseV2_);
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.TRAVEL] || [];
  const summary = {
    travel_count: 0,
    participant_count: 0,
    by_country: []
  };
  const countryMap = {};

  rows.forEach(function (row) {
    if (!isV2PublicParentRow_(row, true)) return;

    const countryId = String(row.country_id || '').trim() || 'unknown';
    const participantCount = countV2TravelParticipants_(ctx, row.travel_id);

    summary.travel_count++;
    summary.participant_count += participantCount;

    if (!countryMap[countryId]) {
      countryMap[countryId] = {
        country: mapV2PublicCountryRef_(ctx, countryId),
        continent: mapV2PublicContinentRef_(ctx, countryId),
        travel_count: 0,
        participant_count: 0
      };
    }

    countryMap[countryId].travel_count++;
    countryMap[countryId].participant_count += participantCount;
  });

  summary.by_country = objectValuesV2Travel_(countryMap);

  return publicResponseV2_(true, summary, summary.travel_count, '');
}

function buildV2TravelDtoContext_(responseFactory) {
  const sheetNames = [
    IROUP_V2_SHEETS.COUNTRY_MASTER,
    IROUP_V2_SHEETS.UP_UNIT_MASTER,
    IROUP_V2_SHEETS.BUDGET_TYPE_MASTER,
    IROUP_V2_SHEETS.FILE_ROLE_MASTER,
    IROUP_V2_SHEETS.TRAVEL,
    IROUP_V2_SHEETS.TRAVEL_PARTICIPANT,
    IROUP_V2_SHEETS.BUDGET,
    IROUP_V2_SHEETS.FILES
  ];
  const tables = {};

  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const read = readV2Sheet_(sheetName);
    if (!read.success) {
      return responseFactory(false, null, 0, read.error || 'Unable to read V2 Travel DTO context');
    }
    tables[sheetName] = read.data || [];
  }

  return responseFactory(true, {
    tables: tables,
    countriesById: indexV2RowsById_(tables[IROUP_V2_SHEETS.COUNTRY_MASTER], 'country_id'),
    unitsById: indexV2RowsById_(tables[IROUP_V2_SHEETS.UP_UNIT_MASTER], 'unit_id'),
    budgetTypesById: indexV2RowsById_(tables[IROUP_V2_SHEETS.BUDGET_TYPE_MASTER], 'budget_type_id'),
    fileRolesById: indexV2RowsById_(tables[IROUP_V2_SHEETS.FILE_ROLE_MASTER], 'file_role_id')
  }, 1, '');
}

function mapV2AdminTravelSummaryDto_(row, ctx) {
  const travelId = row.travel_id || '';
  const participants = findV2TravelParticipants_(ctx, travelId);
  const budgets = findV2RelationRows_(ctx, IROUP_V2_SHEETS.BUDGET, 'travel', travelId);
  const files = findV2RelationRows_(ctx, IROUP_V2_SHEETS.FILES, 'travel', travelId);

  return {
    travel_id: travelId,
    project_name: row.project_name || '',
    purpose: row.purpose || '',
    country: mapV2CountryRef_(ctx, row.country_id),
    city: row.city || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    fiscal_year: row.fiscal_year || '',
    status: row.status || '',
    public_visible: isTruthyV2_(row.public_visible),
    is_deleted: isSoftDeletedV2_(row),
    participant_summary: summarizeV2TravelParticipants_(participants),
    participant_count_cached: toNumberV2_(row.participant_count),
    budget_summary: summarizeV2Budgets_(budgets, ctx),
    file_summary: summarizeV2Files_(files, ctx),
    files: groupV2FilesByVisibility_(files, ctx),
    audit: mapV2AuditDto_(row)
  };
}

function mapV2AdminTravelDetailDto_(row, ctx) {
  const dto = mapV2AdminTravelSummaryDto_(row, ctx);
  dto.participants = findV2TravelParticipants_(ctx, dto.travel_id).map(mapV2AdminTravelParticipantDto_);
  dto.budgets = findV2RelationRows_(ctx, IROUP_V2_SHEETS.BUDGET, 'travel', dto.travel_id)
    .map(function (budget) { return mapV2BudgetDto_(budget, ctx); });
  return dto;
}

function mapV2AdminTravelParticipantDto_(row) {
  return {
    travel_participant_id: row.travel_participant_id || '',
    travel_id: row.travel_id || '',
    person_source: row.person_source || '',
    person_id: row.person_id || '',
    full_name_snapshot: row.full_name_snapshot || '',
    unit_id_snapshot: row.unit_id_snapshot || '',
    position_snapshot: row.position_snapshot || '',
    role: row.role || '',
    is_deleted: isSoftDeletedV2_(row),
    created_by: row.created_by || '',
    created_at: row.created_at || ''
  };
}

function mapV2PublicTravelDto_(row, ctx) {
  return {
    travel_id: row.travel_id || '',
    project_name: row.project_name || '',
    purpose: row.purpose || '',
    country: mapV2PublicCountryRef_(ctx, row.country_id),
    continent: mapV2PublicContinentRef_(ctx, row.country_id),
    city: row.city || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    fiscal_year: row.fiscal_year || '',
    status: row.status || '',
    participant_count: countV2TravelParticipants_(ctx, row.travel_id),
    files: findV2PublicFiles_(ctx, 'travel', row.travel_id, row)
  };
}

function findV2TravelParticipants_(ctx, travelId) {
  const rows = ctx.tables[IROUP_V2_SHEETS.TRAVEL_PARTICIPANT] || [];
  return rows.filter(function (row) {
    return String(row.travel_id || '').trim() === String(travelId || '').trim()
      && !isSoftDeletedV2_(row);
  });
}

function countV2TravelParticipants_(ctx, travelId) {
  return findV2TravelParticipants_(ctx, travelId).length;
}

function summarizeV2TravelParticipants_(participants) {
  const summary = {
    total: 0,
    by_person_source: {},
    by_role: {}
  };

  (participants || []).forEach(function (participant) {
    const source = String(participant.person_source || '').trim() || 'unknown';
    const role = String(participant.role || '').trim() || 'unknown';
    summary.total++;
    summary.by_person_source[source] = (summary.by_person_source[source] || 0) + 1;
    summary.by_role[role] = (summary.by_role[role] || 0) + 1;
  });

  return summary;
}

function objectValuesV2Travel_(map) {
  const values = [];
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      values.push(map[key]);
    }
  }
  return values;
}
