// ============================================================
// iROUP V2.2 API Adapter
// ============================================================
//
// Safe coexistence layer for gradual V2 frontend migration.
// This file does not replace iroup-config.js and is not loaded by pages yet.

(function (global) {
  'use strict';

  var API_VERSION = '2.2';
  var DEFAULT_TIMEOUT_MS = 30000;
  var ADMIN_SUMMARY_TIMEOUT_MS = 120000;
  var ADMIN_EVENT_WRITE_TIMEOUT_MS = 120000;
  var APPS_SCRIPT_FETCH_DEFAULTS = {
    mode: 'cors',
    redirect: 'follow',
    credentials: 'omit',
    cache: 'no-store',
    referrerPolicy: 'no-referrer'
  };

  var config = {
    SCRIPT_URL: global.IROUP_V2_SCRIPT_URL || ''
  };

  function setScriptUrl(url) {
    config.SCRIPT_URL = String(url || '').trim();
  }

  function getScriptUrl() {
    return config.SCRIPT_URL || global.IROUP_V2_SCRIPT_URL || '';
  }

  function getAdminToken() {
    var directKeys = ['workspace_admin_token', 'iroup_admin_token'];
    for (var i = 0; i < directKeys.length; i++) {
      var direct = safeSessionGet_(directKeys[i]);
      if (direct) return direct;
    }

    var userKeys = ['workspace_user', 'iroup_user'];
    for (var j = 0; j < userKeys.length; j++) {
      var raw = safeSessionGet_(userKeys[j]);
      if (!raw) continue;
      try {
        var user = JSON.parse(raw);
        if (user && user.adminToken) return user.adminToken;
        if (user && user.admin_token) return user.admin_token;
        if (user && user.token) return user.token;
      } catch (error) {
        // Ignore malformed session values and keep looking.
      }
    }

    return '';
  }

  function getGoogleAccessToken() {
    if (global.IROUP && typeof global.IROUP.getGoogleAccessToken === 'function') {
      var fromIroup = global.IROUP.getGoogleAccessToken();
      if (fromIroup) return fromIroup;
    }

    var directKeys = ['workspace_google_access_token', 'iroup_google_access_token'];
    for (var i = 0; i < directKeys.length; i++) {
      var direct = safeSessionGet_(directKeys[i]);
      if (direct) return direct;
    }

    var userKeys = ['workspace_user', 'iroup_user'];
    for (var j = 0; j < userKeys.length; j++) {
      var raw = safeSessionGet_(userKeys[j]);
      if (!raw) continue;
      try {
        var user = JSON.parse(raw);
        if (user && user.googleAccessToken) return user.googleAccessToken;
        if (user && user.google_access_token) return user.google_access_token;
        if (user && user.accessToken) return user.accessToken;
        if (user && user.access_token) return user.access_token;
      } catch (error) {
        // Ignore malformed session values and keep looking.
      }
    }

    return '';
  }

  function getAdminAuthDiagnostics() {
    return {
      hasGoogleAccessToken: !!getGoogleAccessToken(),
      hasLegacyAdminToken: !!getAdminToken()
    };
  }

  function request(action, params, options) {
    var routeAction = String(action || '').trim();
    var requestParams = copyObject_(params || {});
    var requestOptions = options || {};
    var method = String(requestOptions.method || 'GET').toUpperCase();
    var scriptUrl = getScriptUrl();

    if (!routeAction) {
      return Promise.resolve(createClientError_('', 'Missing V2 route action.'));
    }

    if (!scriptUrl) {
      return Promise.resolve(createClientError_(routeAction, 'IROUP_V2 SCRIPT_URL is not configured.'));
    }

    requestParams.action = routeAction;

    if (requestOptions.auth === true || routeAction.indexOf('v2.admin.') === 0) {
      var googleToken = getGoogleAccessToken();
      var token = getAdminToken();
      if (googleToken) {
        requestParams.googleAccessToken = googleToken;
      }
      if (token) {
        requestParams.adminToken = token;
      }
    }

    if (method === 'POST') {
      return postJson_(scriptUrl, routeAction, requestParams, requestOptions);
    }

    return getJson_(scriptUrl, routeAction, requestParams, requestOptions);
  }

  function getJson_(scriptUrl, action, params, options) {
    var url = buildUrl_(scriptUrl, params);
    return fetchWithTimeout_(url, createFetchInit_({
      method: 'GET',
    }), options && options.timeoutMs)
      .then(function (res) { return parseJsonResponse_(res, action); })
      .catch(function (error) { return normalizeError_(error, action); });
  }

  function postJson_(scriptUrl, action, body, options) {
    return fetchWithTimeout_(scriptUrl, createFetchInit_({
      method: 'POST',
      body: JSON.stringify(body || {})
    }), options && options.timeoutMs)
      .then(function (res) { return parseJsonResponse_(res, action); })
      .catch(function (error) { return normalizeError_(error, action); });
  }

  function createFetchInit_(overrides) {
    var init = copyObject_(APPS_SCRIPT_FETCH_DEFAULTS);
    var source = overrides || {};
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        init[key] = source[key];
      }
    }
    return init;
  }

  function fetchWithTimeout_(url, init, timeoutMs) {
    var timeout = Number(timeoutMs || DEFAULT_TIMEOUT_MS);
    if (!timeout || timeout < 0) {
      return fetch(url, init);
    }
    if (!global.AbortController) {
      return fetch(url, init);
    }

    var controller = new AbortController();
    var timer = setTimeout(function () {
      try {
        controller.abort('IROUP_V2_TIMEOUT');
      } catch (error) {
        controller.abort();
      }
    }, timeout);
    var finalInit = copyObject_(init || {});
    finalInit.signal = controller.signal;

    return fetch(url, finalInit).finally(function () {
      clearTimeout(timer);
    });
  }

  function parseJsonResponse_(res, action) {
    if (!res || !res.ok) {
      return Promise.resolve(createClientError_(action, 'V2 request failed with HTTP ' + (res ? res.status : 'unknown') + '.'));
    }

    return res.json()
      .then(function (raw) {
        return normalizeResponse_(raw, action);
      })
      .catch(function (error) {
        return normalizeError_(error, action);
      });
  }

  function normalizeResponse_(raw, action) {
    if (raw && typeof raw.success === 'boolean') {
      return {
        success: raw.success === true,
        data: typeof raw.data === 'undefined' ? null : raw.data,
        error: raw.error || '',
        meta: normalizeMeta_(raw.meta, action)
      };
    }

    return {
      success: true,
      data: typeof raw === 'undefined' ? null : raw,
      error: '',
      meta: normalizeMeta_(null, action)
    };
  }

  function normalizeError_(error, action) {
    if (error && (error.name === 'AbortError' || String(error.message || '').toLowerCase().indexOf('aborted') >= 0)) {
      return createClientError_(action, 'V2 request timed out or was aborted before completion.');
    }

    var message = error && error.message ? error.message : String(error || 'Unknown V2 request error.');
    return createClientError_(action, message);
  }

  function createClientError_(action, message) {
    return {
      success: false,
      data: null,
      error: message || 'V2 request failed.',
      meta: normalizeMeta_(null, action)
    };
  }

  function normalizeMeta_(meta, action) {
    var source = meta || {};
    var normalized = {
      action: source.action || action || '',
      api_version: source.api_version || API_VERSION,
      timestamp: source.timestamp || new Date().toISOString()
    };

    if (typeof source.total !== 'undefined') {
      normalized.total = source.total;
    }

    return normalized;
  }

  function buildUrl_(baseUrl, params) {
    var query = [];
    var data = params || {};
    for (var key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      if (typeof data[key] === 'undefined' || data[key] === null) continue;
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(data[key])));
    }

    if (!query.length) return baseUrl;
    return baseUrl + (baseUrl.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
  }

  function copyObject_(source) {
    var target = {};
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function safeSessionGet_(key) {
    try {
      return global.sessionStorage ? global.sessionStorage.getItem(key) : '';
    } catch (error) {
      return '';
    }
  }

  function withId_(idField, id) {
    var params = {};
    params[idField] = id;
    return params;
  }

  function adminEventWrite_(action, payload) {
    return request(action, { payload: payload || {} }, {
      auth: true,
      method: 'POST',
      timeoutMs: ADMIN_EVENT_WRITE_TIMEOUT_MS
    });
  }

  function adminScholarshipWrite_(action, payload) {
    return request(action, { payload: payload || {} }, {
      auth: true,
      method: 'POST',
      timeoutMs: ADMIN_EVENT_WRITE_TIMEOUT_MS
    });
  }

  var IROUP_V2 = {
    API_VERSION: API_VERSION,
    get SCRIPT_URL() {
      return getScriptUrl();
    },
    set SCRIPT_URL(url) {
      setScriptUrl(url);
    },
    setScriptUrl: setScriptUrl,
    getAdminToken: getAdminToken,
    getGoogleAccessToken: getGoogleAccessToken,
    getAdminAuthDiagnostics: getAdminAuthDiagnostics,
    request: request,

    health: function () {
      return request('v2.health');
    },

    schema: function () {
      return request('v2.schema');
    },

    public: {
      stats: function () {
        return request('v2.public.stats');
      },
      mouList: function () {
        return request('v2.public.mou.list');
      },
      mouMap: function () {
        return request('v2.public.mou.map');
      },
      mobilityList: function () {
        return request('v2.public.mobility.list');
      },
      mobilityMap: function () {
        return request('v2.public.mobility.map');
      },
      mobilitySummary: function () {
        return request('v2.public.mobility.summary');
      },
      travelList: function () {
        return request('v2.public.travel.list');
      },
      travelSummary: function () {
        return request('v2.public.travel.summary');
      },
      scholarshipList: function () {
        return request('v2.public.scholarship.list');
      },
      eventList: function () {
        return request('v2.public.event.list');
      },
      newsList: function () {
        return request('v2.public.news.list');
      },
      knowledgeList: function () {
        return request('v2.public.knowledge.list');
      }
    },

    admin: {
      mouList: function (params) {
        return request('v2.admin.mou.list', params || {}, { auth: true });
      },
      mouDetail: function (mouId) {
        return request('v2.admin.mou.detail', withId_('mou_id', mouId), { auth: true });
      },
      mobilityList: function (params) {
        return request('v2.admin.mobility.list', params || {}, { auth: true });
      },
      mobilityDetail: function (mobilityId) {
        return request('v2.admin.mobility.detail', withId_('mobility_id', mobilityId), { auth: true });
      },
      mobilityBudgetGet: function (mobilityId) {
        return request('v2.admin.mobility.budget.get', withId_('mobility_id', mobilityId), { auth: true });
      },
      mobilityBudgetSave: function (payload) {
        return request('v2.admin.mobility.budget.save', { payload: payload || {} }, {
          auth: true,
          method: 'POST',
          timeoutMs: ADMIN_EVENT_WRITE_TIMEOUT_MS
        });
      },
      travelList: function (params) {
        return request('v2.admin.travel.list', params || {}, { auth: true });
      },
      travelDetail: function (travelId) {
        return request('v2.admin.travel.detail', withId_('travel_id', travelId), { auth: true });
      },
      scholarshipList: function (params) {
        return request('v2.admin.scholarship.list', params || {}, { auth: true });
      },
      scholarshipDetail: function (scholarshipId) {
        return request('v2.admin.scholarship.detail', withId_('scholarship_id', scholarshipId), { auth: true });
      },
      scholarshipCreate: function (payload) {
        return adminScholarshipWrite_('v2.admin.scholarship.create', payload);
      },
      scholarshipUpdate: function (payload) {
        return adminScholarshipWrite_('v2.admin.scholarship.update', payload);
      },
      eventList: function (params) {
        return request('v2.admin.event.list', params || {}, { auth: true });
      },
      eventDetail: function (eventId) {
        return request('v2.admin.event.detail', withId_('event_id', eventId), { auth: true });
      },
      eventValidate: function (payload) {
        return adminEventWrite_('v2.admin.event.validate', payload);
      },
      eventCreateDryRun: function (payload) {
        return adminEventWrite_('v2.admin.event.create.dryRun', payload);
      },
      eventUpdateDryRun: function (payload) {
        return adminEventWrite_('v2.admin.event.update.dryRun', payload);
      },
      eventCreate: function (payload) {
        return adminEventWrite_('v2.admin.event.create', payload);
      },
      eventUpdate: function (payload) {
        return adminEventWrite_('v2.admin.event.update', payload);
      },
      eventDelete: function (eventId) {
        return adminEventWrite_('v2.admin.event.delete', { event_id: eventId });
      },
      fileUpload: function (payload) {
        return request('v2.admin.file.upload', { payload: payload || {} }, {
          auth: true,
          method: 'POST',
          timeoutMs: ADMIN_EVENT_WRITE_TIMEOUT_MS
        });
      },
      dashboardSummary: function () {
        return request('v2.admin.dashboard.summary', {}, { auth: true, timeoutMs: ADMIN_SUMMARY_TIMEOUT_MS });
      },
      reportSummary: function (fiscalYear) {
        return request('v2.admin.report.summary', fiscalYear ? { fiscal_year: fiscalYear } : {}, { auth: true, timeoutMs: ADMIN_SUMMARY_TIMEOUT_MS });
      },
      personSearch: function (params) {
        return request('v2.admin.person.search', params || {}, { auth: true });
      },
      personCreate: function (payload) {
        return request('v2.admin.person.create', { payload: payload || {} }, {
          auth: true,
          method: 'POST',
          timeoutMs: ADMIN_EVENT_WRITE_TIMEOUT_MS
        });
      }
    },

    lookup: {
      countries: function () {
        return request('v2.lookup.countries');
      },
      units: function () {
        return request('v2.lookup.units');
      },
      students: function () {
        return request('v2.lookup.students', {}, { auth: true });
      },
      staff: function () {
        return request('v2.lookup.staff', {}, { auth: true });
      },
      fileRoles: function () {
        return request('v2.lookup.fileRoles');
      },
      budgetTypes: function () {
        return request('v2.lookup.budgetTypes');
      },
      eventTypes: function () {
        return request('v2.lookup.event_types');
      }
    }
  };

  global.IROUP_V2 = IROUP_V2;
})(window);
