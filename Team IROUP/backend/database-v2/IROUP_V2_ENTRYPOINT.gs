/**
 * IROUP Database V2.2 Web App Entrypoint
 *
 * V2-only Apps Script web app entrypoint. Include this file only in the
 * separate V2 deployment project. Do not copy it into the production V1
 * deployment until V2 routing/cutover is explicitly approved.
 */

function doGet(e) {
  return handleV2WebRequest_(e);
}

function doPost(e) {
  return handleV2WebRequest_(e);
}

function handleV2WebRequest_(e) {
  try {
    return jsonV2_(routeV2Request_(e));
  } catch (error) {
    return jsonV2_(createV2Response_(false, null, error && error.message ? error.message : String(error), {
      action: getV2EntrypointAction_(e)
    }));
  }
}

function jsonV2_(payload) {
  var response = payload || createV2Response_(false, null, 'Empty V2 response payload.', {
    action: ''
  });

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function getV2EntrypointAction_(e) {
  if (e && e.parameter && (e.parameter.action || e.parameter.a)) {
    return e.parameter.action || e.parameter.a;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      return body.action || body.a || '';
    } catch (error) {
      return '';
    }
  }

  return '';
}
