// ============================================================
// iROUP — Config & API Helper
// ============================================================

const IROUP = {
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZ7h-jYflQAexSj4ss9oYyZMd6DyHfEvkjK03F6XIVDMpdcLjBsIOLFci-q8RwMGtE/exec',

  SHEETS: {
    STAFF:    'บุคลากร',
    MOU:      'MOU',
    SCHOLAR:  'ทุนการศึกษา',
    EVENT:    'กิจกรรม',
    TRAVEL:   'การเดินทาง',
    INBOUND:  'Inbound',
    OUTBOUND: 'Outbound',
  },

  getAdminToken() {
    try {
      const direct = sessionStorage.getItem('iroup_admin_token');
      if (direct) return direct;

      const rawUser = sessionStorage.getItem('iroup_user');
      if (!rawUser) return '';

      const user = JSON.parse(rawUser);
      return user && user.adminToken ? user.adminToken : '';
    } catch (e) {
      return '';
    }
  },

  getGoogleAccessToken() {
    try {
      const direct = sessionStorage.getItem('iroup_google_access_token');
      if (direct) return direct;

      const rawUser = sessionStorage.getItem('iroup_user');
      if (!rawUser) return '';

      const user = JSON.parse(rawUser);
      return user && user.googleAccessToken ? user.googleAccessToken : '';
    } catch (e) {
      return '';
    }
  },

  _withAdminUrl(url) {
    const token = this.getAdminToken();
    if (!token) return url;

    const separator = url.indexOf('?') >= 0 ? '&' : '?';
    return `${url}${separator}adminToken=${encodeURIComponent(token)}`;
  },

  _withAdminBody(body) {
    const token = this.getAdminToken();
    if (!token) return body;
    return Object.assign({}, body, { adminToken: token });
  },

  // fetch helper กลาง — แก้ปัญหา CORS redirect ของ Apps Script
 async _get(url) {
  const res = await fetch(url, { redirect: 'follow' });
  return res.json();
},

async _post(body) {
  const res = await fetch(this.SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify(body),
  });
  return res.json();
},

async createAdminSession(accessToken) {
  return this._post({ action: 'createAdminSession', accessToken });
},

async getPublicMou() {
  const data = await this._get(`${this.SCRIPT_URL}?action=getPublicMou`);
  return data.data || [];
},

async getPublicMobility() {
  return this._get(`${this.SCRIPT_URL}?action=getPublicMobility`);
},

async getPublicTravel() {
  const data = await this._get(`${this.SCRIPT_URL}?action=getPublicTravel`);
  return data.data || [];
},

async getPublicScholarships() {
  const data = await this._get(`${this.SCRIPT_URL}?action=getPublicScholarships`);
  return data.data || [];
},

async getPublicEvents() {
  const data = await this._get(`${this.SCRIPT_URL}?action=getPublicEvents`);
  return data.data || [];
},

async getPublicStats() {
  const data = await this._get(`${this.SCRIPT_URL}?action=getPublicStats`);
  return data.stats || {};
},

async uploadFile(base64, fileName, folderName) {
  return this._post(this._withAdminBody({ action: 'uploadFile', base64, fileName, folderName }));
},

async uploadImage(base64, fileName, folderName) {
  return this._post(this._withAdminBody({ action: 'uploadImage', base64, fileName, folderName }));
},

async getAll(sheet) {
  const url = this._withAdminUrl(`${this.SCRIPT_URL}?action=getAll&sheet=${encodeURIComponent(sheet)}`);
  const data = await this._get(url);
  return data.data || [];
},

  // ============================================================
  // SEARCH — ค้นหาข้อมูล
  // ============================================================
  async search(sheet, query) {
    const url = this._withAdminUrl(`${this.SCRIPT_URL}?action=search&sheet=${encodeURIComponent(sheet)}&q=${encodeURIComponent(query)}`);
    const data = await this._get(url);
    return data.data || [];
  },

  // ============================================================
  // SEARCH STAFF — ค้นหาบุคลากร
  // ============================================================
  async searchStaff(query) {
    const url = this._withAdminUrl(`${this.SCRIPT_URL}?action=searchStaff&q=${encodeURIComponent(query)}`);
    const data = await this._get(url);
    return data.data || [];
  },

  // ============================================================
  // ADD — เพิ่มข้อมูลใหม่
  // ============================================================
  async add(sheet, data) {
    return this._post(this._withAdminBody({ action: 'add', sheet, data }));
  },

  // ============================================================
  // EDIT — แก้ไขข้อมูล
  // ============================================================
  async edit(sheet, id, data) {
    return this._post(this._withAdminBody({ action: 'edit', sheet, id, data }));
  },

  // ============================================================
  // DELETE — ลบข้อมูล
  // ============================================================
  async delete(sheet, id) {
    return this._post(this._withAdminBody({ action: 'delete', sheet, id }));
  },

  // ============================================================
  // GET STATS — ดึงสถิติ Dashboard
  // ============================================================
  async getStats() {
    const url = this._withAdminUrl(`${this.SCRIPT_URL}?action=getStats`);
    const data = await this._get(url);
    return data.stats || {};
  },

  // ============================================================
  // GET REPORT — ดึงข้อมูลรายงาน
  // ============================================================
  async getReport(year = '') {
    const url = this._withAdminUrl(`${this.SCRIPT_URL}?action=getReport&year=${encodeURIComponent(year)}`);
    return this._get(url);
  },

  // ============================================================
  // GET MOU BY COUNTRY — สำหรับแผนที่โลก
  // ============================================================
  async getMouByCountry() {
    const url = this._withAdminUrl(`${this.SCRIPT_URL}?action=getMouByCountry`);
    const data = await this._get(url);
    return data.data || {};
  },

  // ============================================================
  // HELPER — แสดง Loading
  // ============================================================
  showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:40px;color:#6B7A8D;font-family:'Sarabun',sans-serif;font-size:13px">
        <div style="font-size:28px;margin-bottom:8px;animation:spin 1s linear infinite;display:inline-block">⏳</div>
        <div>กำลังโหลดข้อมูล...</div>
      </div>`;
  },

  // ============================================================
  // HELPER — แสดง Error
  // ============================================================
  showError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:40px;color:#D63B32;font-family:'Sarabun',sans-serif;font-size:13px">
        <div style="font-size:28px;margin-bottom:8px">⚠️</div>
        <div>${msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'}</div>
      </div>`;
  },

  // ============================================================
  // HELPER — คำนวณสถานะจากวันที่อัตโนมัติ
  // ============================================================
  getStatus(startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (today < start) return { status: 'upcoming', label: 'รอเดินทาง',     color: '#D4890A' };
    if (today > end)   return { status: 'done',     label: 'เสร็จสิ้น',     color: '#6B7A8D' };
    return               { status: 'active',    label: 'กำลังดำเนินการ', color: '#5BAD3E' };
  },

  getMouStatus(endDate) {
    const today = new Date();
    const end   = new Date(endDate);
    const diff  = Math.floor((end - today) / (1000 * 60 * 60 * 24));
    if (diff < 0)    return { status: 'expired', label: 'หมดอายุ', color: '#D63B32' };
    if (diff <= 180) return { status: 'soon',    label: 'ใกล้หมด', color: '#D4890A' };
    return             { status: 'active',   label: 'Active',   color: '#5BAD3E' };
  },

  getScholarStatus(openDate, closeDate) {
    const today = new Date();
    const open  = new Date(openDate);
    const close = new Date(closeDate);
    const diff  = Math.floor((close - today) / (1000 * 60 * 60 * 24));
    if (today < open)  return { status: 'upcoming', label: 'เร็วๆ นี้',      daysLeft: null };
    if (today > close) return { status: 'closed',   label: 'ปิดรับแล้ว',     daysLeft: null };
    return              { status: 'open',     label: 'กำลังรับสมัคร', daysLeft: diff };
  },

  // ============================================================
  // HELPER — Format วันที่เป็นภาษาไทย
  // ============================================================
  formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit'
    });
  },
};
