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

function seedV2PersonSampleData() {
  const unitIds = getV2PersonSampleUnitIds_();
  if (!unitIds.length) {
    return adminResponseV2_(false, null, 0, 'UP_UNIT_MASTER has no available unit_id values.');
  }

  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyyMMddHHmmss');
  const updatedAt = now.toISOString();
  const rows = buildV2PersonSampleRows_(unitIds, timestamp, updatedAt);
  const studentResult = writeV2PersonSampleRows_(
    IROUP_V2_SHEETS.PERSON_STUDENT,
    'student_id',
    rows.students
  );
  if (!studentResult.success) return studentResult;

  const staffResult = writeV2PersonSampleRows_(
    IROUP_V2_SHEETS.PERSON_STAFF,
    'staff_id',
    rows.staff
  );
  if (!staffResult.success) return staffResult;

  SpreadsheetApp.flush();
  return adminResponseV2_(
    true,
    {
      students_added: studentResult.total,
      staff_added: staffResult.total,
      student_ids: studentResult.data.ids,
      staff_ids: staffResult.data.ids
    },
    studentResult.total + staffResult.total,
    ''
  );
}

function getV2PersonSampleUnitIds_() {
  const unitRows = readV2Sheet_(IROUP_V2_SHEETS.UP_UNIT_MASTER).data || [];
  return unitRows
    .filter(function (row) {
      return String(row.unit_id || '').trim() && !isSoftDeletedV2_(row);
    })
    .map(function (row) {
      return String(row.unit_id || '').trim();
    });
}

function buildV2PersonSampleRows_(unitIds, timestamp, updatedAt) {
  const unitAt = function (index) {
    return unitIds[index % unitIds.length];
  };

  const students = [
    ['นาย', 'กิตติพงศ์', 'ใจดี', 'ชาย', 'วิทยาการคอมพิวเตอร์', 'ป.ตรี'],
    ['นางสาว', 'พิมพ์ชนก', 'วัฒนกุล', 'หญิง', 'บริหารธุรกิจ', 'ป.ตรี'],
    ['นาย', 'ธนกฤต', 'ศรีสุข', 'ชาย', 'วิศวกรรมซอฟต์แวร์', 'ป.โท'],
    ['นางสาว', 'ณัฐธิดา', 'แก้วมณี', 'หญิง', 'สาธารณสุขศาสตร์', 'ป.ตรี'],
    ['นาย', 'ภาคภูมิ', 'จันทร์หอม', 'ชาย', 'ภาษาอังกฤษ', 'ป.ตรี'],
    ['นางสาว', 'ศิริลักษณ์', 'บุญเรือง', 'หญิง', 'นิติศาสตร์', 'ป.โท'],
    ['นาย', 'วรพล', 'ตันติวงศ์', 'ชาย', 'รัฐศาสตร์', 'ป.ตรี'],
    ['นางสาว', 'อรปรียา', 'คำแสน', 'หญิง', 'พยาบาลศาสตร์', 'ป.ตรี'],
    ['นาย', 'ชานนท์', 'อินทร์แก้ว', 'ชาย', 'เศรษฐศาสตร์', 'ป.เอก'],
    ['นางสาว', 'กัญญารัตน์', 'มีทรัพย์', 'หญิง', 'เทคโนโลยีสารสนเทศ', 'ป.ตรี'],
    ['นาย', 'ปณิธาน', 'สุขเกษม', 'ชาย', 'วิทยาศาสตร์การกีฬา', 'ป.โท'],
    ['นางสาว', 'ชลธิชา', 'แซ่ตั้ง', 'หญิง', 'การจัดการการท่องเที่ยว', 'ป.ตรี'],
    ['นาย', 'ณภัทร', 'วงศ์คำ', 'ชาย', 'แพทยศาสตร์', 'ป.ตรี'],
    ['นางสาว', 'สุพัตรา', 'ยอดแก้ว', 'หญิง', 'การบัญชี', 'ป.ตรี'],
    ['นาย', 'พิชญะ', 'ธรรมรักษ์', 'ชาย', 'สถาปัตยกรรมศาสตร์', 'ป.โท'],
    ['นางสาว', 'มนัสนันท์', 'แสงทอง', 'หญิง', 'วิทยาศาสตร์สิ่งแวดล้อม', 'ป.ตรี'],
    ['นาย', 'อิทธิพล', 'พรมมา', 'ชาย', 'วิศวกรรมโยธา', 'ป.เอก'],
    ['นางสาว', 'เบญจพร', 'พูลทรัพย์', 'หญิง', 'การสื่อสารดิจิทัล', 'ป.ตรี'],
    ['นาย', 'ศุภณัฐ', 'นาคเกิด', 'ชาย', 'ชีววิทยา', 'ป.ตรี'],
    ['นางสาว', 'ปรียาภรณ์', 'รัตนชัย', 'หญิง', 'หลักสูตรและการสอน', 'ป.โท']
  ].map(function (item, index) {
    const fullName = item[0] + item[1] + ' ' + item[2];
    return {
      student_id: 'STD-' + timestamp + '-' + String(index + 1).padStart(3, '0'),
      prefix_th: item[0],
      first_name_th: item[1],
      last_name_th: item[2],
      full_name_th: fullName,
      gender: item[3],
      unit_id: unitAt(index),
      program_th: item[4],
      degree_level: item[5],
      student_status: 'active',
      active: true,
      source_system: 'manual',
      updated_at: updatedAt
    };
  });

  const staff = [
    ['นาย', 'กิตติศักดิ์', 'สุวรรณศรี', 'Kittisak', 'Suwansri', 'ชาย', 'อาจารย์', 'academic'],
    ['นางสาว', 'ปาริฉัตร', 'วงศ์ใหญ่', 'Parichat', 'Wongyai', 'หญิง', 'นักวิเทศสัมพันธ์', 'support'],
    ['นาง', 'รัตนา', 'มณีรัตน์', 'Rattana', 'Maneerat', 'หญิง', 'ผู้ช่วยศาสตราจารย์', 'academic'],
    ['นาย', 'ธีรภัทร', 'จอมคำ', 'Teerapat', 'Jomkham', 'ชาย', 'นักวิชาการศึกษา', 'support'],
    ['นางสาว', 'อัญชลี', 'ศรีประเสริฐ', 'Anchalee', 'Sriprasert', 'หญิง', 'อาจารย์', 'academic'],
    ['นาย', 'วิเชียร', 'บุญมาก', 'Wichian', 'Boonmak', 'ชาย', 'เจ้าหน้าที่บริหารงานทั่วไป', 'support'],
    ['นางสาว', 'กมลชนก', 'อินทรชัย', 'Kamonchanok', 'Inthachai', 'หญิง', 'นักวิจัย', 'academic'],
    ['นาย', 'สุเมธ', 'ใจมั่น', 'Sumet', 'Jaiman', 'ชาย', 'นักวิเคราะห์นโยบายและแผน', 'support'],
    ['นาง', 'พัชรินทร์', 'คำภีร์', 'Patcharin', 'Khamphi', 'หญิง', 'รองศาสตราจารย์', 'academic'],
    ['นาย', 'จักรพันธ์', 'ทองดี', 'Jakkaphan', 'Thongdee', 'ชาย', 'นักเทคโนโลยีสารสนเทศ', 'support'],
    ['นางสาว', 'วิลาสินี', 'แสงแก้ว', 'Wilasinee', 'Saengkaew', 'หญิง', 'อาจารย์', 'academic'],
    ['นาย', 'นพดล', 'ศรีมงคล', 'Nopphadon', 'Srimongkol', 'ชาย', 'นักประชาสัมพันธ์', 'support'],
    ['นางสาว', 'สุชาดา', 'แก้วคำ', 'Suchada', 'Kaewkham', 'หญิง', 'ผู้ช่วยศาสตราจารย์', 'academic'],
    ['นาย', 'ประเสริฐ', 'พูนผล', 'Prasert', 'Poonphon', 'ชาย', 'เจ้าหน้าที่การเงินและบัญชี', 'support'],
    ['นาง', 'มาลินี', 'ธรรมวงศ์', 'Malinee', 'Thammawong', 'หญิง', 'อาจารย์', 'academic'],
    ['นาย', 'อนุชา', 'ยอดยิ่ง', 'Anucha', 'Yodying', 'ชาย', 'นักทรัพยากรบุคคล', 'support'],
    ['นางสาว', 'จิราพร', 'เผ่าพันธ์', 'Jiraporn', 'Phaophan', 'หญิง', 'นักวิจัย', 'academic'],
    ['นาย', 'ไกรสร', 'มั่นคง', 'Kraison', 'Mankhong', 'ชาย', 'นักวิชาการคอมพิวเตอร์', 'support'],
    ['นางสาว', 'เมธาวี', 'จันทร์ดี', 'Methavee', 'Chandee', 'หญิง', 'อาจารย์', 'academic'],
    ['นาย', 'ธวัชชัย', 'สุขสำราญ', 'Thawatchai', 'Suksamran', 'ชาย', 'เจ้าหน้าที่ประสานงานโครงการ', 'support']
  ].map(function (item, index) {
    const fullNameTh = item[0] + item[1] + ' ' + item[2];
    const fullNameEn = item[3] + ' ' + item[4];
    return {
      staff_id: 'STF-' + timestamp + '-' + String(index + 1).padStart(3, '0'),
      prefix_th: item[0],
      first_name_th: item[1],
      last_name_th: item[2],
      full_name_th: fullNameTh,
      first_name_en: item[3],
      last_name_en: item[4],
      full_name_en: fullNameEn,
      gender: item[5],
      unit_id: unitAt(index + 3),
      position: item[6],
      staff_type: item[7],
      active: true,
      source_system: 'manual',
      updated_at: updatedAt
    };
  });

  return {
    students: students,
    staff: staff
  };
}

function writeV2PersonSampleRows_(sheetName, idField, rows) {
  const sheetResult = getV2Sheet_(sheetName);
  if (!sheetResult.success) {
    return adminResponseV2_(false, null, 0, sheetResult.error);
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idColumnIndex = headers.indexOf(idField) + 1;
  if (idColumnIndex < 1) {
    return adminResponseV2_(false, null, 0, sheetName + ' missing required column: ' + idField);
  }

  const fieldNames = Object.keys(rows[0] || {});
  const missingFields = fieldNames.filter(function (field) {
    return headers.indexOf(field) < 0;
  });
  if (missingFields.length) {
    return adminResponseV2_(
      false,
      null,
      0,
      sheetName + ' missing required columns: ' + missingFields.join(', ')
    );
  }

  const writtenIds = [];
  rows.forEach(function (row) {
    const targetRow = findFirstEmptyRowByKey_(sheet, idColumnIndex);
    const values = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(row, header) ? row[header] : '';
    });
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([values]);
    writtenIds.push(row[idField]);
  });

  return adminResponseV2_(true, { ids: writtenIds }, writtenIds.length, '');
}

function createV2AdminPerson_(request) {
  const actor = requireV2Admin_(request);
  if (!actor.success) return adminResponseV2_(false, null, 0, actor.error);

  const payload = extractV2PersonWritePayload_(request);
  const normalized = normalizeV2PersonWritePayload_(payload);
  if (!normalized.success) return adminResponseV2_(false, normalized.data, 0, normalized.error);

  const person = normalized.data.person;
  const type = normalized.data.person_type;
  const now = new Date().toISOString();
  const sheetName = type === 'student' ? IROUP_V2_SHEETS.PERSON_STUDENT : IROUP_V2_SHEETS.PERSON_STAFF;
  const idField = type === 'student' ? 'student_id' : 'staff_id';
  const personId = person[idField];

  const existing = findV2RowById_(sheetName, idField, personId);
  if (existing.success && existing.data && !isSoftDeletedV2_(existing.data)) {
    return adminResponseV2_(false, { person_id: personId, person_type: type }, 0, idField + ' already exists.');
  }

  person.active = true;
  person.source_system = 'APP_FORM';
  person.updated_at = now;

  const requiredFields = type === 'student'
    ? ['student_id', 'full_name_th', 'active']
    : ['staff_id', 'full_name_th', 'active'];
  const persisted = appendV2Row_(sheetName, person, {
    idField: idField,
    requiredFields: requiredFields
  });

  if (!persisted.success) {
    return adminResponseV2_(false, {
      person_id: personId,
      diagnostics: persisted.diagnostics || null
    }, 0, persisted.error || 'Person create failed.');
  }

  const dto = type === 'student'
    ? mapV2PersonSearchStudentDto_(persisted.data)
    : mapV2PersonSearchStaffDto_(persisted.data);

  return adminResponseV2_(true, dto, 1, '');
}

function getV2AdminMobilityProject_(requestOrMobilityId) {
  const mobilityId = extractV2MobilityDetailId_(requestOrMobilityId);
  if (!mobilityId) {
    return adminResponseV2_(false, null, 0, 'mobility_id is required for mobility detail.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility_id', mobilityId);
  if (!existing.success || !existing.data) {
    return adminResponseV2_(false, {
      mobility_id: mobilityId
    }, 0, existing.error || 'Mobility project not found.');
  }
  if (isSoftDeletedV2_(existing.data)) {
    return adminResponseV2_(false, {
      mobility_id: mobilityId
    }, 0, 'Mobility project is deleted.');
  }

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const project = existing.data;
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
      if (!String(row.mobility_id || '').trim()) return false;
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
      if (!String(row.mou_id || '').trim()) return false;
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
      if (!String(row.scholarship_id || '').trim()) return false;
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

function getV2AdminNews_(requestOrNewsId) {
  const ready = ensureV2NewsSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const newsId = extractV2NewsId_(requestOrNewsId);
  if (!newsId) {
    return adminResponseV2_(false, null, 0, 'news_id is required for news detail.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.NEWS, 'news_id', newsId);
  if (!existing.success || !existing.data) {
    return adminResponseV2_(false, {
      news_id: newsId
    }, 0, existing.error || 'News item not found.');
  }
  if (isSoftDeletedV2_(existing.data)) {
    return adminResponseV2_(false, {
      news_id: newsId
    }, 0, 'News item is deleted.');
  }

  return adminResponseV2_(true, mapV2AdminNewsDto_(existing.data), 1, '');
}

function listV2AdminNews_() {
  const ready = ensureV2NewsSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const read = readV2Sheet_(IROUP_V2_SHEETS.NEWS);
  if (!read.success) return adminResponseV2_(false, null, 0, read.error);

  const rows = (read.data || [])
    .filter(function (row) {
      if (!String(row.news_id || '').trim()) return false;
      return !isSoftDeletedV2_(row);
    })
    .map(mapV2AdminNewsDto_);

  return adminResponseV2_(true, rows, rows.length, '');
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

function createV2AdminNews_(request) {
  return writeV2AdminNewsMetadata_(request, 'create');
}

function updateV2AdminNews_(request) {
  return writeV2AdminNewsMetadata_(request, 'update');
}

function createV2AdminMOU_(request) {
  return writeV2AdminMOUMetadata_(request, 'create');
}

function updateV2AdminMOU_(request) {
  return writeV2AdminMOUMetadata_(request, 'update');
}

function createV2AdminMobilityProject_(request) {
  return writeV2AdminMobilityProjectMetadata_(request, 'create');
}

function updateV2AdminMobilityProject_(request) {
  return writeV2AdminMobilityProjectMetadata_(request, 'update');
}

function createV2AdminTravelProject_(request) {
  return writeV2AdminTravelProjectMetadata_(request, 'create');
}

function updateV2AdminTravelProject_(request) {
  return writeV2AdminTravelProjectMetadata_(request, 'update');
}

function deleteV2AdminTravelProject_(request) {
  const flag = getV2TravelWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const travelId = extractV2TravelDeleteId_(request);
  if (!travelId) {
    return adminResponseV2_(false, null, 0, 'travel_id is required for travel delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', travelId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', travelId, {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      travel_id: travelId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    travel_id: travelId
  }, 1, '');
}

function deleteV2AdminMobilityProject_(request) {
  const flag = getV2MobilityWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2MobilityWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const mobilityId = extractV2MobilityDeleteId_(request);
  if (!mobilityId) {
    return adminResponseV2_(false, null, 0, 'mobility_id is required for mobility delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility_id', mobilityId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility_id', mobilityId, {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      mobility_id: mobilityId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    mobility_id: mobilityId
  }, 1, '');
}

function listV2AdminMobilityParticipants_(request) {
  const mobilityId = extractV2MobilityParticipantMobilityId_(request);
  if (!mobilityId) {
    return adminResponseV2_(false, null, 0, 'mobility_id is required for mobility participant list.');
  }

  const read = readV2Sheet_(IROUP_V2_SHEETS.MOBILITY_PARTICIPANT);
  if (!read.success) return adminResponseV2_(false, null, 0, read.error);

  const participants = (read.data || [])
    .filter(function (row) {
      return String(row.mobility_id || '').trim() === String(mobilityId || '').trim()
        && !isSoftDeletedV2_(row);
    })
    .map(mapV2AdminMobilityParticipantDto_);

  return adminResponseV2_(true, participants, participants.length, '');
}

function addV2AdminMobilityParticipant_(request) {
  const actor = authorizeV2MobilityWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const payload = extractV2MobilityParticipantPayload_(request);
  const normalized = normalizeV2MobilityParticipantPayload_(payload);
  if (!normalized.success) {
    return adminResponseV2_(false, normalized.data, 0, normalized.error);
  }

  const mobilityId = normalized.data.mobility_id;
  const existing = findV2RowById_(IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility_id', mobilityId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
  if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot add participant to a deleted mobility project.');

  const now = new Date().toISOString();
  const row = {
    participant_id: generateV2Id_(IROUP_V2_ID_PREFIXES.MOBILITY_PARTICIPANT),
    mobility_id: mobilityId,
    participant_type: normalized.data.participant_type,
    person_source: normalized.data.person_source,
    person_id: normalized.data.person_id,
    unit_id_snapshot: normalized.data.unit_id_snapshot,
    full_name_snapshot: normalized.data.full_name_snapshot,
    gender_snapshot: normalized.data.gender_snapshot,
    program_or_position_snapshot: normalized.data.program_or_position_snapshot,
    role: normalized.data.role,
    is_deleted: false,
    created_by: actor.user.email || '',
    created_at: now
  };

  const persisted = appendV2MobilityParticipantRow_(row);
  if (!persisted.success) {
    return adminResponseV2_(false, {
      participant_id: row.participant_id,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    participant_id: row.participant_id
  }, 1, '');
}

function deleteV2AdminMobilityParticipant_(request) {
  const actor = authorizeV2MobilityWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const participantId = extractV2MobilityParticipantDeleteId_(request);
  if (!participantId) {
    return adminResponseV2_(false, null, 0, 'participant_id is required for mobility participant delete.');
  }

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.MOBILITY_PARTICIPANT, 'participant_id', participantId, {
    is_deleted: true
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      participant_id: participantId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    participant_id: participantId
  }, 1, '');
}

function listV2AdminTravelParticipants_(request) {
  const travelId = extractV2TravelParticipantTravelId_(request);
  if (!travelId) {
    return adminResponseV2_(false, null, 0, 'travel_id is required for travel participant list.');
  }

  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const read = readV2Sheet_(IROUP_V2_SHEETS.TRAVEL_PARTICIPANT);
  if (!read.success) return adminResponseV2_(false, null, 0, read.error);

  const participants = (read.data || [])
    .filter(function (row) {
      return String(row.travel_id || '').trim() === String(travelId || '').trim()
        && !isSoftDeletedV2_(row);
    })
    .map(mapV2AdminTravelParticipantDto_);

  return adminResponseV2_(true, participants, participants.length, '');
}

function addV2AdminTravelParticipant_(request) {
  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const payload = extractV2TravelParticipantPayload_(request);
  const normalized = normalizeV2TravelParticipantPayload_(payload);
  if (!normalized.success) {
    return adminResponseV2_(false, normalized.data, 0, normalized.error);
  }

  const travelId = normalized.data.travel_id;
  const existing = findV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', travelId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
  if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot add participant to a deleted travel project.');

  const now = new Date().toISOString();
  const row = {
    travel_participant_id: generateV2Id_('TRVLP'),
    travel_id: travelId,
    person_source: normalized.data.person_source,
    person_id: normalized.data.person_id,
    full_name_snapshot: normalized.data.full_name_snapshot,
    unit_id_snapshot: normalized.data.unit_id_snapshot,
    position_snapshot: normalized.data.position_snapshot,
    role: normalized.data.role,
    is_deleted: false,
    created_by: actor.user.email || '',
    created_at: now
  };

  const persisted = appendV2Row_(IROUP_V2_SHEETS.TRAVEL_PARTICIPANT, row, {
    idField: 'travel_participant_id',
    requiredFields: ['travel_participant_id', 'travel_id', 'person_source', 'full_name_snapshot', 'is_deleted', 'created_by', 'created_at']
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      travel_participant_id: row.travel_participant_id,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    travel_participant_id: row.travel_participant_id
  }, 1, '');
}

function deleteV2AdminTravelParticipant_(request) {
  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const participantId = extractV2TravelParticipantDeleteId_(request);
  if (!participantId) {
    return adminResponseV2_(false, null, 0, 'travel_participant_id is required for travel participant delete.');
  }

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.TRAVEL_PARTICIPANT, 'travel_participant_id', participantId, {
    is_deleted: true
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      travel_participant_id: participantId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    travel_participant_id: participantId
  }, 1, '');
}

function saveV2AdminTravelBudget_(request) {
  Logger.log('[V2 Travel Budget Debug] function entered');
  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    Logger.log('[V2 Travel Budget Debug] auth failed: %s', actor.error || '');
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const payload = extractV2TravelBudgetPayload_(request);
  Logger.log('[V2 Travel Budget Debug] payload: %s', JSON.stringify(payload));
  const normalized = normalizeV2TravelBudgetPayload_(payload);
  Logger.log('[V2 Travel Budget Debug] normalized: %s', JSON.stringify(normalized.data || {}));
  if (!normalized.success) {
    Logger.log('[V2 Travel Budget Debug] validation failed: %s', JSON.stringify((normalized.data && normalized.data.errors) || []));
    return adminResponseV2_(false, normalized.data, 0, normalized.error);
  }

  const travelId = normalized.data.travel_id;
  const existingTravel = findV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', travelId);
  if (!existingTravel.success) {
    Logger.log('[V2 Travel Budget Debug] travel lookup failed: %s', existingTravel.error || '');
    return adminResponseV2_(false, null, 0, existingTravel.error);
  }
  if (isSoftDeletedV2_(existingTravel.data)) {
    Logger.log('[V2 Travel Budget Debug] travel is soft deleted: %s', travelId);
    return adminResponseV2_(false, null, 0, 'Cannot save budget for a deleted travel project.');
  }

  const existingBudget = findV2TravelBudgetByTravelId_(travelId);
  Logger.log('[V2 Travel Budget Debug] existing budget: %s', existingBudget ? JSON.stringify(existingBudget) : 'null');
  const now = new Date().toISOString();
  const adminEmail = cleanV2EventText_(actor.user.email);
  let budgetId = existingBudget ? cleanV2EventText_(existingBudget.budget_id) : generateV2Id_(IROUP_V2_ID_PREFIXES.BUDGET);
  if (!budgetId) budgetId = generateV2Id_('BUD');
  const budgetSheetFields = [
    'budget_id',
    'module',
    'record_id',
    'budget_type_id',
    'budget_source_type',
    'budget_source_unit_id',
    'budget_source_name',
    'currency',
    'exchange_rate',
    'amount',
    'amount_thb',
    'budget_note',
    'is_internal',
    'is_deleted',
    'created_by',
    'created_at'
  ];
  const budgetRequiredFields = ['budget_id', 'module', 'record_id', 'currency', 'is_internal', 'is_deleted', 'created_by', 'created_at'];
  const rawRow = {
    budget_id: String(budgetId || ''),
    module: 'travel',
    record_id: String(travelId || ''),
    budget_type_id: cleanV2EventText_(payload.budget_type_id || ''),
    budget_source_type: normalized.data.budget_source_type,
    budget_source_unit_id: cleanV2EventText_(payload.budget_source_unit_id || ''),
    budget_source_name: cleanV2EventText_(payload.budget_source_name || normalized.data.budget_source_type),
    currency: 'THB',
    exchange_rate: 1,
    amount: normalized.data.amount,
    amount_thb: normalized.data.amount_thb,
    budget_note: cleanV2EventText_(payload.budget_note || payload.note || ''),
    is_internal: Boolean(normalized.data.is_internal),
    is_deleted: false
  };
  const row = {};
  budgetSheetFields.forEach(function (field) {
    if (rawRow[field] !== undefined) row[field] = rawRow[field];
  });
  const buildBudgetDebugResponse = function (errorMessage, extraDebug) {
    const debug = {
      row_keys: Object.keys(row),
      row_values: JSON.stringify(row),
      sheet_name: IROUP_V2_SHEETS.BUDGET
    };
    if (extraDebug) {
      Object.keys(extraDebug).forEach(function (key) {
        debug[key] = extraDebug[key];
      });
    }
    return {
      success: false,
      data: null,
      total: 0,
      error: errorMessage || 'Travel budget save failed.',
      debug: debug
    };
  };

  let persisted;
  const budgetSheetResult = getV2Sheet_(IROUP_V2_SHEETS.BUDGET);
  const budgetHeaders = budgetSheetResult.success ? getV2Headers_(budgetSheetResult.data) : [];
  Logger.log('[V2 Travel Budget Debug] write mode: %s', existingBudget ? 'update' : 'create');
  Logger.log('[V2 Travel Budget Debug] BUDGET headers: %s', JSON.stringify(budgetHeaders));
  if (existingBudget) {
    const missingRequiredFields = budgetRequiredFields.filter(function (field) {
      return budgetHeaders.indexOf(field) < 0 || row[field] === undefined || row[field] === null || String(row[field]).trim() === '';
    });
    Logger.log('[V2 Travel Budget Debug] row: %s', JSON.stringify(row));
    Logger.log('[V2 Travel Budget Debug] missing required fields: %s', JSON.stringify(missingRequiredFields));
    const patch = {};
    Object.keys(row).forEach(function (key) {
      if (key !== 'budget_id') patch[key] = row[key];
    });
    persisted = updateV2RowById_(IROUP_V2_SHEETS.BUDGET, 'budget_id', budgetId, patch);
  } else {
    row.created_by = adminEmail;
    row.created_at = now;
    const missingRequiredFields = budgetRequiredFields.filter(function (field) {
      return budgetHeaders.indexOf(field) < 0 || row[field] === undefined || row[field] === null || String(row[field]).trim() === '';
    });
    Logger.log('[V2 Travel Budget Debug] row: %s', JSON.stringify(row));
    Logger.log('[V2 Travel Budget Debug] missing required fields: %s', JSON.stringify(missingRequiredFields));
    try {
      persisted = appendV2Row_(IROUP_V2_SHEETS.BUDGET, row, {
        idField: 'budget_id',
        requiredFields: budgetRequiredFields
      });
    } catch (e) {
      return buildBudgetDebugResponse(e && e.message ? e.message : String(e), {
        required_fields: budgetRequiredFields,
        missing_required_fields: missingRequiredFields
      });
    }
  }

  if (!persisted.success) {
    Logger.log('[V2 Travel Budget Debug] write failed: %s', JSON.stringify({
      error: persisted.error || '',
      diagnostics: persisted.diagnostics || {}
    }));
    if (!existingBudget) {
      return {
        success: false,
        error: 'BUDGET_DEBUG: ' + JSON.stringify({
          persisted_error: persisted.error,
          persisted_diagnostics: persisted.diagnostics,
          row_sent: row
        })
      };
    }
    return adminResponseV2_(false, {
      budget_id: budgetId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  Logger.log('[V2 Travel Budget Debug] write success: %s', JSON.stringify({
    budget_id: budgetId,
    mode: existingBudget ? 'update' : 'create'
  }));
  return adminResponseV2_(true, {
    success: true,
    budget_id: budgetId
  }, 1, '');
}

function getV2AdminTravelBudget_(request) {
  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const travelId = extractV2TravelBudgetTravelId_(request);
  if (!travelId) {
    return adminResponseV2_(false, null, 0, 'travel_id is required for travel budget get.');
  }

  const budget = findV2TravelBudgetByTravelId_(travelId);
  if (!budget) return adminResponseV2_(true, null, 0, '');

  const context = buildV2AdminContext_();
  const dto = context.success ? mapV2BudgetDto_(budget, context.data) : budget;
  return adminResponseV2_(true, dto, 1, '');
}

function deleteV2AdminMOU_(request) {
  const flag = getV2MOUWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2MOUWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const mouId = extractV2MOUDeleteId_(request);
  if (!mouId) {
    return adminResponseV2_(false, null, 0, 'mou_id is required for MOU delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.MOU, 'mou_id', mouId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.MOU, 'mou_id', mouId, {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      mou_id: mouId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    mou_id: mouId
  }, 1, '');
}

function deleteV2AdminEvent_(request) {
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

  const eventId = extractV2EventDeleteId_(request);
  if (!eventId) {
    return adminResponseV2_(false, null, 0, 'event_id is required for event delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.EVENT, 'event_id', eventId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
  if (isSoftDeletedV2_(existing.data)) {
    const alreadyDeletedContext = buildV2AdminContext_();
    return adminResponseV2_(true, {
      soft_deleted: true,
      already_deleted: true,
      event_id: eventId,
      event: alreadyDeletedContext.success ? mapV2AdminEventDto_(existing.data, alreadyDeletedContext.data, false) : existing.data
    }, 1, '');
  }

  const patch = {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  };
  const persisted = updateV2RowById_(IROUP_V2_SHEETS.EVENT, 'event_id', eventId, patch);
  if (!persisted.success) {
    return adminResponseV2_(false, {
      soft_deleted: false,
      event_id: eventId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  const context = buildV2AdminContext_();
  const dto = context.success ? mapV2AdminEventDto_(persisted.data, context.data, false) : persisted.data;
  return adminResponseV2_(true, {
    soft_deleted: true,
    physical_delete: false,
    event_id: eventId,
    event: dto,
    actor: {
      email: actor.user.email || '',
      role: actor.user.role || ''
    },
    diagnostics: persisted.diagnostics || {}
  }, 1, '');
}

function deleteV2AdminNews_(request) {
  const ready = ensureV2NewsSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const flag = getV2NewsWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2NewsWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const newsId = extractV2NewsId_(request);
  if (!newsId) {
    return adminResponseV2_(false, null, 0, 'news_id is required for news delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.NEWS, 'news_id', newsId);
  if (!existing.success || !existing.data) {
    return adminResponseV2_(false, {
      news_id: newsId
    }, 0, existing.error || 'News item not found.');
  }

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.NEWS, 'news_id', newsId, {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      news_id: newsId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    news_id: newsId
  }, 1, '');
}

function createV2AdminScholarship_(request) {
  return writeV2AdminScholarshipMetadata_(request, 'create');
}

function updateV2AdminScholarship_(request) {
  return writeV2AdminScholarshipMetadata_(request, 'update');
}

function deleteV2AdminScholarship_(request) {
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

  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const payload = body.payload || params.payload || {};
  const scholarshipId = cleanV2EventText_(
    payload.scholarship_id ||
    payload.id ||
    body.scholarship_id ||
    params.scholarship_id ||
    body.id ||
    params.id ||
    ''
  );

  if (!scholarshipId) {
    return adminResponseV2_(false, null, 0, 'scholarship_id is required for scholarship delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.SCHOLARSHIP, 'scholarship_id', scholarshipId);
  if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.SCHOLARSHIP, 'scholarship_id', scholarshipId, {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      scholarship_id: scholarshipId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    scholarship_id: scholarshipId
  }, 1, '');
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

function writeV2AdminMOUMetadata_(request, mode) {
  const flag = getV2MOUWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2MOUWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const headerReady = ensureV2MOUContinentColumn_();
  if (!headerReady.success) {
    return adminResponseV2_(false, headerReady.data || null, 0, headerReady.error);
  }

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const writeMode = String(mode || '').trim().toLowerCase();
  const previewMode = writeMode === 'update' ? 'update' : 'create';
  const preview = buildV2MOUWritePreview_(request, context.data, previewMode);
  if (!preview.success) {
    return adminResponseV2_(false, preview.data, 0, preview.error);
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  const normalized = preview.data.normalized_mou || {};
  let persisted;

  if (writeMode === 'update') {
    const mouId = cleanV2EventText_(normalized.mou_id);
    if (!mouId) {
      return adminResponseV2_(false, preview.data, 0, 'mou_id is required for MOU update.');
    }

    const existing = findV2RowById_(IROUP_V2_SHEETS.MOU, 'mou_id', mouId);
    if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
    if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot update a deleted MOU.');

    const patch = buildV2MOUSheetRow_(normalized);
    delete patch.mou_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.MOU, 'mou_id', mouId, patch);
  } else {
    const row = buildV2MOUSheetRow_(normalized);
    row.mou_id = generateV2Id_(IROUP_V2_ID_PREFIXES.MOU);
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.MOU, row, {
      idField: 'mou_id',
      requiredFields: ['mou_id', 'up_unit_id', 'partner_org_name', 'country_id', 'mou_type', 'start_date', 'end_date', 'fiscal_year', 'status']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  const dto = mapV2AdminMOUDto_(persisted.data, context.data, false);
  return adminResponseV2_(true, {
    dry_run: false,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.MOU,
    mou: dto,
    persisted_mou: persisted.data,
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

function writeV2AdminMobilityProjectMetadata_(request, mode) {
  const flag = getV2MobilityWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2MobilityWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const writeMode = String(mode || '').trim().toLowerCase();
  const previewMode = writeMode === 'update' ? 'update' : 'create';
  const preview = buildV2MobilityProjectWritePreview_(request, context.data, previewMode);
  if (!preview.success) {
    return adminResponseV2_(false, preview.data, 0, preview.error);
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  const normalized = preview.data.normalized_mobility || {};
  let persisted;

  if (writeMode === 'update') {
    const mobilityId = cleanV2EventText_(normalized.mobility_id);
    if (!mobilityId) {
      return adminResponseV2_(false, preview.data, 0, 'mobility_id is required for mobility update.');
    }

    const existing = findV2RowById_(IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility_id', mobilityId);
    if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
    if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot update a deleted mobility project.');

    const patch = buildV2MobilityProjectSheetRow_(normalized);
    delete patch.mobility_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.MOBILITY_PROJECT, 'mobility_id', mobilityId, patch);
  } else {
    const row = buildV2MobilityProjectSheetRow_(normalized);
    row.mobility_id = generateV2Id_(IROUP_V2_ID_PREFIXES.MOBILITY_PROJECT);
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.MOBILITY_PROJECT, row, {
      idField: 'mobility_id',
      requiredFields: ['mobility_id', 'direction', 'project_name', 'institution_name', 'country_id', 'up_unit_id', 'purpose', 'start_date', 'end_date', 'fiscal_year', 'status']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  const dto = mapV2AdminMobilityProjectDto_(persisted.data, context.data, false);
  return adminResponseV2_(true, {
    dry_run: false,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.MOBILITY_PROJECT,
    mobility: dto,
    persisted_mobility: persisted.data,
    actor: {
      email: adminEmail,
      role: actor.user.role || ''
    },
    relation_writes: {
      participants: [],
      files: [],
      budgets: []
    },
    skipped_operations: [
      'participant_write',
      'file_upload',
      'file_relation_write',
      'budget_relation_write'
    ],
    diagnostics: persisted.diagnostics || {}
  }, 1, '');
}

function writeV2AdminTravelProjectMetadata_(request, mode) {
  const flag = getV2TravelWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2TravelWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const context = buildV2AdminContext_();
  if (!context.success) return context;

  const writeMode = String(mode || '').trim().toLowerCase();
  const previewMode = writeMode === 'update' ? 'update' : 'create';
  const preview = buildV2TravelProjectWritePreview_(request, context.data, previewMode);
  if (!preview.success) {
    return adminResponseV2_(false, preview.data, 0, preview.error);
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  const normalized = preview.data.normalized_travel || {};
  let persisted;

  if (writeMode === 'update') {
    const travelId = cleanV2EventText_(normalized.travel_id);
    if (!travelId) {
      return adminResponseV2_(false, preview.data, 0, 'travel_id is required for travel update.');
    }

    const existing = findV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', travelId);
    if (!existing.success) return adminResponseV2_(false, null, 0, existing.error);
    if (isSoftDeletedV2_(existing.data)) return adminResponseV2_(false, null, 0, 'Cannot update a deleted travel project.');

    const patch = buildV2TravelProjectSheetRow_(normalized);
    delete patch.travel_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.TRAVEL, 'travel_id', travelId, patch);
  } else {
    const row = buildV2TravelProjectSheetRow_(normalized);
    row.travel_id = generateV2Id_('TRVL');
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.TRAVEL, row, {
      idField: 'travel_id',
      requiredFields: ['travel_id', 'project_name', 'purpose', 'country_id', 'start_date', 'end_date', 'fiscal_year', 'status']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  const dto = mapV2AdminTravelSummaryDto_(persisted.data, context.data);
  return adminResponseV2_(true, {
    dry_run: false,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.TRAVEL,
    travel: dto,
    persisted_travel: persisted.data,
    actor: {
      email: adminEmail,
      role: actor.user.role || ''
    },
    relation_writes: {
      participants: [],
      files: [],
      budgets: []
    },
    skipped_operations: [
      'participant_write',
      'file_upload',
      'file_relation_write',
      'budget_relation_write'
    ],
    diagnostics: persisted.diagnostics || {}
  }, 1, '');
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

function writeV2AdminNewsMetadata_(request, mode) {
  const ready = ensureV2NewsSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const flag = getV2NewsWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2NewsWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const writeMode = String(mode || '').trim().toLowerCase();
  const payload = extractV2NewsWritePayload_(request);
  const normalized = normalizeV2NewsWritePayload_(payload);
  const errors = [];
  if (writeMode === 'update' && !normalized.news_id) {
    errors.push({ field: 'news_id', code: 'NEWS_ID_REQUIRED', message: 'news_id is required for news update.' });
  }
  if (!normalized.title_th) {
    errors.push({ field: 'title_th', code: 'TITLE_TH_REQUIRED', message: 'title_th is required.' });
  }
  if (errors.length) {
    return adminResponseV2_(false, {
      valid: false,
      errors: errors,
      normalized_news: normalized
    }, 0, 'News payload validation failed.');
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  let persisted;

  if (writeMode === 'update') {
    const newsId = cleanV2EventText_(normalized.news_id);
    const existing = findV2RowById_(IROUP_V2_SHEETS.NEWS, 'news_id', newsId);
    if (!existing.success || !existing.data) {
      return adminResponseV2_(false, {
        news_id: newsId
      }, 0, existing.error || 'News item not found.');
    }
    if (isSoftDeletedV2_(existing.data)) {
      return adminResponseV2_(false, {
        news_id: newsId
      }, 0, 'Cannot update a deleted news item.');
    }

    const patch = buildV2NewsSheetRow_(normalized);
    delete patch.news_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.NEWS, 'news_id', newsId, patch);
  } else {
    const row = buildV2NewsSheetRow_(normalized);
    row.news_id = generateV2Id_('NEWS');
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.NEWS, row, {
      idField: 'news_id',
      requiredFields: ['news_id', 'title_th', 'public_visible', 'is_deleted', 'created_by', 'updated_by', 'created_at', 'updated_at']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.NEWS,
    news: mapV2AdminNewsDto_(persisted.data),
    persisted_news: persisted.data,
    actor: {
      email: adminEmail,
      role: actor.user.role || ''
    }
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

function getV2NewsWriteFeatureFlag_() {
  const property = 'IROUP_V2_NEWS_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 news metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
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

function getV2MOUWriteFeatureFlag_() {
  const property = 'IROUP_V2_MOU_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 MOU metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function getV2MobilityWriteFeatureFlag_() {
  const property = 'IROUP_V2_MOBILITY_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 mobility metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function getV2TravelWriteFeatureFlag_() {
  const property = 'IROUP_V2_TRAVEL_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 travel metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function ensureV2MOUContinentColumn_() {
  const sheetResult = getV2Sheet_(IROUP_V2_SHEETS.MOU);
  if (!sheetResult.success) return sheetResult;

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  if (!headers.length) {
    return { success: false, data: null, error: 'Missing headers in V2 sheet: ' + IROUP_V2_SHEETS.MOU };
  }
  if (headers.indexOf('continent') >= 0) {
    return { success: true, data: { added: false, field: 'continent' }, error: '' };
  }

  let column;
  if (headers.indexOf('country_id') >= 0) {
    column = headers.indexOf('country_id') + 2;
    sheet.insertColumnBefore(column);
  } else {
    sheet.insertColumnAfter(headers.length);
    column = headers.length + 1;
  }
  sheet.getRange(1, column).setValue('continent');
  SpreadsheetApp.flush();

  return { success: true, data: { added: true, field: 'continent', column: column }, error: '' };
}

function ensureV2NewsSheet_() {
  const headers = getV2NewsSheetHeaders_();
  const ss = getV2SS_();
  let sheet = ss.getSheetByName(IROUP_V2_SHEETS.NEWS);
  if (!sheet) {
    sheet = ss.insertSheet(IROUP_V2_SHEETS.NEWS);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { success: true, data: { created: true, missing_headers_added: headers }, error: '' };
  }

  const existingHeaders = getV2Headers_(sheet);
  if (!existingHeaders.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { success: true, data: { created: false, missing_headers_added: headers }, error: '' };
  }

  const missingHeaders = headers.filter(function (header) {
    return existingHeaders.indexOf(header) < 0;
  });
  if (missingHeaders.length) {
    sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }

  return { success: true, data: { created: false, missing_headers_added: missingHeaders }, error: '' };
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

function authorizeV2NewsWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for news writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for news writes.' };
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

function authorizeV2MOUWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for MOU writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for MOU writes.' };
  }

  return { success: true, user: user, error: '' };
}

function authorizeV2MobilityWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for mobility writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for mobility writes.' };
  }

  return { success: true, user: user, error: '' };
}

function authorizeV2TravelWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for travel writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for travel writes.' };
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

function buildV2NewsSheetRow_(normalized) {
  const data = normalized || {};
  return {
    news_id: cleanV2EventText_(data.news_id),
    title_th: cleanV2EventText_(data.title_th),
    title_en: cleanV2EventText_(data.title_en),
    content_th: cleanV2EventText_(data.content_th),
    content_en: cleanV2EventText_(data.content_en),
    publish_date: cleanV2EventText_(data.publish_date),
    category: cleanV2EventText_(data.category),
    sdg_tags: cleanV2EventText_(data.sdg_tags),
    credit: cleanV2EventText_(data.credit),
    link_url: cleanV2EventText_(data.link_url),
    public_visible: isTruthyV2_(data.public_visible),
    is_deleted: false
  };
}

function buildV2MOUSheetRow_(normalized) {
  const data = normalized || {};
  return {
    mou_id: cleanV2EventText_(data.mou_id),
    up_unit_id: cleanV2EventText_(data.up_unit_id),
    partner_org_name: cleanV2EventText_(data.partner_org_name),
    partner_org_name_en: cleanV2EventText_(data.partner_org_name_en),
    country_id: cleanV2EventText_(data.country_id),
    continent: cleanV2EventText_(data.continent),
    mou_type: cleanV2EventText_(data.mou_type),
    start_date: cleanV2EventText_(data.start_date),
    end_date: cleanV2EventText_(data.end_date),
    fiscal_year: cleanV2EventText_(data.fiscal_year),
    status: cleanV2EventText_(data.status || 'draft'),
    public_visible: isTruthyV2_(data.public_visible),
    public_file_allowed: isTruthyV2_(data.public_file_allowed),
    is_deleted: false
  };
}

function buildV2MobilityProjectSheetRow_(normalized) {
  const data = normalized || {};
  return {
    mobility_id: cleanV2EventText_(data.mobility_id),
    direction: cleanV2EventText_(data.direction),
    project_name: cleanV2EventText_(data.project_name),
    institution_name: cleanV2EventText_(data.institution_name),
    country_id: cleanV2EventText_(data.country_id),
    city: cleanV2EventText_(data.city),
    up_unit_id: cleanV2EventText_(data.up_unit_id),
    purpose: cleanV2EventText_(data.purpose),
    level: cleanV2EventText_(data.level),
    participant_group: cleanV2EventText_(data.participant_group),
    start_date: cleanV2EventText_(data.start_date),
    end_date: cleanV2EventText_(data.end_date),
    fiscal_year: cleanV2EventText_(data.fiscal_year),
    participant_count_cached: toNumberV2_(data.participant_count),
    student_count: toNumberV2_(data.student_count),
    staff_count: toNumberV2_(data.staff_count),
    status: cleanV2EventText_(data.status || 'draft'),
    public_visible: isTruthyV2_(data.public_visible),
    is_deleted: false
  };
}

function buildV2TravelProjectSheetRow_(normalized) {
  const data = normalized || {};
  return {
    travel_id: cleanV2EventText_(data.travel_id),
    project_name: cleanV2EventText_(data.project_name),
    purpose: cleanV2EventText_(data.purpose),
    country_id: cleanV2EventText_(data.country_id),
    city: cleanV2EventText_(data.city),
    start_date: cleanV2EventText_(data.start_date),
    end_date: cleanV2EventText_(data.end_date),
    fiscal_year: cleanV2EventText_(data.fiscal_year),
    status: cleanV2EventText_(data.status || 'draft'),
    participant_count: toNumberV2_(data.participant_count),
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
    content_th: cleanV2EventText_(data.content_th),
    content_en: cleanV2EventText_(data.content_en),
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

function buildV2MOUWritePreview_(request, ctx, mode) {
  const payload = extractV2MOUWritePayload_(request);
  const normalized = normalizeV2MOUWritePayload_(payload, ctx);
  const errors = [];
  const warnings = normalized.warnings || [];
  const data = normalized.data || {};
  const actionMode = String(mode || 'validate').trim();
  const normalizedMode = actionMode.toLowerCase();

  if (normalizedMode.indexOf('update') === 0 && !data.mou_id) {
    errors.push({ field: 'mou_id', code: 'MOU_ID_REQUIRED', message: 'mou_id is required for MOU update.' });
  }

  ['up_unit_id', 'partner_org_name', 'country_id', 'mou_type', 'start_date', 'end_date', 'fiscal_year', 'status'].forEach(function (field) {
    if (!data[field]) {
      errors.push({ field: field, code: field.toUpperCase() + '_REQUIRED', message: field + ' is required.' });
    }
  });

  if (data.end_date && data.start_date && data.end_date < data.start_date) {
    errors.push({ field: 'end_date', code: 'END_BEFORE_START', message: 'end_date must be the same as or after start_date.' });
  }

  if (data.status) {
    const statusCheck = validateEnumV2_(data.status, IROUP_V2_ENUMS.status, 'status');
    if (!statusCheck.success) errors.push({ field: 'status', code: statusCheck.code, message: statusCheck.error });
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'MOU metadata payload validation failed.' : '',
    data: {
      dry_run: true,
      mode: actionMode,
      target_sheet: IROUP_V2_SHEETS.MOU,
      write_enabled: false,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      normalized_mou: data,
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

function buildV2MobilityProjectWritePreview_(request, ctx, mode) {
  const payload = extractV2MobilityWritePayload_(request);
  const normalized = normalizeV2MobilityWritePayload_(payload, ctx);
  const errors = [];
  const warnings = normalized.warnings || [];
  const data = normalized.data || {};
  const actionMode = String(mode || 'validate').trim();
  const normalizedMode = actionMode.toLowerCase();

  if (normalizedMode.indexOf('update') === 0 && !data.mobility_id) {
    errors.push({ field: 'mobility_id', code: 'MOBILITY_ID_REQUIRED', message: 'mobility_id is required for mobility update.' });
  }

  ['direction', 'project_name', 'institution_name', 'country_id', 'up_unit_id', 'purpose', 'start_date', 'end_date', 'fiscal_year', 'status'].forEach(function (field) {
    if (!data[field]) {
      errors.push({ field: field, code: field.toUpperCase() + '_REQUIRED', message: field + ' is required.' });
    }
  });

  if (data.end_date && data.start_date && data.end_date < data.start_date) {
    errors.push({ field: 'end_date', code: 'END_BEFORE_START', message: 'end_date must be the same as or after start_date.' });
  }

  if (data.direction) {
    const directionCheck = validateDirectionV2_(data.direction);
    if (!directionCheck.success) errors.push({ field: 'direction', code: directionCheck.code, message: directionCheck.error });
  }

  if (data.status) {
    const statusCheck = validateEnumV2_(data.status, IROUP_V2_ENUMS.status, 'status');
    if (!statusCheck.success) errors.push({ field: 'status', code: statusCheck.code, message: statusCheck.error });
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'Mobility metadata payload validation failed.' : '',
    data: {
      dry_run: true,
      mode: actionMode,
      target_sheet: IROUP_V2_SHEETS.MOBILITY_PROJECT,
      write_enabled: false,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      normalized_mobility: data,
      relation_writes: {
        participants: [],
        files: [],
        budgets: []
      },
      blocked_operations: [
        'sheet_write',
        'participant_write',
        'file_upload',
        'file_relation_write',
        'budget_relation_write',
        'delete'
      ]
    }
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

function buildV2TravelProjectWritePreview_(request, ctx, mode) {
  const payload = extractV2TravelWritePayload_(request);
  const normalized = normalizeV2TravelWritePayload_(payload, ctx);
  const errors = [];
  const warnings = normalized.warnings || [];
  const data = normalized.data || {};
  const actionMode = String(mode || 'validate').trim();
  const normalizedMode = actionMode.toLowerCase();

  if (normalizedMode.indexOf('update') === 0 && !data.travel_id) {
    errors.push({ field: 'travel_id', code: 'TRAVEL_ID_REQUIRED', message: 'travel_id is required for travel update.' });
  }

  ['project_name', 'purpose', 'country_id', 'start_date', 'end_date', 'fiscal_year', 'status'].forEach(function (field) {
    if (!data[field]) {
      errors.push({ field: field, code: field.toUpperCase() + '_REQUIRED', message: field + ' is required.' });
    }
  });

  if (data.end_date && data.start_date && data.end_date < data.start_date) {
    errors.push({ field: 'end_date', code: 'END_BEFORE_START', message: 'end_date must be the same as or after start_date.' });
  }

  if (data.status) {
    const statusCheck = validateEnumV2_(data.status, IROUP_V2_ENUMS.status, 'status');
    if (!statusCheck.success) errors.push({ field: 'status', code: statusCheck.code, message: statusCheck.error });
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'Travel metadata payload validation failed.' : '',
    data: {
      dry_run: true,
      mode: actionMode,
      target_sheet: IROUP_V2_SHEETS.TRAVEL,
      write_enabled: false,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      normalized_travel: data,
      relation_writes: {
        participants: [],
        files: [],
        budgets: []
      },
      blocked_operations: [
        'sheet_write',
        'participant_write',
        'file_upload',
        'file_relation_write',
        'budget_relation_write',
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

function extractV2NewsWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.news || params.payload || params.news || null;

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

function extractV2MOUWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.mou || params.payload || params.mou || null;

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

function extractV2MobilityWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.mobility || params.payload || params.mobility || null;

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

function extractV2TravelWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.travel || params.payload || params.travel || null;

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

function extractV2MobilityDetailId_(requestOrMobilityId) {
  if (!requestOrMobilityId || typeof requestOrMobilityId !== 'object') {
    return cleanV2EventText_(requestOrMobilityId || '');
  }

  const params = requestOrMobilityId.params || {};
  const body = requestOrMobilityId.body || {};
  const candidate = body.payload || body.mobility || params.payload || params.mobility || null;

  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.mobility_id || candidate.id || candidate.record_id || '');
  }

  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.mobility_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.mobility_id || params.id || params.record_id || '');
    }
  }

  return cleanV2EventText_(body.mobility_id || params.mobility_id || body.id || params.id || body.record_id || params.record_id || '');
}

function extractV2MobilityParticipantPayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.participant || params.payload || params.participant || null;

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

function extractV2TravelParticipantPayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.participant || params.payload || params.participant || null;

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

function extractV2PersonWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.person || params.payload || params.person || null;

  if (candidate && typeof candidate === 'object') return candidate;

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

function extractV2EventDeleteId_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.event || params.payload || params.event || null;
  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.event_id || candidate.id || candidate.record_id || '');
  }
  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.event_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.event_id || params.id || params.record_id || '');
    }
  }
  return cleanV2EventText_(body.event_id || params.event_id || body.id || params.id || body.record_id || params.record_id || '');
}

function extractV2NewsId_(requestOrNewsId) {
  if (!requestOrNewsId || typeof requestOrNewsId !== 'object') {
    return cleanV2EventText_(requestOrNewsId || '');
  }

  const params = requestOrNewsId.params || {};
  const body = requestOrNewsId.body || {};
  const candidate = body.payload || body.news || params.payload || params.news || null;
  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.news_id || candidate.id || candidate.record_id || '');
  }
  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.news_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.news_id || params.id || params.record_id || '');
    }
  }
  return cleanV2EventText_(body.news_id || params.news_id || body.id || params.id || body.record_id || params.record_id || '');
}

function extractV2MOUDeleteId_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.mou || params.payload || params.mou || null;
  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.mou_id || candidate.id || candidate.record_id || '');
  }
  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.mou_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.mou_id || params.id || params.record_id || '');
    }
  }
  return cleanV2EventText_(body.mou_id || params.mou_id || body.id || params.id || body.record_id || params.record_id || '');
}

function extractV2MobilityDeleteId_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.mobility || params.payload || params.mobility || null;
  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.mobility_id || candidate.id || candidate.record_id || '');
  }
  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.mobility_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.mobility_id || params.id || params.record_id || '');
    }
  }
  return cleanV2EventText_(body.mobility_id || params.mobility_id || body.id || params.id || body.record_id || params.record_id || '');
}

function extractV2TravelDeleteId_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.travel || params.payload || params.travel || null;
  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.travel_id || candidate.id || candidate.record_id || '');
  }
  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.travel_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.travel_id || params.id || params.record_id || '');
    }
  }
  return cleanV2EventText_(body.travel_id || params.travel_id || body.id || params.id || body.record_id || params.record_id || '');
}

function extractV2MobilityParticipantMobilityId_(request) {
  const payload = extractV2MobilityParticipantPayload_(request);
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  return cleanV2EventText_(payload.mobility_id || body.mobility_id || params.mobility_id || payload.id || body.id || params.id || '');
}

function extractV2TravelParticipantTravelId_(request) {
  const payload = extractV2TravelParticipantPayload_(request);
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  return cleanV2EventText_(payload.travel_id || body.travel_id || params.travel_id || payload.id || body.id || params.id || '');
}

function extractV2MobilityParticipantDeleteId_(request) {
  const payload = extractV2MobilityParticipantPayload_(request);
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  return cleanV2EventText_(payload.participant_id || body.participant_id || params.participant_id || payload.id || body.id || params.id || '');
}

function extractV2TravelParticipantDeleteId_(request) {
  const payload = extractV2TravelParticipantPayload_(request);
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  return cleanV2EventText_(payload.travel_participant_id || body.travel_participant_id || params.travel_participant_id || payload.participant_id || body.participant_id || params.participant_id || payload.id || body.id || params.id || '');
}

function extractV2TravelBudgetPayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.budget || params.payload || params.budget || null;

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

function extractV2TravelBudgetTravelId_(request) {
  const payload = extractV2TravelBudgetPayload_(request);
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  return cleanV2EventText_(payload.travel_id || body.travel_id || params.travel_id || payload.record_id || body.record_id || params.record_id || payload.id || body.id || params.id || '');
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

function normalizeV2NewsWritePayload_(payload) {
  const source = payload || {};
  return {
    news_id: cleanV2EventText_(pickV2EventValue_(source, ['news_id', 'id'])),
    title_th: cleanV2EventText_(source.title_th || ''),
    title_en: cleanV2EventText_(source.title_en || ''),
    content_th: cleanV2EventText_(source.content_th || ''),
    content_en: cleanV2EventText_(source.content_en || ''),
    publish_date: normalizeV2EventDate_(source.publish_date || ''),
    category: cleanV2EventText_(source.category || ''),
    sdg_tags: normalizeV2NewsSdgTags_(source.sdg_tags),
    credit: cleanV2EventText_(source.credit || ''),
    link_url: cleanV2EventText_(pickV2EventValue_(source, ['link_url', 'linkUrl', 'link'])),
    public_visible: isTruthyV2_(source.public_visible),
    is_deleted: false
  };
}

function normalizeV2NewsSdgTags_(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return cleanV2EventText_(item);
    }).filter(function (item) {
      return !!item;
    }).join(', ');
  }
  return cleanV2EventText_(value || '');
}

function normalizeV2MOUWritePayload_(payload, ctx) {
  const source = payload || {};
  const warnings = [];
  if (source.payload_parse_error) {
    warnings.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  }

  const country = resolveV2EventCountryRef_(source, ctx, warnings);
  const unit = resolveV2MOUUnitRef_(source, ctx, warnings);
  const normalized = {
    mou_id: cleanV2EventText_(pickV2EventValue_(source, ['mou_id', 'id'])),
    up_unit_id: unit.unit_id,
    up_unit_display: unit.display,
    partner_org_name: cleanV2EventText_(source.partner_org_name || ''),
    partner_org_name_en: cleanV2EventText_(source.partner_org_name_en || ''),
    country_id: country.country_id,
    country_display: country.display,
    continent: cleanV2EventText_(pickV2EventValue_(source, ['continent', 'continent_th', 'continent_en'])),
    mou_type: cleanV2EventText_(source.mou_type || ''),
    start_date: normalizeV2EventDate_(source.start_date || ''),
    end_date: normalizeV2EventDate_(source.end_date || ''),
    fiscal_year: cleanV2EventText_(source.fiscal_year || ''),
    status: cleanV2EventText_(source.status || 'draft'),
    public_visible: isTruthyV2_(source.public_visible),
    public_file_allowed: isTruthyV2_(source.public_file_allowed),
    is_deleted: false
  };

  return { data: normalized, warnings: warnings };
}

function normalizeV2MobilityWritePayload_(payload, ctx) {
  const source = payload || {};
  const warnings = [];
  if (source.payload_parse_error) {
    warnings.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  }

  const country = resolveV2EventCountryRef_(source, ctx, warnings);
  const unit = resolveV2MOUUnitRef_(source, ctx, warnings);
  const normalized = {
    mobility_id: cleanV2EventText_(pickV2EventValue_(source, ['mobility_id', 'id'])),
    direction: cleanV2EventText_(source.direction || ''),
    project_name: cleanV2EventText_(source.project_name || ''),
    institution_name: cleanV2EventText_(source.institution_name || ''),
    country_id: country.country_id,
    country_display: country.display,
    city: cleanV2EventText_(source.city || ''),
    up_unit_id: unit.unit_id,
    up_unit_display: unit.display,
    purpose: cleanV2EventText_(source.purpose || ''),
    level: cleanV2EventText_(source.level || ''),
    participant_group: cleanV2EventText_(source.participant_group || ''),
    start_date: normalizeV2EventDate_(source.start_date || ''),
    end_date: normalizeV2EventDate_(source.end_date || ''),
    fiscal_year: cleanV2EventText_(source.fiscal_year || ''),
    participant_count: toNumberV2_(pickV2EventValue_(source, ['participant_count', 'participantCount', 'count'])),
    student_count: toNumberV2_(pickV2EventValue_(source, ['student_count', 'studentCount'])),
    staff_count: toNumberV2_(pickV2EventValue_(source, ['staff_count', 'staffCount'])),
    status: cleanV2EventText_(source.status || 'draft'),
    public_visible: isTruthyV2_(source.public_visible),
    is_deleted: false
  };

  return { data: normalized, warnings: warnings };
}

function normalizeV2TravelWritePayload_(payload, ctx) {
  const source = payload || {};
  const warnings = [];
  if (source.payload_parse_error) {
    warnings.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  }

  const country = resolveV2EventCountryRef_(source, ctx, warnings);
  const normalized = {
    travel_id: cleanV2EventText_(pickV2EventValue_(source, ['travel_id', 'id'])),
    project_name: cleanV2EventText_(source.project_name || ''),
    purpose: cleanV2EventText_(source.purpose || ''),
    country_id: country.country_id,
    country_display: country.display,
    city: cleanV2EventText_(source.city || ''),
    start_date: normalizeV2EventDate_(source.start_date || ''),
    end_date: normalizeV2EventDate_(source.end_date || ''),
    fiscal_year: cleanV2EventText_(source.fiscal_year || ''),
    status: cleanV2EventText_(source.status || 'draft'),
    participant_count: toNumberV2_(pickV2EventValue_(source, ['participant_count', 'participantCount', 'count'])),
    public_visible: isTruthyV2_(source.public_visible),
    is_deleted: false
  };

  return { data: normalized, warnings: warnings };
}

function normalizeV2MobilityParticipantPayload_(payload) {
  const source = payload || {};
  const errors = [];
  const participantType = normalizeV2MobilityParticipantType_(source.participant_type);
  const personSource = normalizeV2MobilityPersonSource_(source.person_source);
  const normalized = {
    mobility_id: cleanV2EventText_(source.mobility_id || ''),
    participant_type: participantType,
    person_source: personSource,
    person_id: cleanV2EventText_(source.person_id || ''),
    full_name_snapshot: cleanV2EventText_(source.full_name_snapshot || ''),
    gender_snapshot: cleanV2EventText_(source.gender_snapshot || ''),
    unit_id_snapshot: cleanV2EventText_(source.unit_id_snapshot || ''),
    program_or_position_snapshot: cleanV2EventText_(source.program_or_position_snapshot || ''),
    role: cleanV2EventText_(source.role || '')
  };

  if (source.payload_parse_error) errors.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  if (!normalized.mobility_id) errors.push({ field: 'mobility_id', code: 'MOBILITY_ID_REQUIRED', message: 'mobility_id is required.' });
  if (!normalized.participant_type) errors.push({ field: 'participant_type', code: 'PARTICIPANT_TYPE_REQUIRED', message: 'participant_type is required.' });
  if (participantType && ['student', 'staff', 'manual'].indexOf(participantType) < 0) {
    errors.push({ field: 'participant_type', code: 'PARTICIPANT_TYPE_INVALID', message: 'participant_type must be student, staff, or manual.' });
  }
  if (!normalized.person_source) errors.push({ field: 'person_source', code: 'PERSON_SOURCE_REQUIRED', message: 'person_source is required.' });
  if (personSource && ['PERSON_STUDENT', 'PERSON_STAFF', 'manual'].indexOf(personSource) < 0) {
    errors.push({ field: 'person_source', code: 'PERSON_SOURCE_INVALID', message: 'person_source must be PERSON_STUDENT, PERSON_STAFF, or manual.' });
  }
  if (!normalized.full_name_snapshot) errors.push({ field: 'full_name_snapshot', code: 'FULL_NAME_REQUIRED', message: 'full_name_snapshot is required.' });

  return {
    success: errors.length === 0,
    error: errors.length ? 'Mobility participant payload validation failed.' : '',
    data: {
      valid: errors.length === 0,
      errors: errors,
      mobility_id: normalized.mobility_id,
      participant_type: normalized.participant_type,
      person_source: normalized.person_source,
      person_id: normalized.person_id,
      full_name_snapshot: normalized.full_name_snapshot,
      gender_snapshot: normalized.gender_snapshot,
      unit_id_snapshot: normalized.unit_id_snapshot,
      program_or_position_snapshot: normalized.program_or_position_snapshot,
      role: normalized.role
    }
  };
}

function normalizeV2TravelParticipantPayload_(payload) {
  const source = payload || {};
  const errors = [];
  const personSource = normalizeV2TravelPersonSource_(source.person_source);
  const normalized = {
    travel_id: cleanV2EventText_(source.travel_id || ''),
    person_source: personSource,
    person_id: cleanV2EventText_(source.person_id || ''),
    full_name_snapshot: cleanV2EventText_(source.full_name_snapshot || ''),
    unit_id_snapshot: cleanV2EventText_(source.unit_id_snapshot || ''),
    position_snapshot: cleanV2EventText_(source.position_snapshot || ''),
    role: cleanV2EventText_(source.role || '')
  };

  if (source.payload_parse_error) errors.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  if (!normalized.travel_id) errors.push({ field: 'travel_id', code: 'TRAVEL_ID_REQUIRED', message: 'travel_id is required.' });
  if (!normalized.person_source) errors.push({ field: 'person_source', code: 'PERSON_SOURCE_REQUIRED', message: 'person_source is required.' });
  if (personSource && ['PERSON_STAFF', 'manual'].indexOf(personSource) < 0) {
    errors.push({ field: 'person_source', code: 'PERSON_SOURCE_INVALID', message: 'person_source must be PERSON_STAFF or manual.' });
  }
  if (!normalized.full_name_snapshot) errors.push({ field: 'full_name_snapshot', code: 'FULL_NAME_REQUIRED', message: 'full_name_snapshot is required.' });

  return {
    success: errors.length === 0,
    error: errors.length ? 'Travel participant payload validation failed.' : '',
    data: {
      valid: errors.length === 0,
      errors: errors,
      travel_id: normalized.travel_id,
      person_source: normalized.person_source,
      person_id: normalized.person_id,
      full_name_snapshot: normalized.full_name_snapshot,
      unit_id_snapshot: normalized.unit_id_snapshot,
      position_snapshot: normalized.position_snapshot,
      role: normalized.role
    }
  };
}

function normalizeV2PersonWritePayload_(payload) {
  const source = payload || {};
  const errors = [];
  const type = String(source.person_type || source.type || source.participant_type || '').trim().toLowerCase();
  const prefixTh = cleanV2EventText_(source.prefix_th || source.prefix || '');
  const firstNameTh = cleanV2EventText_(source.first_name_th || '');
  const lastNameTh = cleanV2EventText_(source.last_name_th || '');
  const fullNameTh = cleanV2EventText_(source.full_name_th || [prefixTh + firstNameTh, lastNameTh].filter(function (value) { return !!value; }).join(' '));
  const unitId = cleanV2EventText_(source.unit_id || source.unit_id_snapshot || '');

  if (source.payload_parse_error) errors.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  if (['student', 'staff'].indexOf(type) < 0) {
    errors.push({ field: 'person_type', code: 'PERSON_TYPE_INVALID', message: 'person_type must be student or staff.' });
  }
  if (!fullNameTh) errors.push({ field: 'full_name_th', code: 'FULL_NAME_REQUIRED', message: 'full_name_th is required.' });

  let person = null;
  if (type === 'student') {
    const studentId = cleanV2EventText_(source.student_id || source.person_id || '');
    if (!studentId) errors.push({ field: 'student_id', code: 'STUDENT_ID_REQUIRED', message: 'student_id is required for student records.' });
    person = {
      student_id: studentId,
      prefix_th: prefixTh,
      first_name_th: firstNameTh,
      last_name_th: lastNameTh,
      full_name_th: fullNameTh,
      gender: cleanV2EventText_(source.gender || ''),
      unit_id: unitId,
      program_th: cleanV2EventText_(source.program_th || source.program_or_position || ''),
      degree_level: cleanV2EventText_(source.degree_level || ''),
      student_status: cleanV2EventText_(source.student_status || 'active')
    };
  }

  if (type === 'staff') {
    const firstNameEn = cleanV2EventText_(source.first_name_en || '');
    const lastNameEn = cleanV2EventText_(source.last_name_en || '');
    const fullNameEn = cleanV2EventText_(source.full_name_en || [firstNameEn, lastNameEn].filter(function (value) { return !!value; }).join(' '));
    person = {
      staff_id: cleanV2EventText_(source.staff_id || source.person_id || '') || generateV2Id_(IROUP_V2_ID_PREFIXES.PERSON_STAFF || 'STF'),
      prefix_th: prefixTh,
      first_name_th: firstNameTh,
      last_name_th: lastNameTh,
      full_name_th: fullNameTh,
      first_name_en: firstNameEn,
      last_name_en: lastNameEn,
      full_name_en: fullNameEn,
      gender: cleanV2EventText_(source.gender || ''),
      unit_id: unitId,
      position: cleanV2EventText_(source.position || source.program_or_position || ''),
      staff_type: normalizeV2StaffType_(source.staff_type || '')
    };
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'Person payload validation failed.' : '',
    data: {
      valid: errors.length === 0,
      errors: errors,
      person_type: type,
      person: person
    }
  };
}

function normalizeV2StaffType_(value) {
  const raw = String(value || '').trim();
  const lower = raw.toLowerCase();
  if (lower === 'academic' || raw === 'วิชาการ') return 'academic';
  if (lower === 'support' || raw === 'สนับสนุน') return 'support';
  return raw;
}

function normalizeV2TravelBudgetPayload_(payload) {
  const source = payload || {};
  const errors = [];
  const isInternalProvided = source.is_internal !== undefined && source.is_internal !== null && String(source.is_internal).trim() !== '';
  const isInternal = isTruthyV2_(source.is_internal);
  const currency = cleanV2EventText_(source.currency || 'THB') || 'THB';
  const exchangeRate = currency === 'THB' ? 1 : toNumberV2_(source.exchange_rate || 1) || 1;
  const amount = toNumberV2_(source.amount);
  const normalized = {
    travel_id: cleanV2EventText_(source.travel_id || source.record_id || ''),
    is_internal: isInternal,
    budget_source_type: cleanV2EventText_(source.budget_source_type || ''),
    amount: amount,
    currency: currency,
    exchange_rate: exchangeRate,
    amount_thb: currency === 'THB' ? amount : amount * exchangeRate
  };

  if (source.payload_parse_error) errors.push({ field: 'payload', code: 'PAYLOAD_PARSE_ERROR', message: source.payload_parse_error });
  if (!normalized.travel_id) errors.push({ field: 'travel_id', code: 'TRAVEL_ID_REQUIRED', message: 'travel_id is required.' });
  if (!isInternalProvided) errors.push({ field: 'is_internal', code: 'IS_INTERNAL_REQUIRED', message: 'is_internal is required.' });
  if (isInternal && !normalized.budget_source_type) {
    errors.push({ field: 'budget_source_type', code: 'BUDGET_SOURCE_TYPE_REQUIRED', message: 'budget_source_type is required when is_internal is true.' });
  }
  if (isInternal && amount <= 0) {
    errors.push({ field: 'amount', code: 'AMOUNT_REQUIRED', message: 'amount is required when is_internal is true.' });
  }

  return {
    success: errors.length === 0,
    error: errors.length ? 'Travel budget payload validation failed.' : '',
    data: {
      valid: errors.length === 0,
      errors: errors,
      travel_id: normalized.travel_id,
      is_internal: normalized.is_internal,
      budget_source_type: normalized.budget_source_type,
      amount: normalized.amount,
      currency: normalized.currency,
      exchange_rate: normalized.exchange_rate,
      amount_thb: normalized.amount_thb
    }
  };
}

function normalizeV2MobilityParticipantType_(value) {
  const text = cleanV2EventText_(value).toLowerCase();
  if (text === 'student') return 'student';
  if (text === 'staff') return 'staff';
  if (text === 'manual' || text === 'person_manual') return 'manual';
  return text;
}

function normalizeV2MobilityPersonSource_(value) {
  const text = cleanV2EventText_(value);
  const lower = text.toLowerCase();
  if (lower === 'person_student' || lower === 'student') return 'PERSON_STUDENT';
  if (lower === 'person_staff' || lower === 'staff') return 'PERSON_STAFF';
  if (lower === 'manual' || lower === 'person_manual') return 'manual';
  return text;
}

function normalizeV2TravelPersonSource_(value) {
  const text = cleanV2EventText_(value);
  const lower = text.toLowerCase();
  if (lower === 'person_staff' || lower === 'staff') return 'PERSON_STAFF';
  if (lower === 'manual' || lower === 'person_manual') return 'manual';
  return text;
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
    content_th: cleanV2EventText_(source.content_th || ''),
    content_en: cleanV2EventText_(source.content_en || ''),
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

function resolveV2MOUUnitRef_(source, ctx, warnings) {
  const unitId = cleanV2EventText_(pickV2EventValue_(source, ['up_unit_id', 'unit_id', 'unitId']));
  const display = cleanV2EventText_(pickV2EventValue_(source, ['up_unit', 'unit', 'department', 'dept']));
  if (unitId && ctx.unitsById[unitId]) {
    return { unit_id: unitId, display: display };
  }
  if (unitId) {
    warnings.push({ field: 'up_unit_id', code: 'UNIT_ID_NOT_FOUND', message: 'up_unit_id was not found in UP_UNIT_MASTER.' });
    return { unit_id: unitId, display: display };
  }
  if (!display) return { unit_id: '', display: '' };

  const found = findV2UnitByDisplay_(ctx, display);
  if (found) return { unit_id: found.unit_id || '', display: display };

  warnings.push({ field: 'up_unit', code: 'UNIT_DISPLAY_UNRESOLVED', message: 'up_unit display fallback could not be resolved to up_unit_id.' });
  return { unit_id: '', display: display };
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

function getV2NewsSheetHeaders_() {
  return [
    'news_id',
    'title_th',
    'title_en',
    'content_th',
    'content_en',
    'publish_date',
    'category',
    'sdg_tags',
    'credit',
    'link_url',
    'public_visible',
    'is_deleted',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at'
  ];
}

function mapV2AdminNewsDto_(row) {
  const source = row || {};
  const dto = {};
  getV2NewsSheetHeaders_().forEach(function (field) {
    dto[field] = source[field] !== undefined && source[field] !== null ? source[field] : '';
  });
  dto.public_visible = isTruthyV2_(source.public_visible);
  dto.is_deleted = isSoftDeletedV2_(source);
  return dto;
}

function findV2RelationRows_(ctx, sheetName, module, recordId) {
  const rows = ctx.tables[sheetName] || [];
  return rows.filter(function (row) {
    return String(row.module || '').trim() === module
      && String(row.record_id || '').trim() === String(recordId || '').trim()
      && !isSoftDeletedV2_(row);
  });
}

function appendV2MobilityParticipantRow_(row) {
  const diagnostics = {
    sheetName: IROUP_V2_SHEETS.MOBILITY_PARTICIPANT,
    idField: 'participant_id',
    idValue: row && row.participant_id ? String(row.participant_id) : '',
    headers: [],
    missingHeaders: [],
    emptyRequiredFields: [],
    rowNumber: 0
  };
  const sheetResult = getV2Sheet_(IROUP_V2_SHEETS.MOBILITY_PARTICIPANT);
  if (!sheetResult.success) {
    return { success: false, data: null, error: sheetResult.error, total: 0, diagnostics: diagnostics };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  diagnostics.headers = headers;
  if (!headers.length) {
    diagnostics.missingHeaders = ['<all>'];
    return { success: false, data: null, error: 'Missing headers in V2 sheet: ' + IROUP_V2_SHEETS.MOBILITY_PARTICIPANT, total: 0, diagnostics: diagnostics };
  }

  const requiredFields = ['participant_id', 'mobility_id', 'participant_type', 'person_source', 'full_name_snapshot', 'is_deleted', 'created_by', 'created_at'];
  requiredFields.forEach(function (field) {
    if (headers.indexOf(field) < 0) {
      diagnostics.missingHeaders.push(field);
      return;
    }
    const value = row[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      diagnostics.emptyRequiredFields.push(field);
    }
  });

  if (diagnostics.missingHeaders.length || diagnostics.emptyRequiredFields.length) {
    return { success: false, data: null, error: 'V2 participant append preflight failed for ' + IROUP_V2_SHEETS.MOBILITY_PARTICIPANT, total: 0, diagnostics: diagnostics };
  }

  const values = headers.map(function (header) {
    return row[header] !== undefined ? row[header] : '';
  });

  try {
    const keyColumnIndex = getV2AppendKeyColumnIndex_(headers, 'participant_id');
    diagnostics.rowNumber = findFirstEmptyRowByKey_(sheet, keyColumnIndex);
    sheet.getRange(diagnostics.rowNumber, 1, 1, headers.length).setValues([values]);
    SpreadsheetApp.flush();
    return { success: true, data: rowToObjectV2_(headers, values), error: '', total: 1, diagnostics: diagnostics };
  } catch (err) {
    return { success: false, data: null, error: String(err && err.message ? err.message : err), total: 0, diagnostics: diagnostics };
  }
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

function findV2TravelBudgetByTravelId_(travelId) {
  const read = readV2Sheet_(IROUP_V2_SHEETS.BUDGET);
  if (!read.success) return null;

  const targetId = String(travelId || '').trim();
  const rows = read.data || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row.module || '').trim() === 'travel'
      && String(row.record_id || '').trim() === targetId
      && !isSoftDeletedV2_(row)) {
      return row;
    }
  }
  return null;
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
    continent: row.continent || '',
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
    content_th: row.content_th || '',
    content_en: row.content_en || '',
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

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE MODULE
// ─────────────────────────────────────────────────────────────────────────────

function ensureV2KnowledgeSheet_() {
  const headers = getV2KnowledgeSheetHeaders_();
  const ss = getV2SS_();
  let sheet = ss.getSheetByName(IROUP_V2_SHEETS.KNOWLEDGE);
  if (!sheet) {
    sheet = ss.insertSheet(IROUP_V2_SHEETS.KNOWLEDGE);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { success: true, data: { created: true, missing_headers_added: headers }, error: '' };
  }

  const existingHeaders = getV2Headers_(sheet);
  if (!existingHeaders.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { success: true, data: { created: false, missing_headers_added: headers }, error: '' };
  }

  const missingHeaders = headers.filter(function (header) {
    return existingHeaders.indexOf(header) < 0;
  });
  if (missingHeaders.length) {
    sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }

  return { success: true, data: { created: false, missing_headers_added: missingHeaders }, error: '' };
}

function getV2KnowledgeSheetHeaders_() {
  return [
    'knowledge_id',
    'title_th',
    'title_en',
    'content_th',
    'content_en',
    'category',
    'video_url',
    'link_url',
    'public_visible',
    'is_deleted',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at'
  ];
}

function mapV2AdminKnowledgeDto_(row) {
  const source = row || {};
  const dto = {};
  getV2KnowledgeSheetHeaders_().forEach(function (field) {
    dto[field] = source[field] !== undefined && source[field] !== null ? source[field] : '';
  });
  dto.public_visible = isTruthyV2_(source.public_visible);
  dto.is_deleted = isSoftDeletedV2_(source);
  return dto;
}

function listV2AdminKnowledge_() {
  const ready = ensureV2KnowledgeSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const read = readV2Sheet_(IROUP_V2_SHEETS.KNOWLEDGE);
  if (!read.success) return adminResponseV2_(false, null, 0, read.error);

  const rows = (read.data || [])
    .filter(function (row) {
      if (!String(row.knowledge_id || '').trim()) return false;
      return !isSoftDeletedV2_(row);
    })
    .map(mapV2AdminKnowledgeDto_);

  return adminResponseV2_(true, rows, rows.length, '');
}

function getV2AdminKnowledge_(requestOrKnowledgeId) {
  const ready = ensureV2KnowledgeSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const knowledgeId = extractV2KnowledgeId_(requestOrKnowledgeId);
  if (!knowledgeId) {
    return adminResponseV2_(false, null, 0, 'knowledge_id is required for knowledge detail.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.KNOWLEDGE, 'knowledge_id', knowledgeId);
  if (!existing.success || !existing.data) {
    return adminResponseV2_(false, {
      knowledge_id: knowledgeId
    }, 0, existing.error || 'Knowledge item not found.');
  }
  if (isSoftDeletedV2_(existing.data)) {
    return adminResponseV2_(false, {
      knowledge_id: knowledgeId
    }, 0, 'Knowledge item is deleted.');
  }

  return adminResponseV2_(true, mapV2AdminKnowledgeDto_(existing.data), 1, '');
}

function createV2AdminKnowledge_(request) {
  return writeV2AdminKnowledgeMetadata_(request, 'create');
}

function updateV2AdminKnowledge_(request) {
  return writeV2AdminKnowledgeMetadata_(request, 'update');
}

function deleteV2AdminKnowledge_(request) {
  const ready = ensureV2KnowledgeSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const flag = getV2KnowledgeWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2KnowledgeWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const knowledgeId = extractV2KnowledgeId_(request);
  if (!knowledgeId) {
    return adminResponseV2_(false, null, 0, 'knowledge_id is required for knowledge delete.');
  }

  const existing = findV2RowById_(IROUP_V2_SHEETS.KNOWLEDGE, 'knowledge_id', knowledgeId);
  if (!existing.success || !existing.data) {
    return adminResponseV2_(false, {
      knowledge_id: knowledgeId
    }, 0, existing.error || 'Knowledge item not found.');
  }

  const persisted = updateV2RowById_(IROUP_V2_SHEETS.KNOWLEDGE, 'knowledge_id', knowledgeId, {
    is_deleted: true,
    updated_by: actor.user.email || '',
    updated_at: new Date().toISOString()
  });
  if (!persisted.success) {
    return adminResponseV2_(false, {
      knowledge_id: knowledgeId,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    knowledge_id: knowledgeId
  }, 1, '');
}

function writeV2AdminKnowledgeMetadata_(request, mode) {
  const ready = ensureV2KnowledgeSheet_();
  if (!ready.success) return adminResponseV2_(false, ready.data || null, 0, ready.error);

  const flag = getV2KnowledgeWriteFeatureFlag_();
  if (!flag.enabled) {
    return adminResponseV2_(false, {
      write_enabled: false,
      feature_flag: flag.property,
      required_value: 'TRUE'
    }, 0, flag.error);
  }

  const actor = authorizeV2KnowledgeWriteActor_(request);
  if (!actor.success) {
    return adminResponseV2_(false, null, 0, actor.error);
  }

  const writeMode = String(mode || '').trim().toLowerCase();
  const payload = extractV2KnowledgeWritePayload_(request);
  const normalized = normalizeV2KnowledgeWritePayload_(payload);
  const errors = [];
  if (writeMode === 'update' && !normalized.knowledge_id) {
    errors.push({ field: 'knowledge_id', code: 'KNOWLEDGE_ID_REQUIRED', message: 'knowledge_id is required for knowledge update.' });
  }
  if (!normalized.title_th) {
    errors.push({ field: 'title_th', code: 'TITLE_TH_REQUIRED', message: 'title_th is required.' });
  }
  if (errors.length) {
    return adminResponseV2_(false, {
      valid: false,
      errors: errors,
      normalized_knowledge: normalized
    }, 0, 'Knowledge payload validation failed.');
  }

  const now = new Date().toISOString();
  const adminEmail = actor.user.email || '';
  let persisted;

  if (writeMode === 'update') {
    const knowledgeId = cleanV2EventText_(normalized.knowledge_id);
    const existing = findV2RowById_(IROUP_V2_SHEETS.KNOWLEDGE, 'knowledge_id', knowledgeId);
    if (!existing.success || !existing.data) {
      return adminResponseV2_(false, {
        knowledge_id: knowledgeId
      }, 0, existing.error || 'Knowledge item not found.');
    }
    if (isSoftDeletedV2_(existing.data)) {
      return adminResponseV2_(false, {
        knowledge_id: knowledgeId
      }, 0, 'Cannot update a deleted knowledge item.');
    }

    const patch = buildV2KnowledgeSheetRow_(normalized);
    delete patch.knowledge_id;
    delete patch.created_by;
    delete patch.created_at;
    patch.updated_by = adminEmail;
    patch.updated_at = now;

    persisted = updateV2RowById_(IROUP_V2_SHEETS.KNOWLEDGE, 'knowledge_id', knowledgeId, patch);
  } else {
    const row = buildV2KnowledgeSheetRow_(normalized);
    row.knowledge_id = generateV2Id_('KNOW');
    row.created_by = adminEmail;
    row.updated_by = adminEmail;
    row.created_at = now;
    row.updated_at = now;

    persisted = appendV2Row_(IROUP_V2_SHEETS.KNOWLEDGE, row, {
      idField: 'knowledge_id',
      requiredFields: ['knowledge_id', 'title_th', 'public_visible', 'is_deleted', 'created_by', 'updated_by', 'created_at', 'updated_at']
    });
  }

  if (!persisted.success) {
    return adminResponseV2_(false, {
      write_enabled: true,
      mode: writeMode,
      diagnostics: persisted.diagnostics || {}
    }, 0, persisted.error);
  }

  return adminResponseV2_(true, {
    success: true,
    write_enabled: true,
    mode: writeMode,
    target_sheet: IROUP_V2_SHEETS.KNOWLEDGE,
    knowledge: mapV2AdminKnowledgeDto_(persisted.data),
    persisted_knowledge: persisted.data,
    actor: {
      email: adminEmail,
      role: actor.user.role || ''
    }
  }, 1, '');
}

function getV2KnowledgeWriteFeatureFlag_() {
  const property = 'IROUP_V2_KNOWLEDGE_WRITE_ENABLED';
  const value = String(PropertiesService.getScriptProperties().getProperty(property) || '').trim().toUpperCase();
  return {
    enabled: value === 'TRUE',
    property: property,
    error: value === 'TRUE' ? '' : 'V2 knowledge metadata writes are disabled. Set ' + property + '=TRUE in the isolated V2 Apps Script project to enable this pilot.'
  };
}

function authorizeV2KnowledgeWriteActor_(request) {
  const user = request && request.user ? request.user : null;
  if (!user || !user.email) {
    return { success: false, user: null, error: 'V2 admin identity is required for knowledge writes.' };
  }

  const role = String(user.role || '').trim().toLowerCase();
  const allowed = ['superadmin', 'super_admin', 'owner', 'admin'];
  if (allowed.indexOf(role) < 0) {
    return { success: false, user: null, error: 'V2 admin role is not allowed for knowledge writes.' };
  }

  return { success: true, user: user, error: '' };
}

function buildV2KnowledgeSheetRow_(normalized) {
  const data = normalized || {};
  return {
    knowledge_id: cleanV2EventText_(data.knowledge_id),
    title_th: cleanV2EventText_(data.title_th),
    title_en: cleanV2EventText_(data.title_en),
    content_th: cleanV2EventText_(data.content_th),
    content_en: cleanV2EventText_(data.content_en),
    category: cleanV2EventText_(data.category),
    video_url: cleanV2EventText_(data.video_url),
    link_url: cleanV2EventText_(data.link_url),
    public_visible: isTruthyV2_(data.public_visible),
    is_deleted: false
  };
}

function normalizeV2KnowledgeWritePayload_(payload) {
  const source = payload || {};
  return {
    knowledge_id: cleanV2EventText_(pickV2EventValue_(source, ['knowledge_id', 'id'])),
    title_th: cleanV2EventText_(source.title_th || ''),
    title_en: cleanV2EventText_(source.title_en || ''),
    content_th: cleanV2EventText_(source.content_th || ''),
    content_en: cleanV2EventText_(source.content_en || ''),
    category: cleanV2EventText_(source.category || ''),
    video_url: cleanV2EventText_(pickV2EventValue_(source, ['video_url', 'videoUrl', 'video'])),
    link_url: cleanV2EventText_(pickV2EventValue_(source, ['link_url', 'linkUrl', 'link'])),
    public_visible: isTruthyV2_(source.public_visible),
    is_deleted: false
  };
}

function extractV2KnowledgeWritePayload_(request) {
  const params = request && request.params ? request.params : {};
  const body = request && request.body ? request.body : {};
  const candidate = body.payload || body.knowledge || params.payload || params.knowledge || null;

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

function extractV2KnowledgeId_(requestOrKnowledgeId) {
  if (!requestOrKnowledgeId || typeof requestOrKnowledgeId !== 'object') {
    return cleanV2EventText_(requestOrKnowledgeId || '');
  }

  const params = requestOrKnowledgeId.params || {};
  const body = requestOrKnowledgeId.body || {};
  const candidate = body.payload || body.knowledge || params.payload || params.knowledge || null;
  if (candidate && typeof candidate === 'object') {
    return cleanV2EventText_(candidate.knowledge_id || candidate.id || candidate.record_id || '');
  }
  if (candidate && typeof candidate === 'string') {
    try {
      const parsed = JSON.parse(candidate);
      return cleanV2EventText_(parsed.knowledge_id || parsed.id || parsed.record_id || '');
    } catch (err) {
      return cleanV2EventText_(params.knowledge_id || params.id || params.record_id || '');
    }
  }
  return cleanV2EventText_(body.knowledge_id || params.knowledge_id || body.id || params.id || body.record_id || params.record_id || '');
}
