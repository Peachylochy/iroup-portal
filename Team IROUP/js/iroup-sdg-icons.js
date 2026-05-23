(function() {
  'use strict';

  var COLORS = {
    1: '#E5243B',
    2: '#DDA63A',
    3: '#4C9F38',
    4: '#C5192D',
    5: '#FF3A21',
    6: '#26BDE2',
    7: '#FCC30B',
    8: '#A21942',
    9: '#FD6925',
    10: '#DD1367',
    11: '#FD9D24',
    12: '#BF8B2E',
    13: '#3F7E44',
    14: '#0A97D9',
    15: '#56C02B',
    16: '#00689D',
    17: '#19486A'
  };

  function cleanTag(value) {
    var text = String(value || '').trim().replace(/^SDG[-\s]*/i, '');
    var match = text.match(/\d+/);
    if (!match) return '';
    var number = Number(match[0]);
    return number >= 1 && number <= 17 ? String(number) : '';
  }

  function parseTags(value) {
    if (Array.isArray(value)) return value.map(cleanTag).filter(Boolean);
    return String(value || '').split(/[,|]/).map(cleanTag).filter(Boolean);
  }

  function basePath(options) {
    if (options && options.basePath) return options.basePath.replace(/\/$/, '');
    var path = window.location && window.location.pathname ? window.location.pathname : '';
    return path.indexOf('/public/') >= 0 ? '../assets/sdg' : 'assets/sdg';
  }

  function langKey(lang) {
    return String(lang || document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'th';
  }

  function iconUrl(tag, lang, options) {
    var id = cleanTag(tag);
    if (!id) return '';
    var folder = langKey(lang);
    if (!options || options.size !== 'full') {
      return basePath(options) + '/thumb/' + folder + '/sdg-' + id.padStart(2, '0') + '.webp';
    }
    var file = folder === 'en'
      ? 'E-WEB-Goal-' + id.padStart(2, '0') + '.png'
      : 'SDG-' + id + '.png';
    return basePath(options) + '/' + folder + '/' + file;
  }

  function color(tag) {
    return COLORS[Number(cleanTag(tag))] || '#64748B';
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function renderIcon(tag, options) {
    var id = cleanTag(tag);
    if (!id) return '';
    var opts = options || {};
    var lang = opts.lang || 'th';
    var label = opts.label || ('SDG ' + id);
    var classes = 'sdg-icon-img' + (opts.className ? ' ' + opts.className : '');
    return '<img class="' + esc(classes) + '" src="' + esc(iconUrl(id, lang, opts)) + '" alt="' + esc(label) + '" loading="lazy" decoding="async" width="34" height="34" onerror="this.hidden=true">';
  }

  function renderBadge(tag, options) {
    var id = cleanTag(tag);
    if (!id) return '';
    var opts = options || {};
    var label = opts.label || ('SDG ' + id);
    var image = opts.image === false ? '' : renderIcon(id, opts);
    return '<span class="badge sdg sdg-badge" style="--sdg-color:' + esc(color(id)) + '">' + image + '<span class="sdg-badge-label">' + esc(label) + '</span></span>';
  }

  window.IROUP_SDG_ICONS = {
    colors: COLORS,
    parseTags: parseTags,
    cleanTag: cleanTag,
    iconUrl: iconUrl,
    color: color,
    renderIcon: renderIcon,
    renderBadge: renderBadge
  };
})();
