/* ============================================================
   iROUP Shared Utilities  —  iroup-utils.js  v1.0
   Single source of truth for all formatting, date, and status
   helpers that were previously copy-pasted across private pages.

   USAGE
   ─────────────────────────────────────────────────────────────
   Add to any page's <head> AFTER iroup-config.js:
     <script src="iroup-utils.js"></script>

   Then call via the IU namespace:
     IU.fmtDate(row['วันที่'])      → "10 ม.ค. 68"
     IU.money(row['งบประมาณ'])      → "150,000"
     IU.statusMou(row)              → "active" | "soon" | "expired"

   MIGRATION STRATEGY
   ─────────────────────────────────────────────────────────────
   Pages keep their local copies of these functions during the
   transition. Once a page loads iroup-utils.js it can call
   IU.fmtDate() alongside the old local fmtDate() — they will
   not conflict. Remove local copies one page at a time after
   verifying IU.* calls work correctly.

   CONTENTS
   ─────────────────────────────────────────────────────────────
    1. HTML escaping
    2. Date parsing + formatting
    3. Number + currency formatting
    4. Array helpers  (group, sum)
    5. Status calculators  (MOU · scholarship · event)
============================================================ */

var IU = (function () {
  'use strict';


  /* ──────────────────────────────────────────────────────────
     1. HTML ESCAPING
  ────────────────────────────────────────────────────────── */

  /**
   * Escape a value for safe HTML insertion.
   * Handles null / undefined gracefully (returns '').
   * Escapes: & < > ' "
   */
  function esc(v) {
    return String(v ?? '').replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }


  /* ──────────────────────────────────────────────────────────
     2. DATE PARSING + FORMATTING
  ────────────────────────────────────────────────────────── */

  /**
   * Parse a date value into a JS Date object.
   * Handles:
   *   - Date instances (returned as-is)
   *   - ISO format:          "2024-03-15"
   *   - Thai/intl formats:   "15/03/2567"  "15-03-2024"  "15.03.67"
   *   - Buddhist Era (BE):   years > 2400 are converted to CE (year − 543)
   *   - Two-digit years:     expanded to 2000+
   *   - Native Date strings: fallback via new Date()
   * Returns null if value is empty or cannot be parsed.
   */
  function toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return v;

    var s = String(v).trim();

    // ISO: yyyy-mm-dd (most reliable — try first)
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);

    // Thai/intl: dd/mm/yyyy  dd-mm-yyyy  dd.mm.yyyy
    m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (m) {
      var y = +m[3];
      if (y > 2400) y -= 543;   // Buddhist Era → Common Era
      if (y < 100)  y += 2000;  // 2-digit year → 4-digit
      return new Date(y, +m[2] - 1, +m[1]);
    }

    // Fallback: let the browser try
    var d = new Date(s);
    return isNaN(d) ? null : d;
  }

  /**
   * Format a date value as a short Thai locale string.
   * Example output: "10 ม.ค. 68"
   * Returns the original value (or '-') if it cannot be parsed.
   */
  function fmtDate(v) {
    var d = toDate(v);
    return d
      ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
      : (v || '-');
  }

  /**
   * Same as fmtDate but uses a 4-digit year.
   * Example output: "10 มกราคม 2568"
   */
  function fmtDateFull(v) {
    var d = toDate(v);
    return d
      ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
      : (v || '-');
  }


  /* ──────────────────────────────────────────────────────────
     3. NUMBER + CURRENCY FORMATTING
  ────────────────────────────────────────────────────────── */

  /**
   * Format a number with Thai locale separators.
   * Example: 12500  →  "12,500"
   */
  function num(v) {
    return Number(v || 0).toLocaleString('th-TH');
  }

  /**
   * Format a monetary value with Thai locale separators.
   * Strips existing commas first so already-formatted strings work.
   * Example: "150000"  →  "150,000"
   * Example: "150,000" →  "150,000"  (safe to call twice)
   * Returns '-' if the value is empty or non-numeric.
   */
  function money(v) {
    var n = parseFloat(String(v || '').replace(/,/g, ''));
    if (isNaN(n)) return v ? String(v) : '-';
    return n.toLocaleString('th-TH', { maximumFractionDigits: 0 });
  }


  /* ──────────────────────────────────────────────────────────
     4. ARRAY HELPERS
  ────────────────────────────────────────────────────────── */

  /**
   * Count occurrences of each value in an array.
   * Empty / whitespace-only values are ignored.
   * Example: group(['A','B','A'])  →  { A: 2, B: 1 }
   */
  function group(arr) {
    var o = {};
    arr
      .map(function (v) { return String(v || '').trim(); })
      .filter(Boolean)
      .forEach(function (v) { o[v] = (o[v] || 0) + 1; });
    return o;
  }

  /**
   * Sum a numeric field across an array of row objects.
   * Strips commas before parsing so formatted numbers work.
   * Example: sum(rows, 'งบประมาณ')  →  450000
   */
  function sum(rows, key) {
    return rows.reduce(function (s, r) {
      return s + (Number(String(r[key] || 0).replace(/,/g, '')) || 0);
    }, 0);
  }


  /* ──────────────────────────────────────────────────────────
     5. STATUS CALCULATORS
     Internal date helpers used only by the status functions.
  ────────────────────────────────────────────────────────── */

  /** Strip time from a Date — returns midnight on the same calendar day. */
  function _startDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /**
   * Days between two Date objects (a − b), rounded up.
   * Positive → a is in the future relative to b.
   * Negative → a is in the past relative to b.
   */
  function _daysBetween(a, b) {
    return Math.ceil((a - b) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate MOU status from a data row.
   * Reads field: 'วันสิ้นสุด'
   *
   * Returns:
   *   'active'   — no end date, or more than 180 days remaining
   *   'soon'     — expiring within 180 days
   *   'expired'  — end date is in the past
   */
  function statusMou(row) {
    var today = _startDay(new Date());
    var end   = toDate(row['วันสิ้นสุด']);
    if (!end) return 'active';
    var d = _daysBetween(end, today);
    if (d < 0)   return 'expired';
    if (d <= 180) return 'soon';
    return 'active';
  }

  /**
   * Calculate scholarship status from a data row.
   * Reads fields: 'วันเปิดรับ', 'วันปิดรับ'
   *
   * Returns:
   *   'upcoming' — opening date is in the future, or dates missing
   *   'active'   — currently open (> 30 days remaining)
   *   'soon'     — closing within 30 days
   *   'urgent'   — closing within 7 days
   *   'expired'  — closing date is in the past
   */
  function statusScholar(row) {
    var today = _startDay(new Date());
    var open  = toDate(row['วันเปิดรับ']);
    var close = toDate(row['วันปิดรับ']);
    if (!open || !close) return 'upcoming';
    if (today < open)    return 'upcoming';
    if (today > close)   return 'expired';
    var d = _daysBetween(close, today);
    if (d <= 7)  return 'urgent';
    if (d <= 30) return 'soon';
    return 'active';
  }

  /**
   * Calculate event status from a data row.
   * Reads fields: 'วันเริ่ม', 'วันสิ้นสุด'
   * If no end date is given, the event is treated as single-day.
   *
   * Returns:
   *   'upcoming' — start date is in the future, or start date missing
   *   'active'   — event is currently in progress
   *   'expired'  — end date (or start date) is in the past
   */
  function statusEvent(row) {
    var today = _startDay(new Date());
    var start = toDate(row['วันเริ่ม']);
    var end   = toDate(row['วันสิ้นสุด']) || start;
    if (!start)        return 'upcoming';
    if (today < start) return 'upcoming';
    if (today > end)   return 'expired';
    return 'active';
  }


  /* ──────────────────────────────────────────────────────────
     PUBLIC API
  ────────────────────────────────────────────────────────── */
  return {
    // Escaping
    esc:          esc,

    // Dates
    toDate:       toDate,
    fmtDate:      fmtDate,
    fmtDateFull:  fmtDateFull,

    // Numbers
    num:          num,
    money:        money,

    // Arrays
    group:        group,
    sum:          sum,

    // Status calculators
    statusMou:    statusMou,
    statusScholar: statusScholar,
    statusEvent:  statusEvent,
  };

})();
