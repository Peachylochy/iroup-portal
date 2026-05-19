/**
 * UP_UNIT_MASTER seed/repair for V2.
 *
 * Source: Official bilingual unit list, University of Phayao.
 *
 * Run upsertV2UPUnitMaster() once before entering real unit-linked data.
 * Safe to re-run — existing rows are updated in place by unit_id.
 */

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const IROUP_V2_UP_UNIT_DATA = [

  {
    unit_id: 'UPUNIT-UP',
    unit_code: 'UP',
    unit_name_th: 'มหาวิทยาลัยพะเยา',
    unit_name_en: 'University of Phayao',
    unit_type: 'มหาวิทยาลัย',
    parent_unit_id: '',
    active: true,
    sort_order: 1
  },

  // ── คณะ / วิทยาลัย / วิทยาเขต / โรงเรียน ──────────────────────────────

  {
    unit_id: 'UPUNIT-AGRI',
    unit_code: 'AGRI',
    unit_name_th: 'คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ',
    unit_name_en: 'School of Agriculture and Natural Resources',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 10
  },
  {
    unit_id: 'UPUNIT-ICT',
    unit_code: 'ICT',
    unit_name_th: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร',
    unit_name_en: 'School of Information and Communication Technology',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 20
  },
  {
    unit_id: 'UPUNIT-NUR',
    unit_code: 'NUR',
    unit_name_th: 'คณะพยาบาลศาสตร์',
    unit_name_en: 'School of Nursing',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 30
  },
  {
    unit_id: 'UPUNIT-PHARM',
    unit_code: 'PHARM',
    unit_name_th: 'คณะเภสัชศาสตร์',
    unit_name_en: 'School of Pharmaceutical Sciences',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 40
  },
  {
    unit_id: 'UPUNIT-SCI',
    unit_code: 'SCI',
    unit_name_th: 'คณะวิทยาศาสตร์',
    unit_name_en: 'School of Science',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 50
  },
  {
    unit_id: 'UPUNIT-ENG',
    unit_code: 'ENG',
    unit_name_th: 'คณะวิศวกรรมศาสตร์',
    unit_name_en: 'School of Engineering',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 60
  },
  {
    unit_id: 'UPUNIT-SAFA',
    unit_code: 'SAFA',
    unit_name_th: 'คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์',
    unit_name_en: 'School of Architecture and Fine Arts',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 70
  },
  {
    unit_id: 'UPUNIT-DENT',
    unit_code: 'DENT',
    unit_name_th: 'คณะทันตแพทยศาสตร์',
    unit_name_en: 'School of Dentistry',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 80
  },
  {
    unit_id: 'UPUNIT-LAW',
    unit_code: 'LAW',
    unit_name_th: 'คณะนิติศาสตร์',
    unit_name_en: 'School of Law',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 90
  },
  {
    unit_id: 'UPUNIT-MED',
    unit_code: 'MED',
    unit_name_th: 'คณะแพทยศาสตร์',
    unit_name_en: 'School of Medicine',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 100
  },
  {
    unit_id: 'UPUNIT-POLSOC',
    unit_code: 'POLSOC',
    unit_name_th: 'คณะรัฐศาสตร์และสังคมศาสตร์',
    unit_name_en: 'School of Political and Social Science',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 110
  },
  {
    unit_id: 'UPUNIT-BCA',
    unit_code: 'BCA',
    unit_name_th: 'คณะบริหารธุรกิจและนิเทศศาสตร์',
    unit_name_en: 'School of Business and Communication Arts',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 120
  },
  {
    unit_id: 'UPUNIT-MSCI',
    unit_code: 'MSCI',
    unit_name_th: 'คณะวิทยาศาสตร์การแพทย์',
    unit_name_en: 'School of Medical Sciences',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 130
  },
  {
    unit_id: 'UPUNIT-LA',
    unit_code: 'LA',
    unit_name_th: 'คณะศิลปศาสตร์',
    unit_name_en: 'School of Liberal Arts',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 140
  },
  {
    unit_id: 'UPUNIT-AHS',
    unit_code: 'AHS',
    unit_name_th: 'คณะสหเวชศาสตร์',
    unit_name_en: 'School of Allied Health Sciences',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 150
  },
  {
    unit_id: 'UPUNIT-ENE',
    unit_code: 'ENE',
    unit_name_th: 'คณะพลังงานและสิ่งแวดล้อม',
    unit_name_en: 'School of Energy and Environment',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 160
  },
  {
    unit_id: 'UPUNIT-PH',
    unit_code: 'PH',
    unit_name_th: 'คณะสาธารณสุขศาสตร์',
    unit_name_en: 'School of Public Health',
    unit_type: 'คณะ',
    parent_unit_id: '',
    active: true,
    sort_order: 170
  },
  {
    unit_id: 'UPUNIT-EDU',
    unit_code: 'EDU',
    unit_name_th: 'วิทยาลัยการศึกษา',
    unit_name_en: 'School of Education',
    unit_type: 'วิทยาลัย',
    parent_unit_id: '',
    active: true,
    sort_order: 180
  },
  {
    unit_id: 'UPUNIT-CMUP',
    unit_code: 'CMUP',
    unit_name_th: 'วิทยาลัยการจัดการ',
    unit_name_en: 'College of Management, University of Phayao',
    unit_type: 'วิทยาลัย',
    parent_unit_id: '',
    active: true,
    sort_order: 190
  },
  {
    unit_id: 'UPUNIT-UPCR',
    unit_code: 'UPCR',
    unit_name_th: 'มหาวิทยาลัยพะเยา วิทยาเขตเชียงราย',
    unit_name_en: 'University of Phayao, Chiang Rai Campus',
    unit_type: 'วิทยาเขต',
    parent_unit_id: '',
    active: true,
    sort_order: 200
  },
  {
    unit_id: 'UPUNIT-DEMO',
    unit_code: 'DEMO',
    unit_name_th: 'โรงเรียนสาธิตมหาวิทยาลัยพะเยา',
    unit_name_en: 'Demonstration School, University of Phayao',
    unit_type: 'โรงเรียน',
    parent_unit_id: '',
    active: true,
    sort_order: 210
  },

  // ── กอง / ศูนย์ / สำนักงาน / สถาบัน ────────────────────────────────────

  {
    unit_id: 'UPUNIT-USC',
    unit_code: 'USC',
    unit_name_th: 'สำนักงานสภา มหาวิทยาลัยพะเยา',
    unit_name_en: 'Office of University of Phayao Council',
    unit_type: 'สำนักงาน',
    parent_unit_id: '',
    active: true,
    sort_order: 220
  },
  {
    unit_id: 'UPUNIT-STC',
    unit_code: 'STC',
    unit_name_th: 'สภาพนักงาน มหาวิทยาลัยพะเยา',
    unit_name_en: 'University of Phayao Staff Council',
    unit_type: 'สภา',
    parent_unit_id: '',
    active: true,
    sort_order: 230
  },
  {
    unit_id: 'UPUNIT-OPR',
    unit_code: 'OPR',
    unit_name_th: 'สำนักงานอธิการบดี มหาวิทยาลัยพะเยา',
    unit_name_en: 'Office of The President, University of Phayao',
    unit_type: 'สำนักงาน',
    parent_unit_id: '',
    active: true,
    sort_order: 240
  },
  {
    unit_id: 'UPUNIT-DGA',
    unit_code: 'DGA',
    unit_name_th: 'กองกลาง',
    unit_name_en: 'Division of General Affairs',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 250
  },
  {
    unit_id: 'UPUNIT-DSA',
    unit_code: 'DSA',
    unit_name_th: 'กองกิจการนิสิต',
    unit_name_en: 'Division of Student Affairs',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 260
  },
  {
    unit_id: 'UPUNIT-DP',
    unit_code: 'DP',
    unit_name_th: 'กองการเจ้าหน้าที่',
    unit_name_en: 'Division of Personnel',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 270
  },
  {
    unit_id: 'UPUNIT-DFI',
    unit_code: 'DFI',
    unit_name_th: 'กองคลัง',
    unit_name_en: 'Division of Finance and Inventory',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 280
  },
  {
    unit_id: 'UPUNIT-DOES',
    unit_code: 'DOES',
    unit_name_th: 'กองบริการการศึกษา',
    unit_name_en: 'Division of Educational Services',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 290
  },
  {
    unit_id: 'UPUNIT-DPL',
    unit_code: 'DPL',
    unit_name_th: 'กองแผนงาน',
    unit_name_en: 'Division of Planning',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 300
  },
  {
    unit_id: 'UPUNIT-DSQD',
    unit_code: 'DSQD',
    unit_name_th: 'กองพัฒนาคุณภาพนิสิตและนิสิตพิการ',
    unit_name_en: 'Division of Student Quality Development and Students with Disabilities',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 310
  },
  {
    unit_id: 'UPUNIT-DRA',
    unit_code: 'DRA',
    unit_name_th: 'กองบริหารงานวิจัย',
    unit_name_en: 'Division of Research Administration',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 320
  },
  {
    unit_id: 'UPUNIT-DBF',
    unit_code: 'DBF',
    unit_name_th: 'กองอาคารและสถานที่',
    unit_name_en: 'Division of Building and Facilities',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 330
  },
  {
    unit_id: 'UPUNIT-DL',
    unit_code: 'DL',
    unit_name_th: 'กองกฎหมาย',
    unit_name_en: 'Division of Legal',
    unit_type: 'กอง',
    parent_unit_id: '',
    active: true,
    sort_order: 340
  },
  {
    unit_id: 'UPUNIT-LIB',
    unit_code: 'LIB',
    unit_name_th: 'ศูนย์บรรณสารและการเรียนรู้ มหาวิทยาลัยพะเยา',
    unit_name_en: 'Library Resources and Educational Media Center, University of Phayao',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 350
  },
  {
    unit_id: 'UPUNIT-UPH',
    unit_code: 'UPH',
    unit_name_th: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
    unit_name_en: 'University of Phayao Hospital',
    unit_type: 'โรงพยาบาล',
    parent_unit_id: '',
    active: true,
    sort_order: 360
  },
  {
    unit_id: 'UPUNIT-UPLC',
    unit_code: 'UPLC',
    unit_name_th: 'ศูนย์ภาษา คณะศิลปศาสตร์ มหาวิทยาลัยพะเยา',
    unit_name_en: 'UP Language Centre',
    unit_type: 'ศูนย์',
    parent_unit_id: 'UPUNIT-LA',
    active: true,
    sort_order: 370
  },
  {
    unit_id: 'UPUNIT-ABCC',
    unit_code: 'ABCC',
    unit_name_th: 'ศูนย์เครือข่ายความร่วมมือเพื่อการพัฒนาเชิงพื้นที่แบบสร้างสรรค์',
    unit_name_en: 'Area-Based Development Creative Collaborative Center (AB-Creative Center)',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 380
  },
  {
    unit_id: 'UPUNIT-CITCS',
    unit_code: 'CITCS',
    unit_name_th: 'ศูนย์บริการเทคโนโลยีสารสนเทศและการสื่อสาร มหาวิทยาลัยพะเยา',
    unit_name_en: 'Center for Information Technology and Communication Services',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 390
  },
  {
    unit_id: 'UPUNIT-DSSC',
    unit_code: 'DSSC',
    unit_name_th: 'ศูนย์บริการและสนับสนุนนิสิตพิการ',
    unit_name_en: 'Disability Support Services Center',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 400
  },
  {
    unit_id: 'UPUNIT-CDC',
    unit_code: 'CDC',
    unit_name_th: 'ศูนย์พัฒนาเด็กเล็ก',
    unit_name_en: 'Child Development Center',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 410
  },
  {
    unit_id: 'UPUNIT-ATDC',
    unit_code: 'ATDC',
    unit_name_th: 'ศูนย์พัฒนาเทคโนโลยียานยนต์',
    unit_name_en: 'Automotive Technology Development Center',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 420
  },
  {
    unit_id: 'UPUNIT-UPBI',
    unit_code: 'UPBI',
    unit_name_th: 'ศูนย์บ่มเพาะวิสาหกิจ',
    unit_name_en: 'University of Phayao Business Incubator (UPBI)',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 430
  },
  {
    unit_id: 'UPUNIT-SEFA',
    unit_code: 'SEFA',
    unit_name_th: 'ศูนย์ศึกษาเศรษฐกิจพอเพียงการเกษตรและความอยู่รอดของมนุษยชาติ',
    unit_name_en: 'Learning Center of Sufficiency Economy for Agriculture and Human Survival',
    unit_type: 'ศูนย์',
    parent_unit_id: '',
    active: true,
    sort_order: 440
  },
  {
    unit_id: 'UPUNIT-IAS',
    unit_code: 'IAS',
    unit_name_th: 'หน่วยตรวจสอบภายใน',
    unit_name_en: 'Internal Audit Section',
    unit_type: 'หน่วย',
    parent_unit_id: '',
    active: true,
    sort_order: 450
  },
  {
    unit_id: 'UPUNIT-RMS',
    unit_code: 'RMS',
    unit_name_th: 'งานสนับสนุนการบริหารความเสี่ยงและความโปร่งใส',
    unit_name_en: 'Risk Management Section',
    unit_type: 'งาน',
    parent_unit_id: '',
    active: true,
    sort_order: 460
  },
  {
    unit_id: 'UPUNIT-UPSP',
    unit_code: 'UPSP',
    unit_name_th: 'อุทยานวิทยาศาสตร์ มหาวิทยาลัยพะเยา',
    unit_name_en: 'University of Phayao Science Park (UPSP)',
    unit_type: 'อุทยาน',
    parent_unit_id: '',
    active: true,
    sort_order: 470
  },
  {
    unit_id: 'UPUNIT-AUD',
    unit_code: 'AUD',
    unit_name_th: 'หอประชุมพญางำเมือง',
    unit_name_en: 'The Phaya Ngam Mueang Auditorium',
    unit_type: 'อื่นๆ',
    parent_unit_id: '',
    active: true,
    sort_order: 480
  },
  {
    unit_id: 'UPUNIT-REK',
    unit_code: 'REK',
    unit_name_th: 'เรือนเอื้องคำ มหาวิทยาลัยพะเยา',
    unit_name_en: 'Reuan Euang Kham',
    unit_type: 'อื่นๆ',
    parent_unit_id: '',
    active: true,
    sort_order: 490
  },
  {
    unit_id: 'UPUNIT-UPITI',
    unit_code: 'UPITI',
    unit_name_th: 'สถาบันนวัตกรรมและถ่ายทอดเทคโนโลยี มหาวิทยาลัยพะเยา',
    unit_name_en: 'UP Innovation and Technology Transfer Institute (UP ITI)',
    unit_type: 'สถาบัน',
    parent_unit_id: '',
    active: true,
    sort_order: 500
  },
  {
    unit_id: 'UPUNIT-UPILI',
    unit_code: 'UPILI',
    unit_name_th: 'สถาบันนวัตกรรมการเรียนรู้',
    unit_name_en: 'Innovative Learning Institute',
    unit_type: 'สถาบัน',
    parent_unit_id: '',
    active: true,
    sort_order: 510
  }

];

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Seed or repair the UP_UNIT_MASTER sheet.
 * Safe to re-run — existing rows are updated in place; new rows are appended.
 *
 * Usage: run this function once from the Apps Script editor.
 */
function upsertV2UPUnitMaster() {
  const result = upsertV2UPUnitMasterRows_(IROUP_V2_UP_UNIT_DATA);
  Logger.log(
    'upsertV2UPUnitMaster — inserted: ' + result.inserted +
    ', updated: ' + result.updated +
    (result.error ? ', ERROR: ' + result.error : '')
  );
  return result;
}

// ---------------------------------------------------------------------------
// Internal upsert
// ---------------------------------------------------------------------------

function upsertV2UPUnitMasterRows_(rows) {
  const sheetResult = getV2Sheet_(IROUP_V2_SHEETS.UP_UNIT_MASTER);
  if (!sheetResult.success) {
    return { success: false, inserted: 0, updated: 0, error: sheetResult.error, data: [] };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf('unit_id');

  const missingHeaders = Object.keys(rows[0] || {}).filter(function (field) {
    return headers.indexOf(field) < 0;
  });

  if (idIndex < 0 || missingHeaders.length) {
    return {
      success: false,
      inserted: 0,
      updated: 0,
      error: 'UP_UNIT_MASTER upsert — sheet headers are missing or mismatched',
      diagnostics: {
        missingIdField: idIndex < 0 ? 'unit_id' : '',
        missingHeaders: missingHeaders,
        sheetHeaders: headers
      },
      data: []
    };
  }

  const values = sheet.getDataRange().getValues();
  const existingById = {};
  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const existingId = String(values[rowIndex][idIndex] || '').trim();
    if (!existingId) continue;
    existingById[existingId] = {
      rowNumber: rowIndex + 1,
      data: rowToObjectV2_(headers, values[rowIndex])
    };
  }

  let inserted = 0;
  let updated = 0;

  rows.forEach(function (row) {
    const id = row.unit_id;
    const existing = existingById[id];
    const merged = existing ? Object.assign({}, existing.data, row) : row;
    const rowValues = headers.map(function (header) {
      return merged[header] !== undefined ? merged[header] : '';
    });

    if (existing) {
      sheet.getRange(existing.rowNumber, 1, 1, headers.length).setValues([rowValues]);
      updated++;
      return;
    }

    const targetRow = findFirstEmptyRowByKey_(sheet, idIndex + 1);
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([rowValues]);
    existingById[id] = { rowNumber: targetRow, data: row };
    inserted++;
  });

  return { success: true, inserted: inserted, updated: updated, error: '', data: [] };
}

// ---------------------------------------------------------------------------
// Unit reference audit/repair
// ---------------------------------------------------------------------------

const IROUP_V2_UNIT_REFERENCE_FIELDS = [
  { sheetName: 'PERSON_STUDENT', idField: 'student_id', unitField: 'unit_id' },
  { sheetName: 'PERSON_STAFF', idField: 'staff_id', unitField: 'unit_id' },
  { sheetName: 'PERSON_MANUAL', idField: 'person_id', unitField: 'unit_id' },
  { sheetName: 'MOU', idField: 'mou_id', unitField: 'up_unit_id' },
  { sheetName: 'MOBILITY_PROJECT', idField: 'mobility_id', unitField: 'up_unit_id' },
  { sheetName: 'MOBILITY_PARTICIPANT', idField: 'participant_id', unitField: 'unit_id_snapshot' },
  { sheetName: 'TRAVEL_PARTICIPANT', idField: 'travel_participant_id', unitField: 'unit_id_snapshot' },
  { sheetName: 'EVENT', idField: 'event_id', unitField: 'organizer_unit_id' },
  { sheetName: 'BUDGET', idField: 'budget_id', unitField: 'budget_source_unit_id' }
];

const IROUP_V2_LEGACY_UP_UNIT_ID_MAP = {
  'TEST-UNIT-IR': 'UPUNIT-UP',
  'UNIT-IR': 'UPUNIT-UP',
  'UNIT-IR-001': 'UPUNIT-UP',
  'TEST-UNIT-SCI': 'UPUNIT-SCI',
  'UNIT-SCI-001': 'UPUNIT-SCI',
  'TEST-UNIT-ENG': 'UPUNIT-ENG',
  'UNIT-ENG-001': 'UPUNIT-ENG',
  'UNIT-MED-001': 'UPUNIT-MED',
  'UNIT-NUR-001': 'UPUNIT-NUR',
  'UNIT-LAW-001': 'UPUNIT-LAW',
  'UNIT-BUS-001': 'UPUNIT-BCA',
  'UNIT-EDU-001': 'UPUNIT-EDU',
  'UNIT-DEN-001': 'UPUNIT-DENT',
  'UNIT-PHA-001': 'UPUNIT-PHARM',
  'UNIT-AGR-001': 'UPUNIT-AGRI',
  'UNIT-ARC-001': 'UPUNIT-SAFA',
  'UNIT-ICT-001': 'UPUNIT-ICT',
  'UNIT-HUM-001': 'UPUNIT-POLSOC',
  'UNIT-REG-001': 'UPUNIT-DOES'
};

function auditV2UPUnitReferences() {
  const validUnits = getV2ActiveUPUnitIdSet_();
  if (!validUnits.success) return validUnits;

  const invalidRefs = [];
  const checked = [];

  IROUP_V2_UNIT_REFERENCE_FIELDS.forEach(function (spec) {
    const sheetResult = getV2Sheet_(spec.sheetName);
    if (!sheetResult.success) {
      checked.push({ sheetName: spec.sheetName, success: false, error: sheetResult.error, checked: 0, invalid: 0 });
      return;
    }

    const sheet = sheetResult.data;
    const headers = getV2Headers_(sheet);
    const idIndex = headers.indexOf(spec.idField);
    const unitIndex = headers.indexOf(spec.unitField);
    if (idIndex < 0 || unitIndex < 0) {
      checked.push({ sheetName: spec.sheetName, success: false, error: 'Missing id/unit field', checked: 0, invalid: 0 });
      return;
    }

    const values = sheet.getDataRange().getValues();
    let checkedRows = 0;
    let invalidRows = 0;
    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      const recordId = String(values[rowIndex][idIndex] || '').trim();
      const unitId = String(values[rowIndex][unitIndex] || '').trim();
      if (!recordId || !unitId) continue;
      checkedRows++;
      if (validUnits.ids[unitId]) continue;
      invalidRows++;
      invalidRefs.push({
        sheetName: spec.sheetName,
        rowNumber: rowIndex + 1,
        idField: spec.idField,
        recordId: recordId,
        unitField: spec.unitField,
        unitId: unitId,
        suggestedUnitId: IROUP_V2_LEGACY_UP_UNIT_ID_MAP[unitId] || ''
      });
    }

    checked.push({ sheetName: spec.sheetName, success: true, checked: checkedRows, invalid: invalidRows });
  });

  Logger.log('[V2 UP UNIT][AUDIT] invalid=' + invalidRefs.length + ' refs=' + JSON.stringify(invalidRefs));
  return {
    success: true,
    invalid: invalidRefs.length,
    checked: checked,
    invalidRefs: invalidRefs,
    error: ''
  };
}

function repairV2LegacyUPUnitReferences() {
  const validUnits = getV2ActiveUPUnitIdSet_();
  if (!validUnits.success) return validUnits;

  const summary = {
    success: true,
    updated: 0,
    unresolved: [],
    skipped: [],
    error: ''
  };

  IROUP_V2_UNIT_REFERENCE_FIELDS.forEach(function (spec) {
    const sheetResult = getV2Sheet_(spec.sheetName);
    if (!sheetResult.success) {
      summary.skipped.push({ sheetName: spec.sheetName, error: sheetResult.error });
      return;
    }

    const sheet = sheetResult.data;
    const headers = getV2Headers_(sheet);
    const idIndex = headers.indexOf(spec.idField);
    const unitIndex = headers.indexOf(spec.unitField);
    if (idIndex < 0 || unitIndex < 0) {
      summary.skipped.push({ sheetName: spec.sheetName, error: 'Missing id/unit field' });
      return;
    }

    const values = sheet.getDataRange().getValues();
    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      const recordId = String(values[rowIndex][idIndex] || '').trim();
      const unitId = String(values[rowIndex][unitIndex] || '').trim();
      if (!recordId || !unitId || validUnits.ids[unitId]) continue;

      const nextUnitId = IROUP_V2_LEGACY_UP_UNIT_ID_MAP[unitId] || '';
      if (!nextUnitId || !validUnits.ids[nextUnitId]) {
        summary.unresolved.push({
          sheetName: spec.sheetName,
          rowNumber: rowIndex + 1,
          idField: spec.idField,
          recordId: recordId,
          unitField: spec.unitField,
          unitId: unitId,
          suggestedUnitId: nextUnitId
        });
        continue;
      }

      sheet.getRange(rowIndex + 1, unitIndex + 1).setValue(nextUnitId);
      summary.updated++;
    }
  });

  SpreadsheetApp.flush();
  Logger.log('[V2 UP UNIT][REPAIR] updated=' + summary.updated + ' unresolved=' + summary.unresolved.length);
  return summary;
}

function getV2ActiveUPUnitIdSet_() {
  const read = readV2Sheet_(IROUP_V2_SHEETS.UP_UNIT_MASTER);
  if (!read.success) {
    return { success: false, ids: {}, error: read.error };
  }

  const ids = {};
  (read.data || []).forEach(function (row) {
    const id = String(row.unit_id || '').trim();
    if (!id) return;
    if (typeof row.active !== 'undefined' && row.active !== '' && !isTruthyV2_(row.active)) return;
    ids[id] = true;
  });

  return { success: true, ids: ids, error: '' };
}
