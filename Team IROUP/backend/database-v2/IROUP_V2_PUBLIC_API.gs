/**
 * IROUP Database V2.2 public-safe DTO API layer.
 *
 * Public functions return sanitized DTOs only. They never expose raw sheet rows,
 * participant identities, budgets, audit logs, internal notes, or private files.
 */

function publicResponseV2_(success, data, total, error, code) {
  return {
    success: !!success,
    data: data === undefined ? null : data,
    total: total || 0,
    error: error || '',
    code: code || ''
  };
}

function listV2PublicMOUs_() {
  const context = buildV2PublicContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.MOU] || [];
  const dtos = rows
    .filter(function (row) { return isV2PublicParentRow_(row, true); })
    .map(function (row) { return mapV2PublicMOUDto_(row, ctx); });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function listV2PublicMobility_() {
  const context = buildV2PublicContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.MOBILITY_PROJECT] || [];
  const dtos = rows
    .filter(function (row) { return isV2PublicParentRow_(row, true); })
    .map(function (row) { return mapV2PublicMobilityDto_(row, ctx); });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function listV2PublicScholarships_() {
  const context = buildV2PublicContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.SCHOLARSHIP] || [];
  const dtos = rows
    .filter(function (row) { return isV2PublicParentRow_(row, true); })
    .map(function (row) { return mapV2PublicScholarshipDto_(row, ctx); });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function listV2PublicEvents_() {
  const context = buildV2PublicContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const rows = ctx.tables[IROUP_V2_SHEETS.EVENT] || [];
  const dtos = rows
    .filter(function (row) { return isV2PublicParentRow_(row, true); })
    .map(function (row) { return mapV2PublicEventDto_(row, ctx); });

  return publicResponseV2_(true, dtos, dtos.length, '');
}

function getV2PublicStats_() {
  const mou = listV2PublicMOUs_();
  if (!mou.success) return mou;

  const mobility = listV2PublicMobility_();
  if (!mobility.success) return mobility;

  const scholarships = listV2PublicScholarships_();
  if (!scholarships.success) return scholarships;

  const events = listV2PublicEvents_();
  if (!events.success) return events;

  const travel = getV2PublicTravelSummary_();
  if (!travel.success) return travel;

  const mobilityRows = mobility.data || [];
  const stats = {
    mou_count: mou.total,
    mobility_project_count: mobility.total,
    mobility_participant_count: sumV2PublicNumbers_(mobilityRows, 'participant_count'),
    mobility_inbound_project_count: countV2PublicByField_(mobilityRows, 'direction', 'inbound'),
    mobility_outbound_project_count: countV2PublicByField_(mobilityRows, 'direction', 'outbound'),
    travel_count: travel.data ? travel.data.travel_count : 0,
    travel_participant_count: travel.data ? travel.data.participant_count : 0,
    scholarship_count: scholarships.total,
    pinned_scholarship_count: countV2PublicTruthy_(scholarships.data || [], 'pin'),
    event_count: events.total,
    pinned_event_count: countV2PublicTruthy_(events.data || [], 'pin')
  };

  return publicResponseV2_(true, stats, 1, '');
}

function getV2PublicMapData_() {
  const context = buildV2PublicContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const buckets = {};

  addV2PublicCountryCounts_(buckets, ctx, IROUP_V2_SHEETS.MOU, 'mou', 'country_id');
  addV2PublicCountryCounts_(buckets, ctx, IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility', 'country_id');
  addV2PublicCountryCounts_(buckets, ctx, IROUP_V2_SHEETS.SCHOLARSHIP, 'scholarship', 'country_id');
  addV2PublicCountryCounts_(buckets, ctx, IROUP_V2_SHEETS.EVENT, 'event', 'country_id');

  const data = Object.keys(buckets).map(function (countryId) {
    const bucket = buckets[countryId];
    bucket.total_count = bucket.counts.mou + bucket.counts.mobility + bucket.counts.scholarship + bucket.counts.event;
    return bucket;
  }).filter(function (bucket) {
    return bucket.total_count > 0;
  });

  return publicResponseV2_(true, data, data.length, '');
}

function getV2PublicMOUMapData_() {
  const context = buildV2PublicContext_();
  if (!context.success) return context;

  const ctx = context.data;
  const buckets = {};
  addV2PublicCountryCounts_(buckets, ctx, IROUP_V2_SHEETS.MOU, 'mou', 'country_id');

  const data = Object.keys(buckets).map(function (countryId) {
    const bucket = buckets[countryId];
    bucket.total_count = bucket.counts.mou;
    return bucket;
  }).filter(function (bucket) {
    return bucket.total_count > 0;
  });

  return publicResponseV2_(true, data, data.length, '');
}

function getV2PublicMobilityMapData_() {
  const mobility = listV2PublicMobility_();
  if (!mobility.success) return mobility;

  const buckets = {};
  (mobility.data || []).forEach(function (row) {
    const countryId = String(row.country && row.country.country_id ? row.country.country_id : '').trim();
    if (!countryId) return;
    if (!buckets[countryId]) {
      buckets[countryId] = {
        country: row.country,
        continent: row.continent,
        counts: {
          mobility_project: 0,
          inbound_project: 0,
          outbound_project: 0
        },
        participant_count: 0,
        total_count: 0
      };
    }
    buckets[countryId].counts.mobility_project++;
    if (row.direction === 'inbound') buckets[countryId].counts.inbound_project++;
    if (row.direction === 'outbound') buckets[countryId].counts.outbound_project++;
    buckets[countryId].participant_count += toV2PublicNumber_(row.participant_count);
    buckets[countryId].total_count++;
  });

  const data = Object.keys(buckets).map(function (countryId) {
    return buckets[countryId];
  });

  return publicResponseV2_(true, data, data.length, '');
}

function buildV2PublicContext_() {
  const sheetNames = [
    IROUP_V2_SHEETS.COUNTRY_MASTER,
    IROUP_V2_SHEETS.UP_UNIT_MASTER,
    IROUP_V2_SHEETS.FILE_ROLE_MASTER,
    IROUP_V2_SHEETS.MOU,
    IROUP_V2_SHEETS.MOBILITY_PROJECT,
    IROUP_V2_SHEETS.MOBILITY_PARTICIPANT,
    IROUP_V2_SHEETS.SCHOLARSHIP,
    IROUP_V2_SHEETS.EVENT,
    IROUP_V2_SHEETS.FILES
  ];

  const tables = {};
  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const read = readV2Sheet_(sheetName);
    if (!read.success) {
      return publicResponseV2_(false, null, 0, read.error || 'Unable to read V2 public context', 'V2_PUBLIC_READ_FAILED');
    }
    tables[sheetName] = read.data || [];
  }

  return publicResponseV2_(true, {
    tables: tables,
    countriesById: indexV2PublicRowsById_(tables[IROUP_V2_SHEETS.COUNTRY_MASTER], 'country_id'),
    unitsById: indexV2PublicRowsById_(tables[IROUP_V2_SHEETS.UP_UNIT_MASTER], 'unit_id'),
    fileRolesById: indexV2PublicRowsById_(tables[IROUP_V2_SHEETS.FILE_ROLE_MASTER], 'file_role_id')
  }, 1, '');
}

function indexV2PublicRowsById_(rows, idField) {
  const index = {};
  (rows || []).forEach(function (row) {
    const id = String(row[idField] || '').trim();
    if (id) index[id] = row;
  });
  return index;
}

function isV2PublicParentRow_(row, excludeCancelledArchived) {
  if (!row) return false;
  if (!isTruthyV2_(row.public_visible)) return false;
  if (isSoftDeletedV2_(row)) return false;

  const status = String(row.status || '').trim().toLowerCase();
  if (excludeCancelledArchived && ['cancelled', 'archived'].indexOf(status) >= 0) return false;

  return true;
}

function mapV2PublicMOUDto_(row, ctx) {
  return {
    mou_id: row.mou_id || '',
    partner_org_name: row.partner_org_name || '',
    partner_org_name_en: row.partner_org_name_en || '',
    country: mapV2PublicCountryRef_(ctx, row.country_id),
    continent: mapV2PublicContinentRef_(ctx, row.country_id),
    unit: mapV2PublicUnitRef_(ctx, row.up_unit_id),
    mou_type: row.mou_type || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    fiscal_year: row.fiscal_year || '',
    status: row.status || '',
    files: findV2PublicFiles_(ctx, 'mou', row.mou_id, row)
  };
}

function mapV2PublicMobilityDto_(row, ctx) {
  const participants = getV2PublicMobilityParticipants_(ctx, row.mobility_id);
  return {
    mobility_id: row.mobility_id || '',
    direction: row.direction || '',
    project_name: row.project_name || '',
    institution_name: row.institution_name || '',
    country: mapV2PublicCountryRef_(ctx, row.country_id),
    continent: mapV2PublicContinentRef_(ctx, row.country_id),
    city: row.city || '',
    unit: mapV2PublicUnitRef_(ctx, row.up_unit_id),
    purpose: row.purpose || '',
    level: row.level || '',
    participant_group: row.participant_group || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    fiscal_year: row.fiscal_year || '',
    status: row.status || '',
    participant_count: participants.total,
    participant_counts: {
      student: participants.student,
      staff: participants.staff,
      external: participants.external,
      guest: participants.guest
    },
    files: findV2PublicFiles_(ctx, 'mobility', row.mobility_id, row)
  };
}

function mapV2PublicScholarshipDto_(row, ctx) {
  return {
    scholarship_id: row.scholarship_id || '',
    title_th: row.title_th || '',
    title_en: row.title_en || '',
    institution_name: row.institution_name || '',
    country: mapV2PublicCountryRef_(ctx, row.country_id),
    continent: mapV2PublicContinentRef_(ctx, row.country_id),
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
    files: findV2PublicFiles_(ctx, 'scholarship', row.scholarship_id, row)
  };
}

function mapV2PublicEventDto_(row, ctx) {
  return {
    event_id: row.event_id || '',
    title_th: row.title_th || '',
    title_en: row.title_en || '',
    event_type: row.event_type || '',
    event_mode: row.event_mode || '',
    organizer: mapV2PublicUnitRef_(ctx, row.organizer_unit_id),
    country: mapV2PublicCountryRef_(ctx, row.country_id),
    continent: mapV2PublicContinentRef_(ctx, row.country_id),
    location: row.location || '',
    meeting_url: row.meeting_url || '',
    start_date: row.start_date || '',
    end_date: row.end_date || '',
    start_time: row.start_time || '',
    end_time: row.end_time || '',
    participant_count: toV2PublicNumber_(row.participant_count),
    detail_th: row.detail_th || '',
    detail_en: row.detail_en || '',
    link_url: row.link_url || '',
    pin: isTruthyV2_(row.pin),
    status: row.status || '',
    files: findV2PublicFiles_(ctx, 'event', row.event_id, row)
  };
}

function getV2PublicMobilityParticipants_(ctx, mobilityId) {
  const rows = ctx.tables[IROUP_V2_SHEETS.MOBILITY_PARTICIPANT] || [];
  const counts = { total: 0, student: 0, staff: 0, external: 0, guest: 0 };

  rows.forEach(function (row) {
    if (String(row.mobility_id || '').trim() !== String(mobilityId || '').trim()) return;
    if (isSoftDeletedV2_(row)) return;

    const type = String(row.participant_type || '').trim();
    counts.total++;
    if (counts[type] !== undefined) counts[type]++;
  });

  return counts;
}

function findV2PublicFiles_(ctx, module, recordId, parentRow) {
  if (IROUP_V2_MODULES.indexOf(module) < 0) return [];
  if (!isV2PublicParentRow_(parentRow, false)) return [];

  const rows = ctx.tables[IROUP_V2_SHEETS.FILES] || [];
  return rows.filter(function (file) {
    return isV2PublicFileAllowed_(ctx, file, module, recordId, parentRow);
  }).map(function (file) {
    return mapV2PublicFileDto_(ctx, file);
  });
}

function isV2PublicFileAllowed_(ctx, file, module, recordId, parentRow) {
  if (!file || !parentRow) return false;
  if (String(file.module || '').trim() !== module) return false;
  if (String(file.record_id || '').trim() !== String(recordId || '').trim()) return false;
  if (String(file.visibility_level || '').trim() !== 'public') return false;
  if (isSoftDeletedV2_(file)) return false;
  if (!isV2PublicParentRow_(parentRow, false)) return false;

  const role = ctx.fileRolesById[String(file.file_role_id || '').trim()];
  if (role && !isTruthyV2_(role.public_safe)) return false;

  return true;
}

function mapV2PublicFileDto_(ctx, file) {
  const role = ctx.fileRolesById[String(file.file_role_id || '').trim()] || {};
  return {
    file_id: file.file_id || '',
    file_role_id: file.file_role_id || '',
    file_role_name: role.file_role_name || '',
    file_name: file.file_name || '',
    mime_type: file.mime_type || '',
    file_url: file.file_url || '',
    thumbnail_url: file.thumbnail_url || '',
    visibility_level: file.visibility_level || ''
  };
}

function mapV2PublicCountryRef_(ctx, countryId) {
  const id = String(countryId || '').trim();
  const row = ctx.countriesById[id] || {};
  return {
    country_id: id,
    iso2: row.iso2 || '',
    iso3: row.iso3 || '',
    country_name_en: row.country_name_en || '',
    country_name_th: row.country_name_th || '',
    flag_emoji: row.flag_emoji || ''
  };
}

function mapV2PublicContinentRef_(ctx, countryId) {
  const row = ctx.countriesById[String(countryId || '').trim()] || {};
  return {
    continent_en: row.continent_en || '',
    continent_th: row.continent_th || ''
  };
}

function mapV2PublicUnitRef_(ctx, unitId) {
  const id = String(unitId || '').trim();
  const row = ctx.unitsById[id] || {};
  return {
    unit_id: id,
    unit_code: row.unit_code || '',
    unit_name_th: row.unit_name_th || '',
    unit_name_en: row.unit_name_en || '',
    unit_type: row.unit_type || ''
  };
}

function addV2PublicCountryCounts_(buckets, ctx, sheetName, module, countryField) {
  const rows = ctx.tables[sheetName] || [];
  rows.forEach(function (row) {
    if (!isV2PublicParentRow_(row, true)) return;

    const countryId = String(row[countryField] || '').trim();
    if (!countryId) return;

    if (!buckets[countryId]) {
      buckets[countryId] = {
        country: mapV2PublicCountryRef_(ctx, countryId),
        continent: mapV2PublicContinentRef_(ctx, countryId),
        counts: { mou: 0, mobility: 0, scholarship: 0, event: 0 },
        total_count: 0
      };
    }

    buckets[countryId].counts[module]++;
  });
}

function countV2PublicByField_(rows, fieldName, expectedValue) {
  return (rows || []).filter(function (row) {
    return String(row[fieldName] || '').trim() === expectedValue;
  }).length;
}

function countV2PublicTruthy_(rows, fieldName) {
  return (rows || []).filter(function (row) {
    return isTruthyV2_(row[fieldName]);
  }).length;
}

function sumV2PublicNumbers_(rows, fieldName) {
  return (rows || []).reduce(function (sum, row) {
    return sum + toV2PublicNumber_(row[fieldName]);
  }, 0);
}

function toV2PublicNumber_(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(String(value).replace(/,/g, ''));
  return isNaN(number) ? 0 : number;
}
