/**
 * IROUP Database V2.2 Final Freeze Generator
 * Safe mode: does NOT clear existing sheets.
 */

function generateIROUPDatabaseV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const groups = {
    SYSTEM: ["SYSTEM_SETTINGS", "AUDIT_LOG", "PUBLIC_CACHE"],
    MASTER: ["ADMIN", "COUNTRY_MASTER", "UP_UNIT_MASTER", "MASTER_EVENT_TYPES", "PERSON_STUDENT", "PERSON_STAFF", "PERSON_MANUAL", "BUDGET_TYPE_MASTER", "FILE_ROLE_MASTER"],
    TRANSACTION: ["MOU", "MOBILITY_PROJECT", "MOBILITY_PARTICIPANT", "TRAVEL", "TRAVEL_PARTICIPANT", "SCHOLARSHIP", "EVENT"],
    RELATION: ["BUDGET", "FILES"]
  };

  const tabColors = {
    SYSTEM: "#f6b26b",
    MASTER: "#3c78d8",
    TRANSACTION: "#674ea7",
    RELATION: "#6aa84f"
  };

  const schema = {
    "SYSTEM_SETTINGS": ["setting_key", "setting_value", "description", "updated_at", "updated_by"],
    "ADMIN": ["admin_id", "email", "name", "role", "active", "created_at"],
    "COUNTRY_MASTER": ["country_id", "iso2", "iso3", "country_name_en", "country_name_th", "continent_en", "continent_th", "flag_emoji", "search_alias", "active", "sort_order"],
    "UP_UNIT_MASTER": ["unit_id", "unit_code", "unit_name_th", "unit_name_en", "unit_type", "parent_unit_id", "active", "sort_order"],
    "MASTER_EVENT_TYPES": ["event_type_id", "name_th", "name_en", "icon", "color_token", "is_active", "sort_order", "created_at", "updated_at"],
    "PERSON_STUDENT": ["student_id", "prefix_th", "first_name_th", "last_name_th", "full_name_th", "prefix_en", "first_name_en", "last_name_en", "full_name_en", "gender", "unit_id", "program_th", "degree_level", "student_status", "active", "source_system", "updated_at"],
    "PERSON_STAFF": ["staff_id", "prefix_th", "first_name_th", "last_name_th", "full_name_th", "first_name_en", "last_name_en", "full_name_en", "gender", "unit_id", "position", "staff_type", "active", "source_system", "updated_at"],
    "PERSON_MANUAL": ["person_id", "person_type", "prefix", "first_name", "last_name", "full_name", "gender", "unit_id", "program_or_position", "source_note", "created_at", "created_by", "active"],
    "BUDGET_TYPE_MASTER": ["budget_type_id", "budget_type_name", "active"],
    "FILE_ROLE_MASTER": ["file_role_id", "file_role_name", "public_safe", "active", "sort_order"],

    "MOU": ["mou_id", "up_unit_id", "partner_org_name", "partner_org_name_en", "country_id", "mou_type", "start_date", "end_date", "fiscal_year", "status", "public_visible", "public_file_allowed", "is_deleted", "created_by", "updated_by", "created_at", "updated_at"],
    "MOBILITY_PROJECT": ["mobility_id", "direction", "project_name", "institution_name", "country_id", "city", "up_unit_id", "purpose", "level", "participant_group", "start_date", "end_date", "fiscal_year", "participant_count_cached", "student_count", "staff_count", "status", "public_visible", "is_deleted", "created_by", "updated_by", "created_at", "updated_at"],
    "MOBILITY_PARTICIPANT": ["participant_id", "mobility_id", "participant_type", "person_source", "person_id", "unit_id_snapshot", "full_name_snapshot", "gender_snapshot", "program_or_position_snapshot", "role", "is_deleted", "created_by", "created_at"],
    "TRAVEL": ["travel_id", "project_name", "purpose", "country_id", "city", "start_date", "end_date", "fiscal_year", "status", "participant_count", "public_visible", "is_deleted", "created_by", "updated_by", "created_at", "updated_at"],
    "TRAVEL_PARTICIPANT": ["travel_participant_id", "travel_id", "person_source", "person_id", "full_name_snapshot", "unit_id_snapshot", "position_snapshot", "role", "is_deleted", "created_by", "created_at"],
    "SCHOLARSHIP": ["scholarship_id", "title_th", "title_en", "institution_name", "country_id", "scholarship_type", "funding_type", "target_group", "cover_summary", "coverage_th", "coverage_en", "content_th", "content_en", "publish_date", "open_date", "close_date", "detail_url", "apply_url", "link_url", "pin", "status", "public_visible", "is_deleted", "created_by", "updated_by", "created_at", "updated_at"],
    "EVENT": ["event_id", "title_th", "title_en", "event_type", "event_mode", "organizer_unit_id", "country_id", "location", "meeting_url", "start_date", "end_date", "start_time", "end_time", "participant_count", "detail_th", "detail_en", "link_url", "pin", "status", "public_visible", "is_deleted", "created_by", "updated_by", "created_at", "updated_at"],

    "BUDGET": ["budget_id", "module", "record_id", "budget_type_id", "budget_source_type", "budget_source_unit_id", "budget_source_name", "currency", "exchange_rate", "amount", "amount_thb", "budget_note", "is_internal", "is_deleted", "created_by", "created_at"],
    "FILES": ["file_id", "module", "record_id", "file_role_id", "file_name", "mime_type", "drive_file_id", "file_url", "thumbnail_url", "visibility_level", "is_deleted", "uploaded_by", "uploaded_at", "note"],

    "AUDIT_LOG": ["log_id", "module", "record_id", "action", "before_json", "after_json", "performed_by", "performed_at"],
    "PUBLIC_CACHE": ["cache_id", "module", "schema_version", "json_data", "updated_at", "expires_at"]
  };

  const dv = SpreadsheetApp.newDataValidation;
  const validations = {
    "active": dv().requireCheckbox().build(),
    "is_active": dv().requireCheckbox().build(),
    "is_deleted": dv().requireCheckbox().build(),
    "public_visible": dv().requireCheckbox().build(),
    "public_file_allowed": dv().requireCheckbox().build(),
    "public_safe": dv().requireCheckbox().build(),
    "is_internal": dv().requireCheckbox().build(),
    "pin": dv().requireCheckbox().build(),

    "status": dv().requireValueInList(["draft", "active", "upcoming", "ongoing", "completed", "expired", "cancelled", "archived"], true).build(),
    "module": dv().requireValueInList(["mou", "mobility", "travel", "scholarship", "event"], true).build(),
    "visibility_level": dv().requireValueInList(["public", "internal", "restricted", "confidential"], true).build(),
    "budget_source_type": dv().requireValueInList(["internal_unit", "university", "external_partner", "self_funded", "none", "other"], true).build(),
    "direction": dv().requireValueInList(["inbound", "outbound"], true).build(),
    "event_mode": dv().requireValueInList(["online", "offline", "hybrid"], true).build(),
    "participant_type": dv().requireValueInList(["student", "staff", "external", "guest"], true).build(),
    "person_source": dv().requireValueInList(["STUDENT", "STAFF", "MANUAL"], true).build(),
    "source_system": dv().requireValueInList(["REG_API", "HR_API", "MANUAL_CSV", "APP_FORM"], true).build(),
    "currency": dv().requireValueInList(["THB", "USD", "JPY", "CNY", "EUR", "AUD", "NZD", "GBP"], true).build()
  };

  Object.entries(schema).forEach(([sheetName, headers]) => {
    let sheet = ss.getSheetByName(sheetName);
    const groupName = getGroupName_(sheetName, groups);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const existing = sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getValues()[0];
      const hasHeaders = existing.some(v => String(v || "").trim());
      if (!hasHeaders) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }

    sheet.setTabColor(tabColors[groupName] || "#999999");

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange
      .setFontWeight("bold")
      .setBackground(tabColors[groupName] || "#4c1130")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);

    const maxRows = Math.max(sheet.getMaxRows(), 1000);
    headers.forEach((header, index) => {
      const colIndex = index + 1;
      const range = sheet.getRange(2, colIndex, maxRows - 1, 1);

      if (validations[header]) {
        range.setDataValidation(validations[header]);
      }

      if (isDateField_(header)) {
        range.setNumberFormat("yyyy-mm-dd");
      }

      if (isCurrencyField_(header)) {
        range.setNumberFormat("#,##0.00");
      }
    });
  });

  deleteDefaultSheets_(ss);
  insertSampleSettings_(ss.getSheetByName("SYSTEM_SETTINGS"));

  SpreadsheetApp.getUi().alert("สร้างโครงสร้าง IROUP_DATABASE_V2.2 สำเร็จแล้ว ✅");
}

function getGroupName_(sheetName, groups) {
  for (const [groupName, names] of Object.entries(groups)) {
    if (names.includes(sheetName)) return groupName;
  }
  return "OTHER";
}

function isDateField_(header) {
  return /date|created_at|updated_at|uploaded_at|performed_at/i.test(header);
}

function isCurrencyField_(header) {
  return ["amount", "amount_thb", "exchange_rate"].includes(header);
}

function deleteDefaultSheets_(ss) {
  ["Sheet1", "แผ่นที่ 1"].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && ss.getSheets().length > 1) ss.deleteSheet(sheet);
  });
}

function insertSampleSettings_(sheet) {
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  const existingKeys = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(String)
    : [];

  const sampleData = [
    ["SCHEMA_VERSION", "2.2", "เวอร์ชันของโครงสร้างฐานข้อมูลปัจจุบัน", new Date(), "admin_script"],
    ["MOU_SOON_THRESHOLD_DAYS", "90", "จำนวนวันแจ้งเตือนก่อน MOU หมดอายุ", new Date(), "admin_script"],
    ["PUBLIC_CACHE_MINUTES", "15", "ระยะเวลาหมดอายุของ Cache นาที", new Date(), "admin_script"],
    ["DEFAULT_CURRENCY", "THB", "สกุลเงินเริ่มต้น", new Date(), "admin_script"],
    ["ENABLE_PUBLIC_EVENTS", "TRUE", "เปิด/ปิด Event สาธารณะ", new Date(), "admin_script"]
  ].filter(row => !existingKeys.includes(row[0]));

  if (sampleData.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  }
}
