/* global React */
const { useState: useStateModal } = React;

// ============================================================
// Modal — เพิ่ม MOU ใหม่ (showcases the input fix)
// ============================================================
function AddMOUModal({ open, onClose }) {
  const [form, setForm] = useStateModal({
    unit: '',
    orgTH: '',
    orgEN: '',
    country: '',
    type: 'MOU',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: '',
    showPublic: true,
  });

  if (!open) return null;
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  return (
    <div className={`ir-modal ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="ir-modal-panel" onClick={e => e.stopPropagation()}>
        <div className="ir-modal-head">
          <div>
            <div className="ir-modal-title">🤝 เพิ่ม MOU ใหม่</div>
            <div className="ir-modal-sub">บันทึกข้อตกลงความร่วมมือกับสถาบันต่างประเทศ</div>
          </div>
          <button className="ir-btn ir-btn-ghost ir-btn-sm" onClick={onClose}>ปิด ✕</button>
        </div>

        <div className="ir-modal-body">
          <div className="ir-form-grid">
            <div className="ir-form-section">
              <div className="ir-form-section-title">ข้อมูลหลัก</div>
              <div className="ir-form-row">
                <label className="ir-form-field">
                  <div className="ir-label">หน่วยงาน ม.พะเยา <span className="req">*</span></div>
                  <input className="ir-input" placeholder="พิมพ์เพื่อค้นหา..." value={form.unit} onChange={e => set('unit', e.target.value)} />
                </label>
              </div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">ชื่อองค์กรต่างประเทศ (TH) <span className="req">*</span></div>
                  <input className="ir-input" placeholder="เช่น มหาวิทยาลัยปักกิ่ง" value={form.orgTH} onChange={e => set('orgTH', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">ชื่อองค์กรต่างประเทศ (EN) <span className="req">*</span></div>
                  <input className="ir-input" placeholder="e.g. Peking University" value={form.orgEN} onChange={e => set('orgEN', e.target.value)} />
                </label>
              </div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">ประเทศ <span className="req">*</span></div>
                  <select className="ir-select" value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="">เลือกประเทศ</option>
                    <option>🇨🇳 จีน</option>
                    <option>🇯🇵 ญี่ปุ่น</option>
                    <option>🇰🇷 เกาหลีใต้</option>
                    <option>🇺🇸 สหรัฐอเมริกา</option>
                    <option>🇩🇪 เยอรมนี</option>
                  </select>
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">ประเภทความร่วมมือ <span className="req">*</span></div>
                  <select className="ir-select" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option>MOU</option>
                    <option>MOA</option>
                    <option>LOI</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="ir-form-section">
              <div className="ir-form-section-title">ระยะเวลาและงบประมาณ</div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">มีผลตั้งแต่วันที่ <span className="req">*</span></div>
                  <input className="ir-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">สิ้นสุดวันที่ <span className="req">*</span></div>
                  <input className="ir-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                </label>
              </div>
              <div className="ir-form-row two">
                <label className="ir-form-field">
                  <div className="ir-label">งบประมาณ (บาท)</div>
                  <input className="ir-input" placeholder="0" value={form.budget} onChange={e => set('budget', e.target.value)} />
                </label>
                <label className="ir-form-field">
                  <div className="ir-label">สถานะ</div>
                  <select className="ir-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                  </select>
                </label>
              </div>
              <label className="ir-form-field">
                <div className="ir-label">หมายเหตุ</div>
                <textarea className="ir-textarea" rows="3" placeholder="รายละเอียดเพิ่มเติม..." value={form.notes} onChange={e => set('notes', e.target.value)}></textarea>
              </label>
            </div>

            <div className="ir-form-section">
              <div className="ir-form-section-title">การตั้งค่า</div>
              <label className="ir-check">
                <input type="checkbox" checked={form.showPublic} onChange={e => set('showPublic', e.target.checked)} />
                <span>แสดงในหน้า Public Web (อนุญาตให้ดูสาธารณะ)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="ir-modal-foot">
          <button className="ir-btn ir-btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="ir-btn ir-btn-primary">💾 บันทึก MOU</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddMOUModal });
