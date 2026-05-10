/**
 * IROUP Database V2.2 validation and governance helpers.
 *
 * This layer validates normalized V2 records before future admin/public APIs
 * read, write, link, aggregate, or expose data.
 */

function validationOkV2_(details) {
  return { success: true, error: '', code: '', details: details || {} };
}

function validationErrorV2_(code, error, details) {
  return { success: false, error: error || code, code: code || 'VALIDATION_ERROR', details: details || {} };
}

function isTruthyV2_(value) {
  if (value === true) return true;
  const text = String(value || '').trim().toLowerCase();
  return ['true', 'yes', 'y', '1'].indexOf(text) >= 0;
}

function isSoftDeletedV2_(row) {
  return !!(row && isTruthyV2_(row.is_deleted));
}

function validateRequiredFieldsV2_(data, requiredFields) {
  const missing = [];
  const payload = data || {};
  (requiredFields || []).forEach(function (field) {
    const value = payload[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      missing.push(field);
    }
  });

  if (missing.length) {
    return validationErrorV2_('REQUIRED_FIELDS_MISSING', 'Missing required fields', { missing: missing });
  }

  return validationOkV2_({ checked: requiredFields || [] });
}

function validateModuleV2_(module) {
  return validateEnumV2_(module, IROUP_V2_MODULES, 'module');
}

function validateVisibilityLevelV2_(visibility) {
  return validateEnumV2_(visibility, IROUP_V2_ENUMS.visibility_level, 'visibility_level');
}

function validateDirectionV2_(direction) {
  return validateEnumV2_(direction, IROUP_V2_ENUMS.direction, 'direction');
}

function validateEnumV2_(value, allowedValues, fieldName) {
  const text = String(value || '').trim();
  const allowed = allowedValues || [];

  if (!text) {
    return validationErrorV2_('ENUM_REQUIRED', 'Missing value for ' + fieldName, {
      field: fieldName,
      value: value,
      allowed: allowed
    });
  }

  if (allowed.indexOf(text) < 0) {
    return validationErrorV2_('ENUM_INVALID', 'Invalid value for ' + fieldName + ': ' + text, {
      field: fieldName,
      value: text,
      allowed: allowed
    });
  }

  return validationOkV2_({ field: fieldName, value: text });
}

function validateForeignKeyV2_(sheetName, idField, idValue) {
  if (!sheetName || !idField || !idValue) {
    return validationErrorV2_('FK_REQUIRED', 'Missing foreign key reference', {
      sheetName: sheetName,
      idField: idField,
      idValue: idValue
    });
  }

  const found = findV2RowById_(sheetName, idField, idValue);
  if (!found.success) {
    return validationErrorV2_('FK_NOT_FOUND', found.error || 'Foreign key target not found', {
      sheetName: sheetName,
      idField: idField,
      idValue: idValue
    });
  }

  if (isSoftDeletedV2_(found.data)) {
    return validationErrorV2_('FK_SOFT_DELETED', 'Foreign key target is soft-deleted', {
      sheetName: sheetName,
      idField: idField,
      idValue: idValue
    });
  }

  return validationOkV2_({
    sheetName: sheetName,
    idField: idField,
    idValue: idValue,
    row: found.data
  });
}

function validateSoftDeleteSafeV2_(sheetName, idField, idValue) {
  const found = findV2RowById_(sheetName, idField, idValue);
  if (!found.success) {
    return validationErrorV2_('ROW_NOT_FOUND', found.error || 'Row not found', {
      sheetName: sheetName,
      idField: idField,
      idValue: idValue
    });
  }

  if (isSoftDeletedV2_(found.data)) {
    return validationErrorV2_('ROW_ALREADY_DELETED', 'Row is already soft-deleted', {
      sheetName: sheetName,
      idField: idField,
      idValue: idValue
    });
  }

  return validationOkV2_({
    sheetName: sheetName,
    idField: idField,
    idValue: idValue,
    row: found.data
  });
}

function validatePublicFileAccessV2_(fileRow, parentRow) {
  if (!fileRow) {
    return validationErrorV2_('FILE_REQUIRED', 'Missing file row', {});
  }

  if (!parentRow) {
    return validationErrorV2_('PARENT_REQUIRED', 'Missing parent row for public file validation', {});
  }

  if (!isTruthyV2_(parentRow.public_visible)) {
    return validationErrorV2_('PARENT_NOT_PUBLIC', 'Parent record is not public-visible', {
      parent_public_visible: parentRow.public_visible
    });
  }

  if (String(fileRow.visibility_level || '').trim() !== 'public') {
    return validationErrorV2_('FILE_NOT_PUBLIC', 'File visibility is not public', {
      visibility_level: fileRow.visibility_level
    });
  }

  if (isSoftDeletedV2_(fileRow)) {
    return validationErrorV2_('FILE_DELETED', 'File row is soft-deleted', {
      file_id: fileRow.file_id || ''
    });
  }

  return validationOkV2_({
    file_id: fileRow.file_id || '',
    visibility_level: fileRow.visibility_level,
    parent_public_visible: parentRow.public_visible
  });
}

function validateParticipantIdentityV2_(personSource, personId, participantType) {
  const typeCheck = validateEnumV2_(participantType, IROUP_V2_ENUMS.participant_type, 'participant_type');
  if (!typeCheck.success) return typeCheck;

  const sourceCheck = validateEnumV2_(personSource, IROUP_V2_ENUMS.person_source, 'person_source');
  if (!sourceCheck.success) return sourceCheck;

  const source = String(personSource || '').trim();
  const id = String(personId || '').trim();
  if (!id) {
    return validationErrorV2_('PERSON_ID_REQUIRED', 'Missing person_id for participant', {
      person_source: source,
      participant_type: participantType
    });
  }

  const sourceMap = {
    STUDENT: { sheetName: IROUP_V2_SHEETS.PERSON_STUDENT, idField: 'student_id' },
    STAFF: { sheetName: IROUP_V2_SHEETS.PERSON_STAFF, idField: 'staff_id' },
    MANUAL: { sheetName: IROUP_V2_SHEETS.PERSON_MANUAL, idField: 'person_id' }
  };

  const target = sourceMap[source];
  if (!target) {
    return validationErrorV2_('PERSON_SOURCE_UNSUPPORTED', 'Unsupported person_source: ' + source, {
      person_source: source
    });
  }

  const fk = validateForeignKeyV2_(target.sheetName, target.idField, id);
  if (!fk.success) return fk;

  return validationOkV2_({
    person_source: source,
    person_id: id,
    participant_type: participantType,
    sheetName: target.sheetName,
    idField: target.idField
  });
}

function validateModuleRecordLinkV2_(module, recordId) {
  const moduleCheck = validateModuleV2_(module);
  if (!moduleCheck.success) return moduleCheck;

  const id = String(recordId || '').trim();
  if (!id) {
    return validationErrorV2_('RECORD_ID_REQUIRED', 'Missing record_id for module link', {
      module: module,
      record_id: recordId
    });
  }

  const moduleMap = {
    mou: { sheetName: IROUP_V2_SHEETS.MOU, idField: 'mou_id' },
    mobility: { sheetName: IROUP_V2_SHEETS.MOBILITY_PROJECT, idField: 'mobility_id' },
    travel: { sheetName: IROUP_V2_SHEETS.TRAVEL, idField: 'travel_id' },
    scholarship: { sheetName: IROUP_V2_SHEETS.SCHOLARSHIP, idField: 'scholarship_id' },
    event: { sheetName: IROUP_V2_SHEETS.EVENT, idField: 'event_id' }
  };

  const target = moduleMap[String(module || '').trim()];
  if (!target) {
    return validationErrorV2_('MODULE_UNSUPPORTED', 'Unsupported module: ' + module, {
      module: module
    });
  }

  const fk = validateForeignKeyV2_(target.sheetName, target.idField, id);
  if (!fk.success) return fk;

  return validationOkV2_({
    module: module,
    record_id: id,
    sheetName: target.sheetName,
    idField: target.idField
  });
}
