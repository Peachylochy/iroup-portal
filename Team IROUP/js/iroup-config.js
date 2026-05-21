// ============================================================
// iROUP shared browser helpers
// ============================================================
//
// V1 Apps Script traffic has been retired from the frontend.
// Keep this small IROUP shim only for legacy helper calls that pages still use
// while all data access moves through IROUP_V2.

const IROUP = {
  SCRIPT_URL: '',

  SHEETS: {
    STAFF: 'บุคลากร',
    MOU: 'MOU',
    SCHOLAR: 'ทุนการศึกษา',
    EVENT: 'กิจกรรม',
    TRAVEL: 'การเดินทาง',
    INBOUND: 'Inbound',
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

  showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6B7A8D;font-family:'Sarabun',sans-serif;font-size:13px">
          <div style="font-size:28px;margin-bottom:8px;animation:spin 1s linear infinite;display:inline-block">...</div>
          <div>กำลังโหลดข้อมูล...</div>
        </div>`;
    }
  },

  showError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `
        <div style="text-align:center;padding:40px;color:#D63B32;font-family:'Sarabun',sans-serif;font-size:13px">
          <div style="font-size:28px;margin-bottom:8px">!</div>
          <div>${msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'}</div>
        </div>`;
    }
  },

  getStatus(startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return { status: 'upcoming', label: 'รอดำเนินการ', color: '#D4890A' };
    if (today > end) return { status: 'done', label: 'เสร็จสิ้น', color: '#6B7A8D' };
    return { status: 'active', label: 'กำลังดำเนินการ', color: '#5BAD3E' };
  },

  getMouStatus(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.floor((end - today) / 86400000);
    if (diff < 0) return { status: 'expired', label: 'หมดอายุ', color: '#D63B32' };
    if (diff <= 180) return { status: 'soon', label: 'ใกล้หมดอายุ', color: '#D4890A' };
    return { status: 'active', label: 'Active', color: '#5BAD3E' };
  },

  getScholarStatus(openDate, closeDate) {
    const today = new Date();
    const open = new Date(openDate);
    const close = new Date(closeDate);
    const diff = Math.floor((close - today) / 86400000);
    if (today < open) return { status: 'upcoming', label: 'เร็ว ๆ นี้', daysLeft: null };
    if (today > close) return { status: 'closed', label: 'ปิดรับแล้ว', daysLeft: null };
    return { status: 'open', label: 'กำลังรับสมัคร', daysLeft: diff };
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  },
};
