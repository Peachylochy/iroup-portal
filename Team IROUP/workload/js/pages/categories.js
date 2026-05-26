/* ============================================================
   Categories Management Page
   ============================================================ */
var PageCategories = (function() {
  'use strict';

  var _categories = [];
  var _editId = null;

  var PRESET_COLORS = [
    '#06b6d4','#8b5cf6','#f59e0b','#10b981','#f97316',
    '#ec4899','#14b8a6','#a78bfa','#34d399','#fb7185',
    '#60a5fa','#94a3b8','#e879f9','#84cc16','#f43f5e'
  ];

  // ─── RENDER ───────────────────────────────────────────────
  function render(container) {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>กำลังโหลด...</p></div>';
    _loadCategories(function(cats) {
      _categories = cats;
      _renderPage(container);
    });
  }

  function _loadCategories(cb) {
    if (API.getBaseUrl()) {
      API.getCategoriesFresh()
        .then(function(res) { cb(res.data || []); })
        .catch(function() { cb(_getLocalCategories()); });
    } else {
      cb(_getLocalCategories());
    }
  }

  // localStorage fallback (demo mode)
  function _getLocalCategories() {
    try {
      var saved = localStorage.getItem('peach_categories');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return DEMO_DATA.categories.map(function(c) { return Object.assign({}, c); });
  }

  function _saveLocalCategories(cats) {
    localStorage.setItem('peach_categories', JSON.stringify(cats));
  }

  function _renderPage(container) {
    container.innerHTML = `
      <div class="form-card" style="max-width:900px;">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 style="font-size:18px;color:var(--accent);margin-bottom:4px;">🗂️ จัดการหมวดงาน</h2>
            <p style="font-size:13px;color:var(--text-muted);">
              <span id="catCount">${_categories.length}</span> หมวดงาน · คลิก ✏️ เพื่อแก้ไข หรือ 🗑️ เพื่อลบ
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="PageCategories.openAdd()">
            ➕ เพิ่มหมวดงาน
          </button>
        </div>

        <!-- Category Grid -->
        <div id="catManageGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
          ${_renderCards()}
        </div>
      </div>

      <!-- Modal -->
      <div id="catModal" style="display:none;" class="modal-overlay" onclick="if(event.target===this)PageCategories.closeModal()">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 id="catModalTitle">➕ เพิ่มหมวดงาน</h3>
            <button class="modal-close" onclick="PageCategories.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="catEditId">

            <!-- Preview -->
            <div style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--radius-md);border:1px solid var(--border);margin-bottom:16px;background:var(--bg-primary);">
              <div id="catPreviewIcon" style="font-size:28px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--bg-hover);">📌</div>
              <div>
                <div id="catPreviewName" style="font-size:14px;font-weight:600;color:var(--text-primary);">ชื่อหมวดงาน</div>
                <div id="catPreviewId" style="font-size:11px;color:var(--text-muted);">CAT—</div>
              </div>
            </div>

            <!-- Name -->
            <div class="form-group">
              <label class="form-label">ชื่อหมวดงาน (ไทย) <span class="required">*</span></label>
              <input type="text" class="form-control" id="catName" placeholder="เช่น งานประชาสัมพันธ์"
                     oninput="PageCategories.updatePreview()" maxlength="60">
            </div>

            <!-- Icon & Color row -->
            <div class="form-row">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">ไอคอน (Emoji)</label>
                <input type="text" class="form-control" id="catIcon" placeholder="📌" maxlength="4"
                       style="font-size:20px;text-align:center;" oninput="PageCategories.updatePreview()">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">สี</label>
                <div style="display:flex;align-items:center;gap:8px;">
                  <input type="color" id="catColor" value="#94a3b8"
                         style="width:40px;height:36px;border:none;background:none;cursor:pointer;padding:0;"
                         oninput="PageCategories.updatePreview()">
                  <input type="text" class="form-control" id="catColorHex" placeholder="#94a3b8"
                         style="font-family:monospace;font-size:12px;"
                         oninput="PageCategories.syncColor('hex')">
                </div>
              </div>
            </div>

            <!-- Preset colors -->
            <div style="margin-top:10px;">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">สีพรีเซ็ต:</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${PRESET_COLORS.map(function(c) {
                  return `<div onclick="PageCategories.pickColor('${c}')"
                    style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;
                           border:2px solid transparent;transition:border 0.15s;"
                    title="${c}"></div>`;
                }).join('')}
              </div>
            </div>

            <!-- Description -->
            <div class="form-group" style="margin-top:14px;margin-bottom:0;">
              <label class="form-label">คำอธิบาย (ไม่บังคับ)</label>
              <input type="text" class="form-control" id="catDesc" placeholder="อธิบายประเภทงานนี้..." maxlength="100">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="PageCategories.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary btn-sm" onclick="PageCategories.saveCategory()">💾 บันทึก</button>
          </div>
        </div>
      </div>
    `;
  }

  function _renderCards() {
    if (!_categories.length) {
      return '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">ยังไม่มีหมวดงาน กด ➕ เพื่อเพิ่ม</div>';
    }
    return _categories.map(function(c, idx) {
      return `
        <div class="cat-manage-card" style="border-left:4px solid ${c.color||'#94a3b8'};">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
            <div style="font-size:22px;flex-shrink:0;">${c.icon||'📌'}</div>
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
              <div style="font-size:10px;color:var(--text-muted);">${c.id}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <button class="btn btn-secondary btn-sm" style="padding:4px 8px;font-size:11px;"
                    onclick="PageCategories.openEdit('${c.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" style="padding:4px 8px;font-size:11px;"
                    onclick="PageCategories.deleteCategory('${c.id}','${c.name}')">🗑️</button>
          </div>
        </div>`;
    }).join('');
  }

  // ─── MODAL ────────────────────────────────────────────────
  function openAdd() {
    _editId = null;
    var nextId = _genNextId();
    document.getElementById('catModalTitle').textContent = '➕ เพิ่มหมวดงาน';
    document.getElementById('catEditId').value = '';
    document.getElementById('catName').value = '';
    document.getElementById('catIcon').value = '📌';
    document.getElementById('catColor').value = '#94a3b8';
    document.getElementById('catColorHex').value = '#94a3b8';
    document.getElementById('catDesc').value = '';
    document.getElementById('catPreviewId').textContent = nextId;
    updatePreview();
    document.getElementById('catModal').style.display = 'flex';
    setTimeout(function() { document.getElementById('catName').focus(); }, 100);
  }

  function openEdit(id) {
    var cat = _categories.find(function(c) { return c.id === id; });
    if (!cat) return;
    _editId = id;
    document.getElementById('catModalTitle').textContent = '✏️ แก้ไขหมวดงาน';
    document.getElementById('catEditId').value = id;
    document.getElementById('catName').value = cat.name || '';
    document.getElementById('catIcon').value = cat.icon || '📌';
    document.getElementById('catColor').value = cat.color || '#94a3b8';
    document.getElementById('catColorHex').value = cat.color || '#94a3b8';
    document.getElementById('catDesc').value = cat.description || '';
    document.getElementById('catPreviewId').textContent = id;
    updatePreview();
    document.getElementById('catModal').style.display = 'flex';
    setTimeout(function() { document.getElementById('catName').focus(); }, 100);
  }

  function closeModal() {
    document.getElementById('catModal').style.display = 'none';
  }

  function updatePreview() {
    var name  = document.getElementById('catName').value || 'ชื่อหมวดงาน';
    var icon  = document.getElementById('catIcon').value || '📌';
    var color = document.getElementById('catColor').value || '#94a3b8';
    var pIcon = document.getElementById('catPreviewIcon');
    var pName = document.getElementById('catPreviewName');
    if (pIcon) { pIcon.textContent = icon; pIcon.style.background = color + '22'; }
    if (pName) pName.textContent = name;
  }

  function syncColor(from) {
    if (from === 'hex') {
      var hex = (document.getElementById('catColorHex').value || '').trim();
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        document.getElementById('catColor').value = hex;
        updatePreview();
      }
    }
  }

  function pickColor(hex) {
    document.getElementById('catColor').value = hex;
    document.getElementById('catColorHex').value = hex;
    updatePreview();
  }

  // ─── SAVE ─────────────────────────────────────────────────
  function saveCategory() {
    var name  = (document.getElementById('catName').value || '').trim();
    var icon  = (document.getElementById('catIcon').value || '📌').trim();
    var color = document.getElementById('catColor').value || '#94a3b8';
    var desc  = (document.getElementById('catDesc').value || '').trim();

    if (!name) { App.toast('กรุณากรอกชื่อหมวดงาน', 'error'); return; }

    if (_editId) {
      // UPDATE
      var payload = { id: _editId, name: name, icon: icon, color: color, description: desc };
      var p = API.getBaseUrl()
        ? API.updateCategory(payload)
        : Promise.resolve({ success: true });

      p.then(function() {
        if (!API.getBaseUrl()) {
          // update local
          _categories = _categories.map(function(c) {
            return c.id === _editId ? Object.assign({}, c, payload) : c;
          });
          _saveLocalCategories(_categories);
        }
        App.toast('แก้ไขหมวดงานเรียบร้อย ✅', 'success');
        closeModal();
        _reload();
      }).catch(function(err) {
        App.toast('เกิดข้อผิดพลาด: ' + err.message, 'error');
      });

    } else {
      // CREATE
      var newId = _genNextId();
      var newCat = { id: newId, name: name, nameEn: '', icon: icon, color: color, description: desc };
      var p2 = API.getBaseUrl()
        ? API.createCategory(newCat)
        : Promise.resolve({ success: true });

      p2.then(function() {
        if (!API.getBaseUrl()) {
          _categories.push(newCat);
          _saveLocalCategories(_categories);
        }
        App.toast('เพิ่มหมวดงาน "' + name + '" เรียบร้อย ✅', 'success');
        closeModal();
        _reload();
      }).catch(function(err) {
        App.toast('เกิดข้อผิดพลาด: ' + err.message, 'error');
      });
    }
  }

  // ─── DELETE ───────────────────────────────────────────────
  function deleteCategory(id, name) {
    if (!confirm('ลบหมวดงาน "' + name + '" ใช่หรือไม่?\n\n⚠️ ภาระงานที่อยู่ในหมวดนี้จะยังคงอยู่ แต่ไม่มีหมวดงาน')) return;

    var p = API.getBaseUrl()
      ? API.deleteCategory(id)
      : Promise.resolve({ success: true });

    p.then(function() {
      if (!API.getBaseUrl()) {
        _categories = _categories.filter(function(c) { return c.id !== id; });
        _saveLocalCategories(_categories);
      }
      App.toast('ลบหมวดงานเรียบร้อย', 'success');
      _reload();
    }).catch(function(err) {
      App.toast('เกิดข้อผิดพลาด: ' + err.message, 'error');
    });
  }

  // ─── HELPERS ──────────────────────────────────────────────
  function _genNextId() {
    var existingNums = _categories.map(function(c) {
      var m = (c.id || '').match(/^CAT(\d+)$/);
      return m ? parseInt(m[1]) : 0;
    });
    var max = existingNums.length ? Math.max.apply(null, existingNums) : 12;
    var next = max + 1;
    return 'CAT' + (next < 10 ? '0' + next : next);
  }

  function _reload() {
    var container = document.getElementById('pageContent');
    if (container) render(container);
  }

  return {
    render: render,
    openAdd: openAdd,
    openEdit: openEdit,
    closeModal: closeModal,
    updatePreview: updatePreview,
    syncColor: syncColor,
    pickColor: pickColor,
    saveCategory: saveCategory,
    deleteCategory: deleteCategory,
  };
})();
