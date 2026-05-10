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

  return {
    name: 'testV2RouterSchema',
    success: response.success === true &&
      response.data &&
      response.data.sheets &&
      response.data.sheets.length > 0,
    details: response
  };
}

function testV2RouterReadSmoke() {
  var actions = [
    'v2.public.mou.list',
    'v2.public.mobility.summary',
    'v2.public.travel.summary',
    'v2.public.scholarship.list',
    'v2.public.event.list'
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
