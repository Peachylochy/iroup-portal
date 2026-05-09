/* iROUP reusable selector helpers.
   Provides searchable datalist/select hydration from live rows plus stable local fallbacks. */
var IRSelectors = (function () {
  'use strict';

  var UP_UNITS = [
    'สำนักงานวิเทศสัมพันธ์',
    'สำนักงานวิเทศฯ',
    'คณะวิทยาศาสตร์',
    'คณะแพทยศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'วิทยาลัยการศึกษา',
    'คณะพยาบาลศาสตร์',
    'คณะเภสัชศาสตร์',
    'คณะสาธารณสุขศาสตร์',
    'คณะเทคโนโลยีสารสนเทศและการสื่อสาร',
    'คณะบริหารธุรกิจและนิเทศศาสตร์',
    'คณะนิติศาสตร์',
    'คณะรัฐศาสตร์และสังคมศาสตร์',
    'คณะศิลปศาสตร์',
    'คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์',
    'คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ',
    'คณะพลังงานและสิ่งแวดล้อม',
    'วิทยาลัยการจัดการ',
    'วิทยาลัยนานาชาติ'
  ];

  function esc(value) {
    if (window.IU && IU.esc) return IU.esc(value);
    return String(value || '').replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }

  function pick(row, keys) {
    for (var i = 0; i < keys.length; i++) {
      var value = row && row[keys[i]];
      if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
    }
    return '';
  }

  function unique(values) {
    var seen = {};
    return values.map(function (v) { return String(v || '').trim(); })
      .filter(Boolean)
      .filter(function (v) {
        var key = v.toLowerCase();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      })
      .sort(function (a, b) { return a.localeCompare(b, 'th'); });
  }

  function countryOptions(countryRows, mobilityRows) {
    var values = [];
    (countryRows || []).forEach(function (row) {
      values.push(pick(row, ['en_name', 'country', 'ประเทศ']));
      values.push(pick(row, ['th_name', 'ประเทศ']));
      values.push(pick(row, ['code']));
    });
    (mobilityRows || []).forEach(function (row) {
      values.push(pick(row, ['ประเทศ', 'country']));
    });
    return unique(values);
  }

  function unitOptions(rows) {
    var values = UP_UNITS.slice();
    (rows || []).forEach(function (row) {
      values.push(pick(row, ['หน่วยงาน_UP', 'หน่วยงาน', 'คณะ', 'up_unit', 'faculty']));
    });
    return unique(values);
  }

  function setDatalist(id, values) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = unique(values).map(function (value) {
      return '<option value="' + esc(value) + '"></option>';
    }).join('');
  }

  function setSelect(id, values, allLabel) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">' + esc(allLabel || 'ทั้งหมด') + '</option>' +
      unique(values).map(function (value) {
        return '<option value="' + esc(value) + '">' + esc(value) + '</option>';
      }).join('');
  }

  return {
    UP_UNITS: UP_UNITS,
    pick: pick,
    unique: unique,
    countryOptions: countryOptions,
    unitOptions: unitOptions,
    setDatalist: setDatalist,
    setSelect: setSelect
  };
})();
