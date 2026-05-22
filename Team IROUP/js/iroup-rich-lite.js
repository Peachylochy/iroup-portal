(function() {
  'use strict';

  var STYLE_ID = 'iroup-rich-lite-style';
  var editorMap = new WeakMap();
  var ALLOWED_TAGS = {
    P: true,
    BR: true,
    STRONG: true,
    B: true,
    EM: true,
    I: true,
    U: true,
    UL: true,
    OL: true,
    LI: true,
    H2: true,
    H3: true,
    A: true
  };

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.rich-lite{border:1px solid var(--line,#dce7f2);border-radius:14px;background:#fff;overflow:hidden}',
      '.rich-lite-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;border-bottom:1px solid var(--line,#dce7f2);background:linear-gradient(180deg,#fff,#f8fbff)}',
      '.rich-lite-toolbar button{border:1px solid var(--line,#dce7f2);background:#fff;color:var(--ink,var(--text,#10233f));border-radius:9px;padding:6px 10px;font:inherit;font-weight:700;cursor:pointer;min-height:32px}',
      '.rich-lite-toolbar button:hover{background:var(--soft,#eef7ff);border-color:var(--blue,#1a6db5);color:var(--blue,#1a6db5)}',
      '.rich-lite-editor{min-height:220px;padding:14px 16px;outline:none;line-height:1.75;color:var(--ink,var(--text,#10233f));font-family:"Sarabun","Prompt",sans-serif;background:#fff}',
      '.rich-lite-editor:empty:before{content:attr(data-placeholder);color:var(--muted,#6b7f96)}',
      '.rich-lite-editor h2,.rich-lite-content h2{font-size:1.35rem;margin:1.1em 0 .45em;color:var(--navy,#0f2d5a)}',
      '.rich-lite-editor h3,.rich-lite-content h3{font-size:1.12rem;margin:1em 0 .35em;color:var(--navy,#0f2d5a)}',
      '.rich-lite-editor p,.rich-lite-content p{margin:.55em 0}',
      '.rich-lite-editor ul,.rich-lite-editor ol,.rich-lite-content ul,.rich-lite-content ol{margin:.65em 0 .65em 1.5em;padding:0}',
      '.rich-lite-editor a,.rich-lite-content a{color:var(--blue,#1a6db5);font-weight:700;text-decoration:underline}',
      'textarea[data-rich-lite="true"]{display:none!important}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function isSafeHref(href) {
    var value = String(href || '').trim();
    return /^(https?:|mailto:|tel:)/i.test(value);
  }

  function unwrap(node) {
    var parent = node.parentNode;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
  }

  function sanitizeHtml(value) {
    var template = document.createElement('template');
    template.innerHTML = String(value || '');
    Array.from(template.content.querySelectorAll('*')).forEach(function(node) {
      if (!ALLOWED_TAGS[node.tagName]) {
        unwrap(node);
        return;
      }
      Array.from(node.attributes).forEach(function(attr) {
        var name = attr.name.toLowerCase();
        if (node.tagName === 'A' && name === 'href' && isSafeHref(attr.value)) return;
        node.removeAttribute(attr.name);
      });
      if (node.tagName === 'A') {
        if (!isSafeHref(node.getAttribute('href'))) {
          unwrap(node);
          return;
        }
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
      }
      if (node.tagName === 'B') node.outerHTML = '<strong>' + node.innerHTML + '</strong>';
      if (node.tagName === 'I') node.outerHTML = '<em>' + node.innerHTML + '</em>';
    });
    return template.innerHTML
      .replace(/<p>(\s|&nbsp;|<br>)*<\/p>/gi, '')
      .replace(/\s+$/g, '')
      .trim();
  }

  function htmlToText(value) {
    var box = document.createElement('div');
    box.innerHTML = sanitizeHtml(value);
    return (box.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function runCommand(command, value) {
    document.execCommand(command, false, value || null);
  }

  function setBlock(tag) {
    runCommand('formatBlock', tag);
  }

  function linkSelection() {
    var url = window.prompt('Paste link URL');
    if (!url) return;
    if (!isSafeHref(url)) {
      window.alert('รองรับเฉพาะ http, https, mailto หรือ tel');
      return;
    }
    runCommand('createLink', url);
  }

  function makeButton(label, title, action) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.title = title;
    button.addEventListener('click', function() {
      action();
    });
    return button;
  }

  function makeEditor(textarea) {
    if (!textarea || editorMap.has(textarea)) return;
    injectStyle();

    var wrap = document.createElement('div');
    wrap.className = 'rich-lite';

    var toolbar = document.createElement('div');
    toolbar.className = 'rich-lite-toolbar';

    var editor = document.createElement('div');
    editor.className = 'rich-lite-editor';
    editor.contentEditable = 'true';
    editor.setAttribute('data-placeholder', textarea.getAttribute('placeholder') || 'พิมพ์เนื้อหาและจัดรูปแบบเบื้องต้น');
    editor.innerHTML = sanitizeHtml(textarea.value);

    toolbar.appendChild(makeButton('ย่อหน้า', 'Paragraph', function() { setBlock('p'); editor.focus(); }));
    toolbar.appendChild(makeButton('หัวข้อ', 'Heading', function() { setBlock('h3'); editor.focus(); }));
    toolbar.appendChild(makeButton('B', 'Bold', function() { runCommand('bold'); editor.focus(); }));
    toolbar.appendChild(makeButton('I', 'Italic', function() { runCommand('italic'); editor.focus(); }));
    toolbar.appendChild(makeButton('• List', 'Bullet list', function() { runCommand('insertUnorderedList'); editor.focus(); }));
    toolbar.appendChild(makeButton('1. List', 'Numbered list', function() { runCommand('insertOrderedList'); editor.focus(); }));
    toolbar.appendChild(makeButton('Link', 'Add link', function() { linkSelection(); editor.focus(); }));
    toolbar.appendChild(makeButton('ล้าง', 'Clear format', function() { runCommand('removeFormat'); editor.focus(); }));

    wrap.appendChild(toolbar);
    wrap.appendChild(editor);
    textarea.insertAdjacentElement('afterend', wrap);

    function syncToTextarea() {
      textarea.value = sanitizeHtml(editor.innerHTML);
    }
    function refreshFromTextarea() {
      editor.innerHTML = sanitizeHtml(textarea.value);
    }

    editor.addEventListener('input', syncToTextarea);
    editor.addEventListener('blur', syncToTextarea);
    editor.addEventListener('paste', function(event) {
      event.preventDefault();
      var text = (event.clipboardData || window.clipboardData).getData('text/plain');
      runCommand('insertText', text);
      syncToTextarea();
    });

    editorMap.set(textarea, {
      wrap: wrap,
      editor: editor,
      sync: syncToTextarea,
      refresh: refreshFromTextarea
    });
  }

  function initAll(root) {
    Array.from((root || document).querySelectorAll('textarea[data-rich-lite="true"]')).forEach(makeEditor);
  }

  function syncAll(root) {
    Array.from((root || document).querySelectorAll('textarea[data-rich-lite="true"]')).forEach(function(textarea) {
      var editor = editorMap.get(textarea);
      if (editor) editor.sync();
      else textarea.value = sanitizeHtml(textarea.value);
    });
  }

  function refreshAll(root) {
    Array.from((root || document).querySelectorAll('textarea[data-rich-lite="true"]')).forEach(function(textarea) {
      var editor = editorMap.get(textarea);
      if (editor) editor.refresh();
      else makeEditor(textarea);
    });
  }

  function render(value) {
    var html = sanitizeHtml(value);
    return html ? '<div class="rich-lite-content">' + html + '</div>' : '';
  }

  window.IROUP_RICH_LITE = {
    initAll: initAll,
    syncAll: syncAll,
    refreshAll: refreshAll,
    sanitizeHtml: sanitizeHtml,
    toText: htmlToText,
    render: render
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initAll(document); });
  } else {
    initAll(document);
  }
})();
