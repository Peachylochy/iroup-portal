/**
 * Global country master seed/repair for V2.
 *
 * Source basis:
 * - ISO 3166-1 alpha-2 / alpha-3 list, mirrored by RIPE NCC.
 * - Continent grouping uses operational IROUP buckets for filtering/reporting.
 *
 * Run upsertV2GlobalCountryMaster() once before entering real country-linked data.
 */

const IROUP_V2_GLOBAL_COUNTRY_CODES =
  'AF:AFG AX:ALA AL:ALB DZ:DZA AS:ASM AD:AND AO:AGO AI:AIA AQ:ATA AG:ATG AR:ARG AM:ARM AW:ABW AU:AUS AT:AUT AZ:AZE BS:BHS BH:BHR BD:BGD BB:BRB BY:BLR BE:BEL BZ:BLZ BJ:BEN BM:BMU BT:BTN BO:BOL BQ:BES BA:BIH BW:BWA BV:BVT BR:BRA IO:IOT BN:BRN BG:BGR BF:BFA BI:BDI KH:KHM CM:CMR CA:CAN CV:CPV KY:CYM CF:CAF TD:TCD CL:CHL CN:CHN CX:CXR CC:CCK CO:COL KM:COM CG:COG CD:COD CK:COK CR:CRI CI:CIV HR:HRV CU:CUB CW:CUW CY:CYP CZ:CZE DK:DNK DJ:DJI DM:DMA DO:DOM EC:ECU EG:EGY SV:SLV GQ:GNQ ER:ERI EE:EST ET:ETH FK:FLK FO:FRO FJ:FJI FI:FIN FR:FRA GF:GUF PF:PYF TF:ATF GA:GAB GM:GMB GE:GEO DE:DEU GH:GHA GI:GIB GR:GRC GL:GRL GD:GRD GP:GLP GU:GUM GT:GTM GG:GGY GN:GIN GW:GNB GY:GUY HT:HTI HM:HMD VA:VAT HN:HND HK:HKG HU:HUN IS:ISL IN:IND ID:IDN IR:IRN IQ:IRQ IE:IRL IM:IMN IL:ISR IT:ITA JM:JAM JP:JPN JE:JEY JO:JOR KZ:KAZ KE:KEN KI:KIR KP:PRK KR:KOR KW:KWT KG:KGZ LA:LAO LV:LVA LB:LBN LS:LSO LR:LBR LY:LBY LI:LIE LT:LTU LU:LUX MO:MAC MG:MDG MW:MWI MY:MYS MV:MDV ML:MLI MT:MLT MH:MHL MQ:MTQ MR:MRT MU:MUS YT:MYT MX:MEX FM:FSM MD:MDA MC:MCO MN:MNG ME:MNE MS:MSR MA:MAR MZ:MOZ MM:MMR NA:NAM NR:NRU NP:NPL NL:NLD NC:NCL NZ:NZL NI:NIC NE:NER NG:NGA NU:NIU NF:NFK MK:MKD MP:MNP NO:NOR OM:OMN PK:PAK PW:PLW PS:PSE PA:PAN PG:PNG PY:PRY PE:PER PH:PHL PN:PCN PL:POL PT:PRT PR:PRI QA:QAT RE:REU RO:ROU RU:RUS RW:RWA SH:SHN BL:BLM KN:KNA LC:LCA PM:SPM MF:MAF VC:VCT WS:WSM SM:SMR ST:STP SA:SAU SN:SEN RS:SRB SC:SYC SL:SLE SG:SGP SX:SXM SK:SVK SI:SVN SB:SLB SO:SOM ZA:ZAF GS:SGS SS:SSD ES:ESP LK:LKA SD:SDN SR:SUR SJ:SJM SZ:SWZ SE:SWE CH:CHE SY:SYR TW:TWN TJ:TJK TZ:TZA TH:THA TL:TLS TG:TGO TK:TKL TO:TON TT:TTO TN:TUN TR:TUR TM:TKM TC:TCA TV:TUV UG:UGA UA:UKR AE:ARE GB:GBR US:USA UM:UMI UY:URY UZ:UZB VU:VUT VE:VEN VN:VNM VG:VGB VI:VIR WF:WLF EH:ESH YE:YEM ZM:ZMB ZW:ZWE';

const IROUP_V2_GLOBAL_CONTINENT_GROUPS = {
  Africa: 'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU YT MA MZ NA NE NG RE RW SH ST SN SC SL SO ZA SS SD SZ TZ TG TN UG EH ZM ZW',
  Asia: 'AF AM AZ BH BD BT BN KH CN CX CC CY GE HK IN ID IR IQ IL JP JO KZ KP KR KW KG LA LB MO MY MV MN MM NP OM PK PS PH QA SA SG LK SY TW TJ TH TL TR TM AE UZ VN YE',
  Europe: 'AX AL AD AT BY BE BA BG HR CZ DK EE FO FI FR DE GI GR GG VA HU IS IE IM IT JE LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SJ SE CH UA GB',
  'North America': 'AI AG AW BS BB BZ BM BQ CA KY CR CU CW DM DO SV GL GD GP GT HT HN JM MQ MX MS NI PA PR BL KN LC MF PM VC SX TT TC US UM VG VI',
  'South America': 'AR BO BR CL CO EC FK GF GY PY PE SR UY VE',
  Oceania: 'AS AU CK FJ PF GU KI MH FM NR NC NZ NU NF MP PW PG PN WS SB TK TO TV VU WF',
  Antarctica: 'AQ BV GS HM TF IO'
};

const IROUP_V2_GLOBAL_CONTINENT_TH = {
  Africa: 'แอฟริกา',
  Asia: 'เอเชีย',
  Europe: 'ยุโรป',
  'North America': 'อเมริกาเหนือ',
  'South America': 'อเมริกาใต้',
  Oceania: 'โอเชียเนีย',
  Antarctica: 'แอนตาร์กติกา'
};

function upsertV2GlobalCountryMaster() {
  return upsertV2CountryMasterRows_(getV2GlobalCountryMasterRows_());
}

function getV2GlobalCountryMasterRows_() {
  return IROUP_V2_GLOBAL_COUNTRY_CODES.split(/\s+/).filter(Boolean).map(function (pair, index) {
    const parts = pair.split(':');
    const iso2 = parts[0];
    const iso3 = parts[1] || '';
    const continentEn = getV2GlobalCountryContinent_(iso2);
    const countryNameEn = getV2CountryDisplayName_(iso2, 'en');
    const countryNameTh = getV2CountryDisplayName_(iso2, 'th');

    return {
      country_id: 'CTRY-' + iso2,
      iso2: iso2,
      iso3: iso3,
      country_name_en: countryNameEn,
      country_name_th: countryNameTh,
      continent_en: continentEn,
      continent_th: IROUP_V2_GLOBAL_CONTINENT_TH[continentEn] || '',
      flag_emoji: getV2CountryFlagEmoji_(iso2),
      search_alias: [iso2, iso3, countryNameEn, countryNameTh].join(' ').toLowerCase(),
      active: true,
      sort_order: (index + 1) * 10
    };
  });
}

function upsertV2CountryMasterRows_(rows) {
  const sheetResult = getV2Sheet_(IROUP_V2_SHEETS.COUNTRY_MASTER);
  if (!sheetResult.success) {
    return { success: false, inserted: 0, updated: 0, error: sheetResult.error, data: [] };
  }

  const sheet = sheetResult.data;
  const headers = getV2Headers_(sheet);
  const idIndex = headers.indexOf('country_id');
  const missingHeaders = Object.keys(rows[0] || {}).filter(function (field) {
    return headers.indexOf(field) < 0;
  });

  if (idIndex < 0 || missingHeaders.length) {
    return {
      success: false,
      inserted: 0,
      updated: 0,
      error: 'COUNTRY_MASTER global upsert headers are missing',
      diagnostics: {
        missingIdField: idIndex < 0 ? 'country_id' : '',
        missingHeaders: missingHeaders,
        headers: headers
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
    const id = row.country_id;
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

  SpreadsheetApp.flush();
  Logger.log('[V2 COUNTRY MASTER][GLOBAL] inserted=' + inserted + ' updated=' + updated + ' total=' + rows.length);

  return {
    success: true,
    inserted: inserted,
    updated: updated,
    total: rows.length,
    data: rows,
    error: ''
  };
}

function getV2GlobalCountryContinent_(iso2) {
  const code = String(iso2 || '').toUpperCase();
  const names = Object.keys(IROUP_V2_GLOBAL_CONTINENT_GROUPS);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const codes = IROUP_V2_GLOBAL_CONTINENT_GROUPS[name].split(/\s+/);
    if (codes.indexOf(code) >= 0) return name;
  }
  return '';
}

function getV2CountryDisplayName_(iso2, locale) {
  const code = String(iso2 || '').toUpperCase();
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const displayNames = new Intl.DisplayNames([locale || 'en'], { type: 'region' });
      return displayNames.of(code) || code;
    }
  } catch (err) {
    // Fall through to the code fallback if Apps Script Intl data is unavailable.
  }
  return code;
}

function getV2CountryFlagEmoji_(iso2) {
  const code = String(iso2 || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(code.charCodeAt(0) + 127397, code.charCodeAt(1) + 127397);
}
