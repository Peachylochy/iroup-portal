/**
 * Lightweight tests for the isolated V2 router foundation.
 * These functions are intended for Apps Script manual execution before wiring
 * any production doGet/doPost entry point.
 */

function testV2RouterHealth() {
  var response = routeV2Request_({
    parameter: {
      action: 'v2.health'
    }
  });

  return {
    name: 'testV2RouterHealth',
    success: response.success === true && response.meta.action === 'v2.health',
    details: response
  };
}

function testV2RouterSchema() {
  var response = routeV2Request_({
    parameter: {
      action: 'v2.schema'
    }
  });
  var sheets = response.data && response.data.sheets ? response.data.sheets : [];
  var validShape = sheets.length > 0 && sheets.every(function (sheet) {
    return typeof sheet.sheet_name === 'string' &&
      typeof sheet.exists === 'boolean' &&
      Object.prototype.toString.call(sheet.headers) === '[object Array]' &&
      typeof sheet.header_count === 'number' &&
      typeof sheet.last_row === 'number' &&
      typeof sheet.last_column === 'number';
  });

  return {
    name: 'testV2RouterSchema',
    success: response.success === true &&
      response.data &&
      validShape,
    details: response
  };
}

function testV2RouterReadSmoke() {
  var actions = [
    'v2.public.mou.list',
    'v2.public.mou.map',
    'v2.public.stats',
    'v2.public.mobility.list',
    'v2.public.mobility.map',
    'v2.public.mobility.summary',
    'v2.public.travel.list',
    'v2.public.travel.summary',
    'v2.public.scholarship.list',
    'v2.public.event.list',
    'v2.lookup.countries',
    'v2.lookup.units',
    'v2.lookup.fileRoles',
    'v2.lookup.budgetTypes'
  ];
  var tests = [];
  var failed = 0;

  for (var i = 0; i < actions.length; i++) {
    var response = routeV2Request_({
      parameter: {
        action: actions[i]
      }
    });
    var passed = response.success === true && response.meta.action === actions[i];
    if (!passed) {
      failed++;
    }
    tests.push({
      action: actions[i],
      success: passed,
      details: response
    });
  }

  return {
    name: 'testV2RouterReadSmoke',
    success: failed === 0,
    passed: actions.length - failed,
    failed: failed,
    total: actions.length,
    tests: tests
  };
}

function testV2RouterPublicCoverage() {
  return testV2RouterReadSmoke();
}

function testV2AggregateFilteringIgnoresBlankRows() {
  var rows = [
    { mobility_id: 'MOB-1', status: 'active', public_visible: true, is_deleted: false, aggregate_counts: { participant_count_actual: 3 } },
    { mobility_id: '', status: '', public_visible: true, is_deleted: false, aggregate_counts: { participant_count_actual: 999 } },
    { mobility_id: 'MOB-2', status: 'active', public_visible: true, is_deleted: true, aggregate_counts: { participant_count_actual: 7 } },
    { mobility_id: 'MOB-3', status: 'upcoming', public_visible: false, is_deleted: false, aggregate_counts: { participant_count_actual: 2 } }
  ];
  var filtered = filterV2AggregateValidRows_(rows, 'mobility_id');
  var status = countV2AggregateByField_(filtered, 'status');
  var publicVisible = countV2AggregateTruthy_(filtered, 'public_visible');
  var participantTotal = sumV2AggregateNestedNumber_(filtered, ['aggregate_counts', 'participant_count_actual']);

  return {
    name: 'testV2AggregateFilteringIgnoresBlankRows',
    success: filtered.length === 2 &&
      status.active === 1 &&
      status.upcoming === 1 &&
      !status.unknown &&
      publicVisible === 1 &&
      participantTotal === 5,
    details: {
      filtered: filtered,
      status: status,
      public_visible: publicVisible,
      participant_total: participantTotal
    }
  };
}

function testV2RouterAdminTravelList() {
  var response = routeV2Request_({
    parameter: {
      action: 'v2.admin.travel.list'
    }
  });

  return {
    name: 'testV2RouterAdminTravelList',
    success: response.success === true &&
      response.meta.action === 'v2.admin.travel.list' &&
      Object.prototype.toString.call(response.data) === '[object Array]',
    details: response
  };
}

function testV2RouterPublicTravelSummary() {
  var response = routeV2Request_({
    parameter: {
      action: 'v2.public.travel.summary'
    }
  });

  return {
    name: 'testV2RouterPublicTravelSummary',
    success: response.success === true &&
      response.meta.action === 'v2.public.travel.summary' &&
      response.data &&
      typeof response.data.travel_count !== 'undefined' &&
      typeof response.data.participant_count !== 'undefined',
    details: response
  };
}

function testV2PublicTravelFieldSafety() {
  var response = routeV2Request_({
    parameter: {
      action: 'v2.public.travel.summary'
    }
  });
  var json = JSON.stringify(response.data || {});
  var forbidden = [
    'full_name_snapshot',
    'person_id',
    'staff_id',
    'student_id',
    'gender',
    'amount_thb',
    'budget',
    'internal_note',
    'created_by',
    'updated_by',
    'uploaded_by',
    'file_url'
  ];
  var leaks = [];

  for (var i = 0; i < forbidden.length; i++) {
    if (json.indexOf(forbidden[i]) >= 0) {
      leaks.push(forbidden[i]);
    }
  }

  return {
    name: 'testV2PublicTravelFieldSafety',
    success: response.success === true && leaks.length === 0,
    details: {
      leaks: leaks,
      response: response
    }
  };
}
