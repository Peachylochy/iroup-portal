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
      if (!String(row.event_id || '').trim()) return false;
      if (isSoftDeletedV2_(row)) return false;
      if (includeArchived === true) return true;
      return ['archived'].indexOf(String(row.status || '').trim()) < 0;
    })
    .map(function (row) {
      return mapV2AdminEventSummaryDto_(row, ctx);
    });

  return adminResponseV2_(true, dtos, dtos.length, '');
}

function validateV2AdminEventWrite_(request, mode) {
  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const result = buildV2EventWritePreview_(request, context.data, mode || 'validate');
  return adminResponseV2_(result.success, result.data, result.success ? 1 : 0, result.error);
}

function createV2AdminEvent_(request) {
  return writeV2AdminEventMetadata_(request, 'create');
}

function updateV2AdminEvent_(request) {
  return writeV2AdminEventMetadata_(request, 'update');
}

function createV2AdminScholarship_(request) {
  return writeV2AdminScholarshipMetadata_(request, 'create');
}

function updateV2AdminScholarship_(request) {
  return writeV2AdminScholarshipMetadata_(request, 'update');
}

function uploadV2AdminFile_(request) {
  const flag = getV2FileUploadFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      upload_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2FileUploadActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const payload = extractV2FileUploadPayload_(request);
  const normalized = normalizeV2FileUploadPayload_(payload);
  if (!normalized.success) {
    return adminResponseV2_(false, sanitizeV2FileUploadDiagnostics_(normalized.data), 0, normalized.error);
  }

  try {
    const data = normalized.data;
    const folder = getOrCreateV2FileUploadFolder_('IROUP_V2_FILES');
    const bytes = Utilities.base64Decode(data.base64_data);
    const blob = Utilities.newBlob(bytes, data.mime_type, data.filename);
    const driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const now = new Date().toISOString();
    const row = {
      file_id: generateV2Id_(IROUP_V2_ID_PREFIXES.FILES),
      module: data.module,
      record_id: data.record_id,
      file_role_id: data.file_role_id,
      file_name: data.filename,
      mime_type: data.mime_type,
      drive_file_id: driveFile.getId(),
      file_url: driveFile.getUrl(),
      thumbnail_url: '',
      visibility_level: data.visibility_level,
      is_deleted: false,
      uploaded_by: actor.user.email || '',
      uploaded_at: now,
      note: data.note || ''
    };

    const persisted = appendV2Row_(IROUP_V2_SHEETS.FILES, row, {
      idField: 'file_id',
      requiredFields: ['file_id', 'module', 'record_id', 'file_role_id', 'file_name', 'mime_type', 'drive_file_id', 'file_url', 'visibility_level']
    });

    if (!persisted.success) {
      return adminResponseV2_(false, {
        upload_enabled: true,
        drive_file_id: driveFile.getId(),
        diagnostics: persisted.diagnostics || {}
      }, 0, persisted.error);
    }

    return adminResponseV2_(true, {
      upload_enabled: true,
      file_id: row.file_id,
      file_url: row.file_url,
      drive_file_id: row.drive_file_id,
      file: persisted.data,
      actor: {
        email: actor.user.email || '',
        role: actor.user.role || ''
      },
      diagnostics: persisted.diagnostics || {}
    }, 1, '');
  } catch (error) {
    return adminResponseV2_(false, sanitizeV2FileUploadDiagnostics_(normalized.data), 0, error && error.message ? error.message : String(error));
  }
}

function writeV2AdminEventMetadata_(request, mode) {
  const flag = getV2EventWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2EventWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const writeMode = String(mode || '').trim().toLowerCase();
  const previewMode = writeMode === 'update' ? 'update' : 'create';
  const preview = buildV2EventWritePreview_(request, context.data, previewMode);
  if (!preview.success) {
    return adminResponseV2_(false, preview.data, 0, preview.error);
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  const normalized = preview.data.normalized_event || {};
  let persisted;

  if (writeMode === 'update') {
    const eventId = cleanV2EventText_(normalized.event_id);
    if (!eventId) {
      return adminResponseV2_(false, preview.data, 0, 'event_id is required for event update.');
    }

    const existing = findV2RowById_(IROUP_V2_SHEETS.EVENT, 'event_id', eventId);
    if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
    if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot update a deleted event.');

    const patch = buildV2EventSheetRow_(normalized);
    delete patch.event_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.EVENT, 'event_id', eventId, patch);
  } else {
    const row = buildV2EventSheetRow_(normalized);
    row.event_id = generateV2Id_(IROUP_V2_ID_PREFIXES.EVENT);
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.EVENT, row, {
      idField: 'event_id',
      requiredFields: ['event_id', 'start_date', 'status']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  const dto = mapV2AdminEventDto_(persisted.data, context.data, false);
  return adminResponseV2_(true, {
    dry_run: false,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.EVENT,
    event: dto,
    persisted_event: persisted.data,
    actor: {
      email: adminEmail,
      role: actor.user.role || ''
    },
    relation_writes: {
      files: [],
      budgets: []
    },
    skipped_operations: [
      'file_upload',
      'image_upload',
      'file_relation_write',
      'budget_relation_write',
      'delete'
    ],
    diagnostics: persisted.diagnostics || {}
  }, 1, '');
}

function writeV2AdminScholarshipMetadata_(request, mode) {
  const flag = getV2ScholarshipWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2ScholarshipWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const writeMode = String(mode || '').trim().toLowerCase();
  const previewMode = writeMode === 'update' ? 'update' : 'create';
  const preview = buildV2ScholarshipWritePreview_(request, context.data, previewMode);
  if (!preview.success) {
    return adminResponseV2_(false, preview.data, 0, preview.error);
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  const normalized = preview.data.normalized_scholarship || {};
  let persisted;

  if (writeMode === 'update') {
    const scholarshipId = cleanV2EventText_(normalized.scholarship_id);
    if (!scholarshipId) {
      return adminResponseV2_(false, preview.data, 0, 'scholarship_id is required for scholarship update.');
    }

    const existing = findV2RowById_(IROUP_V2_SHEETS.SCHOLARSHIP, 'scholarship_id', scholarshipId);
    if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
    if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot update a deleted scholarship.');

    const patch = buildV2ScholarshipSheetRow_(normalized);
    delete patch.scholarship_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.SCHOLARSHIP, 'scholarship_id', scholarshipId, patch);
  } else {
    const row = buildV2ScholarshipSheetRow_(normalized);
    row.scholarship_id = generateV2Id_(IROUP_V2_ID_PREFIXES.SCHOLARSHIP);
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.SCHOLARSHIP, row, {
      idField: 'scholarship_id',
      requiredFields: ['scholarship_id', 'title_th', 'institution_name', 'country_id', 'scholarship_type', 'open_date', 'close_date', 'status']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  const dto = mapV2AdminScholarshipDto_(persisted.data, context.data, false);
  return adminResponseV2_(true, {
    dry_run: false,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.SCHOLARSHIP,
    scholarship: dto,
    persisted_scholarship: persisted.data,
    actor: {
      email: adminEmail,
      role: actor.user.role || ''
    },
    relation_writes: {
      files: [],
      budgets: []
    },
    skipped_operations: [
      'file_upload',
      'image_upload',
      'file_relation_write',
      'budget_relation_write',
      'delete'
    ],
    diagnostics: persisted.diagnostics || {}
  }, 1, '');
}

function getV2EventWriteFeatureFlag_() {
  const property = 'IROUP_V2_EVENT_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 event metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function getV2ScholarshipWriteFeatureFlag_() {
  const property = 'IROUP_V2_SCHOLARSHIP_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 scholarship metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function getV2FileUploadFeatureFlag_() {
  const property = 'IROUP_V2_FILE_UPLOAD_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 file uploads are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function authorizeV2EventWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for event writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for event writes.' };
  }

  return { success: true, user: user, error: '' };
}

function authorizeV2ScholarshipWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for scholarship writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for scholarship writes.' };
  }

  return { success: true, user: user, error: '' };
}

function authorizeV2FileUploadActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for file uploads.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for file uploads.' };
  }

  return { success: true, user: user, error: '' };
}

function buildV2EventSheetRow_(normalized) {
  const data = normalized || {};
  return {
    event_id: cleanV2EventText_(data.event_id),
    title_th: cleanV2EventText_(data.title_th),
    title_en: cleanV2EventText_(data.title_en),
    event_type: cleanV2EventText_(data.event_type),
    event_mode: cleanV2EventText_(data.event_mode),
    organizer_unit_id: cleanV2EventText_(data.organizer_unit_id),
    country_id: cleanV2EventText_(data.country_id),
    location: cleanV2EventText_(data.location),
    meeting_url: cleanV2EventText_(data.meeting_url),
    start_date: cleanV2EventText_(data.start_date),
    end_date: cleanV2EventText_(data.end_date),
    start_time: cleanV2EventText_(data.start_time),
    end_time: cleanV2EventText_(data.end_time),
    participant_count: toNumberV2_(data.participant_count),
    detail_th: cleanV2EventText_(data.detail_th),
    detail_en: cleanV2EventText_(data.detail_en),
    link_url: cleanV2EventText_(data.link_url),
    pin: isTruthyV2_(data.pin),
    status: cleanV2EventText_(data.status || 'draft'),
    public_visible: isTruthyV2_(data.public_visible),
    is_deleted: false
  };
}

function buildV2ScholarshipSheetRow_(normalized) {
  const data = normalized || {};
  return {
    scholarship_id: cleanV2EventText_(data.scholarship_id),
    title_th: cleanV2EventText_(data.title_th),
    title_en: cleanV2EventText_(data.title_en),
    institution_name: cleanV2EventText_(data.institution_name),
    country_id: cleanV2EventText_(data.country_id),
    scholarship_type: cleanV2EventText_(data.scholarship_type),
    funding_type: cleanV2EventText_(data.funding_type),
    target_group: cleanV2EventText_(data.target_group),
    cover_summary: cleanV2EventText_(data.cover_summary),
    coverage_th: cleanV2EventText_(data.coverage_th),
    coverage_en: cleanV2EventText_(data.coverage_en),
    publish_date: cleanV2EventText_(data.publish_date),
    open_date: cleanV2EventText_(data.open_date),
    close_date: cleanV2EventText_(data.close_date),
    detail_url: cleanV2EventText_(data.detail_url),
    apply_url: cleanV2EventText_(data.apply_url),
    link_url: cleanV2EventText_(data.link_url),
    pin: isTruthyV2_(data.pin),
    status: cleanV2EventText_(data.status || 'draft'),
    public_visible: isTruthyV2_(data.public_visible),
    is_deleted: false
  };
}

function buildV2EventWritePreview_(request, ctx, mode) {
  const payload = extractV2EventWritePayload_(request);
  const normalized = normalizeV2EventWritePayload_(payload, ctx);
  const errors = [];
  const warnings = normalized.warnings || [];
  const data = normalized.data || {};
  const actionMode = String(mode || 'validate').trim();
  const normalizedMode = actionMode.toLowerCase();

  if (normalizedMode.indexOf('update') === 0 && !data.event_id) {
    errors.push({ field: 'event_id', code: 'EVENT_ID_REQUIRED', message: 'event_id is required for event update.' });
  }

  if (!data.title_th && !data.title_en) {
    errors.push({ field: 'title', code: 'TITLE_REQUIRED', message: 'title, title_th, or title_en is required.' });
  }

  if (!data.start_date) {
    errors.push({ field: 'start_date', code: 'START_DATE_REQUIRED', message: 'start_date is required.' });
  }

  if (data.end_date && data.start_date && data.end_date < data.start_date) {
    errors.push({ field: 'end_date', code: 'END_BEFORE_START', message: 'end_date must be the same as or after start_date.' });
  }

  if (data.status) {
    const statusCheck = validateEnumV2_(data.status, IROUP_V2_ENUMS.status, 'status');
    if (!statusCheck.success) errors.push({ field: 'status', code: statusCheck.code, message: statusCheck.error });
  }

  if (data.event_mode) {
    const modeCheck = validateEnumV2_(data.event_mode, IROUP_V2_ENUMS.event_mode, 'event_mode');
    if (!modeCheck.success) errors.push({ field: 'event_mode', code: modeCheck.code, message: modeCheck.error });
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'Event metadata payload validation failed.' : '',
    data: {
      dry_run: true,
      mode: actionMode,
      target_sheet: IROUP_V2_SHEETS.EVENT,
      write_enabled: false,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      normalized_event: data,
      relation_writes: {
        files: [],
        budgets: []
      },
      blocked_operations: [
        'sheet_write',
        'file_upload',
        'image_upload',
        'file_relation_write',
        'delete'
      ]
    }
  };
}

function buildV2ScholarshipWritePreview_(request, ctx, mode) {
  const payload = extractV2ScholarshipWritePayload_(request);
  const normalized = normalizeV2ScholarshipWritePayload_(payload, ctx);
  const errors = [];
  const warnings = normalized.warnings || [];
  const data = normalized.data || {};
  const actionMode = String(mode || 'validate').trim();
  const normalizedMode = actionMode.toLowerCase();

  if (normalizedMode.indexOf('update') === 0 && !data.scholarship_id) {
    errors.push({ field: 'scholarship_id', code: 'SCHOLARSHIP_ID_REQUIRED', message: 'scholarship_id is required for scholarship update.' });
  }

  ['title_th', 'institution_name', 'country_id', 'scholarship_type', 'open_date', 'close_date'].forEach(function (field) {
    if (!data[field]) {
      errors.push({ field: field, code: field.toUpperCase() + '_REQUIRED', message: field + ' is required.' });
    }
  });

  if (data.close_date && data.open_date && data.close_date < data.open_date) {
    errors.push({ field: 'close_date', code: 'CLOSE_BEFORE_OPEN', message: 'close_date must be the same as or after open_date.' });
  }

  if (data.status) {
    const statusCheck = validateEnumV2_(data.status, IROUP_V2_ENUMS.status, 'status');
    if (!statusCheck.success) errors.push({ field: 'status', code: statusCheck.code, message: statusCheck.error });
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'Scholarship metadata payload validation failed.' : '',
    data: {
      dry_run: true,
      mode: actionMode,
      target_sheet: IROUP_V2_SHEETS.SCHOLARSHIP,
      write_enabled: false,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      normalized_scholarship: data,
      relation_writes: {
        files: [],
        budgets: []
      },
      blocked_operations: [
        'sheet_write',
        'file_upload',
        'image_upload',
        'file_relation_write',
        'delete'
      ]
    }
  };
}

function extractV2EventWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.event || params.payload || params.event || null;

  if (candidate && typeof candidate === 'object') {
    return candidate;
  }

  if (candidate && typeof candidate === 'string') {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      return { payload_parse_error: err && err.message ? err.message : String(err) };
    }
  }

  return params;
}

function extractV2ScholarshipWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.scholarship || params.payload || params.scholarship || null;

  if (candidate && typeof candidate === 'object') {
    return candidate;
  }

  if (candidate && typeof candidate === 'string') {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      return { payload_parse_error: err && err.message ? err.message : String(err) };
    }
  }

  return params;
}

function extractV2FileUploadPayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.file || params.payload || params.file || null;

  if (candidate && typeof candidate === 'object') {
    return candidate;
  }

  if (candidate && typeof candidate === 'string') {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      return { payload_parse_error: err && err.message ? err.message : String(err) };
    }
  }

  return params;
}

function normalizeV2FileUploadPayload_(payload) {
  const source = payload || {};
  const errors = [];
  const normalized = {
    base64_data: cleanV2Base64Data_(pickV2EventValue_(source, ['base64_data', 'base64', 'data'])),
    filename: cleanV2EventText_(pickV2EventValue_(source, ['filename', 'file_name', 'name'])),
    mime_type: cleanV2EventText_(pickV2EventValue_(source, ['mime_type', 'mimeType', 'type'])) || 'application/octet-stream',
    module: cleanV2EventText_(source.module || '').toLowerCase(),
    record_id: cleanV2EventText_(pickV2EventValue_(source, ['record_id', 'recordId'])),
    file_role_id: cleanV2EventText_(pickV2EventValue_(source, ['file_role_id', 'fileRoleId', 'role'])),
    visibility_level: cleanV2EventText_(pickV2EventValue_(source, ['visibility_level', 'visibilityLevel'])) || 'internal',
    note: cleanV2EventText_(source.note || '')
  };

  if (source.payload_parse_error) errors.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  if (!normalized.base64_data) errors.push({ field: 'base64_data', code: 'BASE64_DATA_REQUIRED', message: 'base64 data is required.' });
  if (!normalized.filename) errors.push({ field: 'filename', code: 'FILENAME_REQUIRED', message: 'filename is required.' });
  if (!normalized.module) errors.push({ field: 'module', code: 'MODULE_REQUIRED', message: 'module is required.' });
  if (normalized.module && IROUP_V2_MODULES.indexOf(normalized.module) < 0) errors.push({ field: 'module', code: 'MODULE_INVALID', message: 'module is not supported.' });
  if (!normalized.record_id) errors.push({ field: 'record_id', code: 'RECORD_ID_REQUIRED', message: 'record_id is required.' });
  if (!normalized.file_role_id) errors.push({ field: 'file_role_id', code: 'FILE_ROLE_ID_REQUIRED', message: 'file_role_id is required.' });

  const visibilityCheck = validateVisibilityLevelV2_(normalized.visibility_level);
  if (!visibilityCheck.success) errors.push({ field: 'visibility_level', code: visibilityCheck.code, message: visibilityCheck.error });

  return {
    success: errors.length === 0,
    error: errors.length ? 'File upload payload validation failed.' : '',
    data: {
      valid: errors.length === 0,
      errors: errors,
      base64_data: normalized.base64_data,
      filename: normalized.filename,
      mime_type: normalized.mime_type,
      module: normalized.module,
      record_id: normalized.record_id,
      file_role_id: normalized.file_role_id,
      visibility_level: normalized.visibility_level,
      note: normalized.note
    }
  };
}

function cleanV2Base64Data_(value) {
  const text = cleanV2EventText_(value);
  if (!text) return '';
  const commaIndex = text.indexOf(',');
  if (text.indexOf('base64') >= 0 && commaIndex >= 0) {
    return text.slice(commaIndex + 1).trim();
  }
  return text;
}

function sanitizeV2FileUploadDiagnostics_(data) {
  const source = data || {};
  return {
    valid: source.valid === true,
    errors: source.errors || [],
    base64_size: source.base64_data ? String(source.base64_data).length : 0,
    filename: source.filename || '',
    mime_type: source.mime_type || '',
    module: source.module || '',
    record_id: source.record_id || '',
    file_role_id: source.file_role_id || '',
    visibility_level: source.visibility_level || '',
    note: source.note || ''
  };
}

function normalizeV2EventWritePayload_(payload, ctx) {
  const source = payload || {};
  const warnings = [];
  if (source.payload_parse_error) {
    warnings.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  }

  const country = resolveV2EventCountryRef_(source, ctx, warnings);
  const unit = resolveV2EventUnitRef_(source, ctx, warnings);
  const time = normalizeV2EventTime_(source.time || source.event_time || '');

  const title = cleanV2EventText_(pickV2EventValue_(source, ['title', 'title_th', 'title_en']));
  const detail = cleanV2EventText_(pickV2EventValue_(source, ['detail', 'detail_th', 'detail_en']));
  const normalized = {
    event_id: cleanV2EventText_(pickV2EventValue_(source, ['event_id', 'id'])),
    title_th: cleanV2EventText_(source.title_th || title),
    title_en: cleanV2EventText_(source.title_en || ''),
    event_type: cleanV2EventText_(pickV2EventValue_(source, ['event_type', 'type'])),
    event_mode: cleanV2EventText_(pickV2EventValue_(source, ['event_mode', 'mode'])),
    organizer_unit_id: unit.unit_id,
    organizer_display: unit.display,
    country_id: country.country_id,
    country_display: country.display,
    continent: cleanV2EventText_(pickV2EventValue_(source, ['continent', 'continent_en', 'continent_th'])),
    location: cleanV2EventText_(source.location || ''),
    meeting_url: cleanV2EventText_(pickV2EventValue_(source, ['meeting_url', 'meetingUrl'])),
    start_date: normalizeV2EventDate_(pickV2EventValue_(source, ['start_date', 'startDate', 'date'])),
    end_date: normalizeV2EventDate_(pickV2EventValue_(source, ['end_date', 'endDate'])) || normalizeV2EventDate_(pickV2EventValue_(source, ['start_date', 'startDate', 'date'])),
    start_time: cleanV2EventText_(source.start_time || time.start_time),
    end_time: cleanV2EventText_(source.end_time || time.end_time),
    participant_count: toNumberV2_(pickV2EventValue_(source, ['participant_count', 'participantCount', 'count'])),
    detail_th: cleanV2EventText_(source.detail_th || detail),
    detail_en: cleanV2EventText_(source.detail_en || ''),
    link_url: cleanV2EventText_(pickV2EventValue_(source, ['link_url', 'linkUrl', 'link', 'detail_url', 'detailUrl'])),
    pin: isTruthyV2_(source.pin),
    status: cleanV2EventText_(source.status || 'draft'),
    public_visible: isTruthyV2_(source.public_visible),
    is_deleted: false
  };

  return { data: normalized, warnings: warnings };
}

function normalizeV2ScholarshipWritePayload_(payload, ctx) {
  const source = payload || {};
  const warnings = [];
  if (source.payload_parse_error) {
    warnings.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  }

  const country = resolveV2EventCountryRef_(source, ctx, warnings);
  const normalized = {
    scholarship_id: cleanV2EventText_(pickV2EventValue_(source, ['scholarship_id', 'id'])),
    title_th: cleanV2EventText_(source.title_th || pickV2EventValue_(source, ['title', 'title_en'])),
    title_en: cleanV2EventText_(source.title_en || ''),
    institution_name: cleanV2EventText_(source.institution_name || ''),
    country_id: country.country_id,
    country_display: country.display,
    scholarship_type: cleanV2EventText_(source.scholarship_type || ''),
    funding_type: cleanV2EventText_(source.funding_type || ''),
    target_group: cleanV2EventText_(source.target_group || ''),
    cover_summary: cleanV2EventText_(source.cover_summary || ''),
    coverage_th: cleanV2EventText_(source.coverage_th || ''),
    coverage_en: cleanV2EventText_(source.coverage_en || ''),
    publish_date: normalizeV2EventDate_(source.publish_date || ''),
    open_date: normalizeV2EventDate_(source.open_date || ''),
    close_date: normalizeV2EventDate_(source.close_date || ''),
    detail_url: cleanV2EventText_(source.detail_url || ''),
    apply_url: cleanV2EventText_(source.apply_url || ''),
    link_url: cleanV2EventText_(pickV2EventValue_(source, ['link_url', 'linkUrl', 'link'])),
    pin: isTruthyV2_(source.pin),
    status: cleanV2EventText_(source.status || 'draft'),
    public_visible: isTruthyV2_(source.public_visible),
    is_deleted: false
  };

  return { data: normalized, warnings: warnings };
}

function resolveV2EventCountryRef_(source, ctx, warnings) {
  const countryId = cleanV2EventText_(pickV2EventValue_(source, ['country_id', 'countryId']));
  const display = cleanV2EventText_(pickV2EventValue_(source, ['country', 'country_name', 'countryName']));
  if (countryId && ctx.countriesById[countryId]) {
    return { country_id: countryId, display: display };
  }
  if (countryId) {
    warnings.push({ field: 'country_id', code: 'COUNTRY_ID_NOT_FOUND', message: 'country_id was not found in COUNTRY_MASTER.' });
    return { country_id: countryId, display: display };
  }
  if (!display) return { country_id: '', display: '' };

  const found = findV2CountryByDisplay_(ctx, display);
  if (found) return { country_id: found.country_id || '', display: display };

  warnings.push({ field: 'country', code: 'COUNTRY_DISPLAY_UNRESOLVED', message: 'country display fallback could not be resolved to country_id.' });
  return { country_id: '', display: display };
}

function resolveV2EventUnitRef_(source, ctx, warnings) {
  const unitId = cleanV2EventText_(pickV2EventValue_(source, ['organizer_unit_id', 'unit_id', 'unitId']));
  const display = cleanV2EventText_(pickV2EventValue_(source, ['organizer', 'unit', 'organizer_unit']));
  if (unitId && ctx.unitsById[unitId]) {
    return { unit_id: unitId, display: display };
  }
  if (unitId) {
    warnings.push({ field: 'organizer_unit_id', code: 'UNIT_ID_NOT_FOUND', message: 'organizer_unit_id was not found in UP_UNIT_MASTER.' });
    return { unit_id: unitId, display: display };
  }
  if (!display) return { unit_id: '', display: '' };

  const found = findV2UnitByDisplay_(ctx, display);
  if (found) return { unit_id: found.unit_id || '', display: display };

  warnings.push({ field: 'organizer', code: 'UNIT_DISPLAY_UNRESOLVED', message: 'organizer/unit display fallback could not be resolved to organizer_unit_id.' });
  return { unit_id: '', display: display };
}

function findV2CountryByDisplay_(ctx, display) {
  const target = cleanV2EventText_(display).toLowerCase();
  const rows = ctx.tables[IROUP_V2_SHEETS.COUNTRY_MASTER] || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const values = [
      row.country_id,
      row.iso2,
      row.iso3,
      row.country_name_en,
      row.country_name_th
    ].map(function (value) {
      return cleanV2EventText_(value).toLowerCase();
    });
    if (values.indexOf(target) >= 0) return row;
  }
  return null;
}

function findV2UnitByDisplay_(ctx, display) {
  const target = cleanV2EventText_(display).toLowerCase();
  const rows = ctx.tables[IROUP_V2_SHEETS.UP_UNIT_MASTER] || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const values = [
      row.unit_id,
      row.unit_code,
      row.unit_name_th,
      row.unit_name_en
    ].map(function (value) {
      return cleanV2EventText_(value).toLowerCase();
    });
    if (values.indexOf(target) >= 0) return row;
  }
  return null;
}

function normalizeV2EventDate_(value) {
  const text = cleanV2EventText_(value);
  if (!text) return '';
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return text;

  const local = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (local) {
    let year = Number(local[3]);
    if (year > 2400) year -= 543;
    if (year < 100) year += 2000;
    const month = String(Number(local[2])).padStart(2, '0');
    const day = String(Number(local[1])).padStart(2, '0');
    return String(year).padStart(4, '0') + '-' + month + '-' + day;
  }

  const parsed = new Date(text);
  if (isNaN(parsed.getTime())) return text;
  return Utilities.formatDate(parsed, 'Asia/Bangkok', 'yyyy-MM-dd');
}

function normalizeV2EventTime_(value) {
  const text = cleanV2EventText_(value);
  if (!text) return { start_time: '', end_time: '' };
  const parts = text.split(/[-–—]/).map(function (part) {
    return cleanV2EventText_(part);
  }).filter(function (part) {
    return !!part;
  });
  return {
    start_time: parts[0] || text,
    end_time: parts[1] || ''
  };
}

function pickV2EventValue_(source, keys) {
  const payload = source || {};
  for (let i = 0; i < (keys || []).length; i++) {
    const key = keys[i];
    if (payload[key] !== undefined && payload[key] !== null && String(payload[key]).trim() !== '') {
      return payload[key];
    }
  }
  return '';
}

function cleanV2EventText_(value) {
  return String(value === null || value === undefined ? '' : value).trim();
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

function getOrCreateV2FileUploadFolder_(folderName) {
  const name = cleanV2EventText_(folderName || 'IROUP_V2_FILES');
  const existing = DriveApp.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(name);
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
