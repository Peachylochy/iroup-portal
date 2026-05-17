/* global React */
const { useState: useStateMobModal } = React;

// ============================================================
// Modal — เพิ่ม Mobility (V2-native MOBILITY_PROJECT metadata)
// ============================================================
function AddMobilityModal({ open, onClose }) {
  const [form, setForm] = useStateMobModal({
    direction: 'Inbound',
    name: '',
    institute: '',
    country: '',
    city: '',
    unit: '',
    purpose: '',
    level: 'ป.ตรี',
    group: 'student',
    startDate: '',
    endDate: '',
    year: '2569',
    total: 0,
    students: 0,
    staff: 0,
    status: 'กำลังดำเนินการ',
    public: true,
  });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  if (!open) return null;

  return (
    <div className={`ir-modal ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ir-modal-panel ir-modal-panel-lg" onClick={e => e.stopPropagation()}>
        <div className="ir-modal-head">
          <div>
            <div className="ir-modal-title">🌐 เพิ่ม Mobility</div>
            <div className="ir-modal-sub">V2-native MOBILITY_PROJECT metadata</div>
          </div>
          <button className="ir-btn ir-btn-ghost ir-btn-sm" onClick={onClose}>ปิด ✕</button>
        </div>

        <div className="ir-modal-body">
          <div className="ir-form-grid">
            {/* Participants */}
            <div className="ir-form-section">
              <div className="ir-form-section-title">👥 ผู้เข้าร่วม</div>
              <label className="ir-form-field">
                <div className="ir-label">ค้นหานิสิต/บุคลากร...</div>
                <input className="ir-input" placeholder="พิมพ์ชื่อ รหัสนิสิต หรือ email..." />
              </label>
              <div className="ir-empty-list">
                <span>📭</span> ยังไม่มีผู้เข้าร่วม
              </div>
            </div>

            {/* Main info */}
            <div className="ir-form-section">
              <div className="ir-form-section-title">📋 ข้อมูลหลัก</div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">ทิศทาง <span className="req">*</span></div>
                  <select className="ir-select" value={form.direction} onChange={e => set('direction', e.target.value)}>
                    <option>Inbound</option>
                    <option>Outbound</option>
                  </select>
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">ชื่อโครงการ <span className="req">*</span></div>
                  <input className="ir-input" placeholder="เช่น แลกเปลี่ยนญี่ปุ่น 2569"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </label>
              </div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">สถาบัน</div>
                  <input className="ir-input" placeholder="เช่น Tokyo University"
                    value={form.institute} onChange={e => set('institute', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">ประเทศ</div>
                  <select className="ir-select" value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="">เลือกประเทศ</option>
                    <option>🇯🇵 ญี่ปุ่น</option>
                    <option>🇨🇳 จีน</option>
                    <option>🇰🇷 เกาหลีใต้</option>
                    <option>🇹🇼 ไต้หวัน</option>
                    <option>🇩🇪 เยอรมนี</option>
                    <option>🇫🇷 ฝรั่งเศส</option>
                  </select>
                </label>
              </div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">เมือง</div>
                  <input className="ir-input" placeholder="เช่น Tokyo"
                    value={form.city} onChange={e => set('city', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">หน่วยงาน UP</div>
                  <input className="ir-input" placeholder="เช่น คณะวิทยาศาสตร์"
                    value={form.unit} onChange={e => set('unit', e.target.value)} />
                </label>
              </div>
            </div>

            {/* Details */}
            <div className="ir-form-section">
              <div className="ir-form-section-title">📝 รายละเอียด</div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">วัตถุประสงค์</div>
                  <textarea className="ir-textarea" rows="2"
                    placeholder="วัตถุประสงค์ของโครงการ..."
                    value={form.purpose} onChange={e => set('purpose', e.target.value)}></textarea>
                </label>
                <div className="ir-form-col">
                  <label className="ir-form-field">
                    <div className="ir-label">ระดับ</div>
                    <select className="ir-select" value={form.level} onChange={e => set('level', e.target.value)}>
                      <option>ป.ตรี</option>
                      <option>ป.โท</option>
                      <option>ป.เอก</option>
                      <option>บุคลากร</option>
                    </select>
                  </label>
                  <label className="ir-form-field">
                    <div className="ir-label">กลุ่มผู้เข้าร่วม</div>
                    <select className="ir-select" value={form.group} onChange={e => set('group', e.target.value)}>
                      <option value="student">นิสิต/นักศึกษา</option>
                      <option value="staff">บุคลากร</option>
                      <option value="both">นิสิตและบุคลากร</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="ir-form-section">
              <div className="ir-form-section-title">📅 วันที่และจำนวน</div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">วันที่เริ่มต้น <span className="req">*</span></div>
                  <input className="ir-input" type="date"
                    value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">วันที่สิ้นสุด <span className="req">*</span></div>
                  <input className="ir-input" type="date"
                    value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                </label>
              </div>
              <div className="ir-form-row three">
                <label className="ir-form-field">
                  <div className="ir-label">ปีงบประมาณ</div>
                  <input className="ir-input" placeholder="2569"
                    value={form.year} onChange={e => set('year', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">จำนวนผู้เข้าร่วมทั้งหมด</div>
                  <input className="ir-input" type="number" min="0"
                    value={form.total} onChange={e => set('total', e.target.value)} />
                </label>
                <div></div>
              </div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">นิสิต/นักศึกษา</div>
                  <input className="ir-input" type="number" min="0"
                    value={form.students} onChange={e => set('students', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">บุคลากร</div>
                  <input className="ir-input" type="number" min="0"
                    value={form.staff} onChange={e => set('staff', e.target.value)} />
                </label>
              </div>
            </div>

            {/* Files */}
            <div className="ir-form-section">
              <div className="ir-form-section-title">📎 ไฟล์แนบ</div>
              <div className="ir-file-drop">
                <div className="ir-file-drop-icon">📎</div>
                <div className="ir-file-drop-text">
                  <strong>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก</strong>
                  <span>PDF, DOCX, JPG, PNG · ขนาดสูงสุด 10 MB ต่อไฟล์</span>
                </div>
                <button className="ir-btn ir-btn-glass ir-btn-sm" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  เลือกไฟล์
                </button>
              </div>
              <div className="ir-file-list-empty">ยังไม่มีไฟล์แนบ</div>
            </div>

            {/* Settings */}
            <div className="ir-form-section">
              <div className="ir-form-section-title">⚙ การตั้งค่า</div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">สถานะ</div>
                  <select className="ir-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option>กำลังดำเนินการ</option>
                    <option>เสร็จสิ้น</option>
                    <option>วางแผน</option>
                    <option>ยกเลิก</option>
                  </select>
                </label>
                <div className="ir-form-field" style={{paddingTop: 28}}>
                  <label className="ir-check">
                    <input type="checkbox" checked={form.public} onChange={e => set('public', e.target.checked)} />
                    <span>แสดงบนหน้า Public (เปิดเผยข้อมูล)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ir-modal-foot">
          <button className="ir-btn ir-btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="ir-btn ir-btn-primary">💾 บันทึก</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddMobilityModal });
