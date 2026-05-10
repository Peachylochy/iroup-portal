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

function listV2LookupFileRoles_() {
  return listV2LookupSheet_(IROUP_V2_SHEETS.FILE_ROLE_MASTER, mapV2LookupFileRoleDto_);
}

function listV2LookupBudgetTypes_() {
  return listV2LookupSheet_(IROUP_V2_SHEETS.BUDGET_TYPE_MASTER, mapV2LookupBudgetTypeDto_);
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
