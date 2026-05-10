/**
 * IROUP Database V2.2 Router/API Endpoint Foundation
 *
 * Isolated router for the normalized V2 backend. This file intentionally does
 * not define doGet/doPost and is not wired to production Code.gs.
 */

function routeV2Request_(e) {
  var request = normalizeV2Request_(e);
  var routes = getV2RouteDispatch_();
  var route = routes[request.action];

  if (!route) {
    return createV2Response_(false, null, 'Unknown V2 action: ' + request.action, {
      action: request.action
    });
  }

  try {
    if (route.access === 'admin') {
      var adminCheck = requireV2Admin_();
      if (!adminCheck.success) {
        return createV2Response_(false, null, adminCheck.error || 'V2 admin authorization failed.', {
          action: request.action
        });
      }
      request.user = adminCheck.user;
    }

    var result = route.handler(request);
    return createV2Response_(
      result && result.success === true,
      result ? result.data : null,
      result && result.error ? result.error : '',
      {
        action: request.action,
        total: getV2ResultTotal_(result)
      }
    );
  } catch (error) {
    return createV2Response_(false, null, error && error.message ? error.message : String(error), {
      action: request.action
    });
  }
}

function normalizeV2Request_(e) {
  var params = {};
  var body = {};
  var action = '';

  if (e && e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (error) {
      body = {};
    }
  }

  if (e && e.parameter) {
    copyV2ObjectFields_(e.parameter, params);
  }

  if (e && !e.parameter && !e.postData) {
    copyV2ObjectFields_(e, params);
  }

  copyV2ObjectFields_(body, params);

  action = normalizeV2Action_(params.action || params.a || (e && e.action) || body.action || 'v2.health');

  return {
    action: action,
    params: params,
    body: body,
    raw: e || null
  };
}

function createV2Response_(success, data, error, meta) {
  var responseMeta = {
    action: meta && meta.action ? meta.action : '',
    api_version: typeof IROUP_V2_SCHEMA_VERSION !== 'undefined' ? IROUP_V2_SCHEMA_VERSION : '2.2',
    timestamp: new Date().toISOString()
  };

  if (meta && typeof meta.total !== 'undefined') {
    responseMeta.total = meta.total;
  }

  return {
    success: success === true,
    data: typeof data === 'undefined' ? null : data,
    error: error || '',
    meta: responseMeta
  };
}

function getV2Health_() {
  try {
    var ss = getV2SS_();
    var sheetNames = getV2SheetNames_();
    var found = 0;

    for (var i = 0; i < sheetNames.length; i++) {
      if (ss.getSheetByName(sheetNames[i])) {
        found++;
      }
    }

    return {
      success: true,
      data: {
        status: found === sheetNames.length ? 'ok' : 'degraded',
        api_version: typeof IROUP_V2_SCHEMA_VERSION !== 'undefined' ? IROUP_V2_SCHEMA_VERSION : '2.2',
        database_name: ss.getName(),
        spreadsheet_id_configured: !!IROUP_V2_SPREADSHEET_ID,
        sheets_expected: sheetNames.length,
        sheets_found: found
      },
      total: 1,
      error: ''
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      total: 0,
      error: error && error.message ? error.message : String(error)
    };
  }
}

function getV2SchemaSummary_() {
  try {
    var sheetNames = getV2SheetNames_();
    var sheets = [];

    for (var i = 0; i < sheetNames.length; i++) {
      var sheetName = sheetNames[i];
      var sheet = getV2Sheet_(sheetName);

      if (!sheet) {
        sheets.push({
          sheet_name: sheetName,
          exists: false,
          headers: [],
          header_count: 0,
          last_row: 0,
          last_column: 0
        });
        continue;
      }

      var headers = getV2Headers_(sheet);
      sheets.push({
        sheet_name: sheetName,
        exists: true,
        headers: headers,
        header_count: headers.length,
        last_row: sheet.getLastRow(),
        last_column: sheet.getLastColumn()
      });
    }

    return {
      success: true,
      data: {
        api_version: typeof IROUP_V2_SCHEMA_VERSION !== 'undefined' ? IROUP_V2_SCHEMA_VERSION : '2.2',
        sheets: sheets
      },
      total: sheets.length,
      error: ''
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      total: 0,
      error: error && error.message ? error.message : String(error)
    };
  }
}

function getV2RouteDispatch_() {
  return {
    'v2.health': {
      access: 'public',
      handler: function () {
        return getV2Health_();
      }
    },
    'v2.schema': {
      access: 'public',
      handler: function () {
        return getV2SchemaSummary_();
      }
    },
    'v2.admin.mou.list': {
      access: 'admin',
      handler: function (request) {
        return listV2AdminMOUs_(getV2IncludeArchived_(request));
      }
    },
    'v2.admin.mobility.list': {
      access: 'admin',
      handler: function (request) {
        return listV2AdminMobilityProjects_(getV2IncludeArchived_(request));
      }
    },
    'v2.admin.travel.list': {
      access: 'admin',
      handler: function (request) {
        return getV2AdminTravelList_(getV2IncludeArchived_(request));
      }
    },
    'v2.admin.scholarship.list': {
      access: 'admin',
      handler: function (request) {
        return listV2AdminScholarships_(getV2IncludeArchived_(request));
      }
    },
    'v2.admin.event.list': {
      access: 'admin',
      handler: function (request) {
        return listV2AdminEvents_(getV2IncludeArchived_(request));
      }
    },
    'v2.public.mou.list': {
      access: 'public',
      handler: function () {
        return listV2PublicMOUs_();
      }
    },
    'v2.public.mobility.summary': {
      access: 'public',
      handler: function () {
        return getV2RouterPublicMobilitySummary_();
      }
    },
    'v2.public.travel.summary': {
      access: 'public',
      handler: function () {
        return getV2PublicTravelSummary_();
      }
    },
    'v2.public.scholarship.list': {
      access: 'public',
      handler: function () {
        return listV2PublicScholarships_();
      }
    },
    'v2.public.event.list': {
      access: 'public',
      handler: function () {
        return listV2PublicEvents_();
      }
    }
  };
}

function getV2RouterPublicMobilitySummary_() {
  var result = listV2PublicMobility_();
  if (!result.success) {
    return result;
  }

  var rows = result.data || [];
  var summary = {
    project_count: rows.length,
    participant_count: 0,
    inbound_project_count: 0,
    outbound_project_count: 0,
    by_country: []
  };
  var countryMap = {};

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var participantCount = toV2Number_(row.participant_count || row.total_participants);
    var countryId = row.country_id || row.country || 'unknown';

    summary.participant_count += participantCount;

    if (row.direction === 'inbound') {
      summary.inbound_project_count++;
    }
    if (row.direction === 'outbound') {
      summary.outbound_project_count++;
    }

    if (!countryMap[countryId]) {
      countryMap[countryId] = {
        country_id: countryId,
        project_count: 0,
        participant_count: 0
      };
    }
    countryMap[countryId].project_count++;
    countryMap[countryId].participant_count += participantCount;
  }

  summary.by_country = mapV2ObjectValues_(countryMap);

  return {
    success: true,
    data: summary,
    total: rows.length,
    error: ''
  };
}

function getV2IncludeArchived_(request) {
  if (!request || !request.params) {
    return false;
  }
  if (typeof isTruthyV2_ === 'function') {
    return isTruthyV2_(request.params.includeArchived || request.params.include_archived);
  }
  return request.params.includeArchived === true ||
    request.params.includeArchived === 'true' ||
    request.params.include_archived === true ||
    request.params.include_archived === 'true';
}

function getV2ResultTotal_(result) {
  if (!result) {
    return 0;
  }
  if (typeof result.total !== 'undefined') {
    return result.total;
  }
  if (result.data && Object.prototype.toString.call(result.data) === '[object Array]') {
    return result.data.length;
  }
  return 1;
}

function getV2SheetNames_() {
  var names = [];
  for (var key in IROUP_V2_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(IROUP_V2_SHEETS, key)) {
      names.push(IROUP_V2_SHEETS[key]);
    }
  }
  return names;
}

function normalizeV2Action_(action) {
  return String(action || 'v2.health').trim().toLowerCase();
}

function copyV2ObjectFields_(source, target) {
  if (!source) {
    return;
  }
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
}

function isArchivedStatusV2_(status) {
  var value = String(status || '').trim().toLowerCase();
  return value === 'cancelled' || value === 'archived';
}

function toV2Number_(value) {
  var numberValue = Number(value);
  return isNaN(numberValue) ? 0 : numberValue;
}

function mapV2ObjectValues_(map) {
  var values = [];
  for (var key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      values.push(map[key]);
    }
  }
  return values;
}
