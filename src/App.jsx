import { useState, useMemo } from "react";

const STATUSES = [
  { key: "yeni",       label: "Yeni",             color: "#6366f1", bg: "#eef2ff" },
  { key: "iletisim",   label: "İletişimde",        color: "#f59e0b", bg: "#fffbeb" },
  { key: "teklif",     label: "Teklif Gönderildi", color: "#3b82f6", bg: "#eff6ff" },
  { key: "kazanildi",  label: "Kazanıldı",         color: "#10b981", bg: "#ecfdf5" },
  { key: "kaybedildi", label: "Kaybedildi",        color: "#ef4444", bg: "#fef2f2" },
];

const SINAV_TIPLERI = [
  { key: "TYT", label: "TYT", desc: "Temel Yeterlilik" },
  { key: "AYT", label: "AYT", desc: "Alan Yeterlilik" },
  { key: "LGS", label: "LGS", desc: "Liseye Geçiş" },
];

const ILLER = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin",
  "Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur",
  "Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan",
  "Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul",
  "İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli",
  "Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Şanlıurfa","Siirt","Sinop",
  "Şırnak","Sivas","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"
];

const SAMPLE_LEADS = [
  { id: 1, name: "Arda Kılıç",   phone: "0532 111 22 33", il: "İstanbul", ilce: "Kadıköy",  kurum: "Başarı Dershanesi",   sinavTipi: ["TYT","AYT"], ogrenciSayisi: 120, status: "kazanildi",  note: "Sözleşme imzalandı.", date: "2026-02-10" },
  { id: 2, name: "Selin Yıldız", phone: "0543 222 33 44", il: "Ankara",   ilce: "Çankaya",  kurum: "Gelecek Koleji",      sinavTipi: ["LGS"],       ogrenciSayisi: 85,  status: "teklif",     note: "Teklif gönderildi.", date: "2026-02-18" },
  { id: 3, name: "Mert Demir",   phone: "0555 333 44 55", il: "İzmir",    ilce: "Bornova",  kurum: "Işık Anadolu Lisesi", sinavTipi: ["TYT"],       ogrenciSayisi: 200, status: "iletisim",   note: "İkinci toplantı ayarlandı.", date: "2026-02-20" },
  { id: 4, name: "Beyza Şahin",  phone: "0507 444 55 66", il: "Bursa",    ilce: "Nilüfer",  kurum: "Akıl Küpü Okulu",    sinavTipi: ["LGS","TYT"], ogrenciSayisi: 60,  status: "yeni",       note: "", date: "2026-02-22" },
  { id: 5, name: "Tolga Arslan", phone: "0544 555 66 77", il: "Konya",    ilce: "Selçuklu", kurum: "Meram Dershanesi",    sinavTipi: ["AYT"],       ogrenciSayisi: 150, status: "kaybedildi", note: "Rakip firmayı tercih etti.", date: "2026-01-30" },
];

let nextId = 6;
const EMPTY_FORM = { name: "", phone: "", il: "", ilce: "", kurum: "", sinavTipi: [], ogrenciSayisi: "", status: "yeni", note: "" };

const StatusBadge = ({ statusKey }) => {
  const s = STATUSES.find(x => x.key === statusKey) || STATUSES[0];
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
};

const SinavBadge = ({ types }) => (
  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
    {(types || []).map(t => (
      <span key={t} style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
        background: t === "TYT" ? "#fef3c7" : t === "AYT" ? "#ede9fe" : "#dcfce7",
        color: t === "TYT" ? "#92400e" : t === "AYT" ? "#5b21b6" : "#15803d",
      }}>{t}</span>
    ))}
  </div>
);

export default function App() {
  const [leads, setLeads] = useState(SAMPLE_LEADS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tümü");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || (l.kurum||"").toLowerCase().includes(q) || (l.il||"").toLowerCase().includes(q);
    const matchStatus = filterStatus === "tümü" || l.status === filterStatus;
    return matchSearch && matchStatus;
  }), [leads, search, filterStatus]);

  const stats = useMemo(() => ({
    total: leads.length,
    kazanildi: leads.filter(l => l.status === "kazanildi").length,
    topOgrenci: leads.filter(l => l.status === "kazanildi").reduce((s, l) => s + (Number(l.ogrenciSayisi) || 0), 0),
    pipeline: leads.filter(l => !["kazanildi","kaybedildi"].includes(l.status)).reduce((s, l) => s + (Number(l.ogrenciSayisi) || 0), 0),
  }), [leads]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (lead) => { setForm({ ...lead }); setModal(lead); setDetailId(null); };
  const toggleSinav = (key) => setForm(f => ({
    ...f, sinavTipi: f.sinavTipi.includes(key) ? f.sinavTipi.filter(x => x !== key) : [...f.sinavTipi, key]
  }));
  const saveForm = () => {
    if (!form.name.trim()) return;
    if (modal === "add") {
      setLeads(prev => [...prev, { ...form, id: nextId++, ogrenciSayisi: Number(form.ogrenciSayisi) || 0, date: new Date().toISOString().slice(0, 10) }]);
    } else {
      setLeads(prev => prev.map(l => l.id === modal.id ? { ...l, ...form, ogrenciSayisi: Number(form.ogrenciSayisi) || 0 } : l));
    }
    setModal(null);
  };
  const deleteLead = (id) => { setLeads(prev => prev.filter(l => l.id !== id)); setConfirmDelete(null); setModal(null); setDetailId(null); };
  const inp = (field) => ({ value: form[field], onChange: e => setForm(f => ({ ...f, [field]: e.target.value })) });
  const currentLead = detailId ? leads.find(l => l.id === detailId) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f5", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:inherit}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:99px}
        .card-hover{transition:box-shadow .15s,transform .12s;cursor:pointer}
        .card-hover:hover{box-shadow:0 4px 18px rgba(0,0,0,.09);transform:translateY(-1px)}
        .btn-primary{background:#1a1a1a;color:#fff;border:none;padding:11px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}
        .btn-primary:hover{opacity:.82}
        .btn-ghost{background:transparent;border:1.5px solid #e5e5e5;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;color:#555;transition:all .15s}
        .btn-ghost:hover{border-color:#bbb;color:#222}
        .field label{display:block;font-size:11px;font-weight:700;color:#999;letter-spacing:.07em;text-transform:uppercase;margin-bottom:5px}
        .field input,.field select,.field textarea{width:100%;border:1.5px solid #e8e8e8;border-radius:10px;padding:10px 13px;font-size:14px;outline:none;background:#fff;transition:border-color .15s;color:#1a1a1a}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#1a1a1a}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:flex-end;justify-content:center}
        @media(min-width:600px){.overlay{align-items:center}.modal{border-radius:16px !important;max-width:480px !important}}
        .modal{background:#fff;width:100%;border-radius:20px 20px 0 0;max-height:92vh;overflow:hidden;display:flex;flex-direction:column}
        .sinav-btn{border:2px solid #e8e8e8;border-radius:10px;padding:10px 8px;cursor:pointer;background:#fff;transition:all .15s;text-align:center;width:100%}
        .sinav-btn.active{border-color:#1a1a1a;background:#1a1a1a;color:#fff}
        .chip-filter{padding:6px 13px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all .15s;white-space:nowrap;background:none}
        .detail-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:150;display:flex;align-items:flex-end}
        @media(min-width:600px){.detail-overlay{align-items:center;justify-content:center}.detail-panel{border-radius:16px !important;max-width:400px !important;margin:0 auto}}
        .detail-panel{background:#fff;width:100%;border-radius:20px 20px 0 0;max-height:85vh;overflow-y:auto}
      `}</style>

      <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "0 16px", display: "flex", alignItems: "center", height: 56, gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, fontSize: 18, letterSpacing: "-0.04em" }}>
          crm<span style={{ color: "#6366f1" }}>.</span>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={openAdd} style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Yeni Lead
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Toplam Lead",       value: stats.total,                            icon: "👥" },
            { label: "Kazanılan",         value: stats.kazanildi,                        icon: "✅" },
            { label: "Kazanılan Öğrenci", value: stats.topOgrenci.toLocaleString("tr"),  icon: "🎓" },
            { label: "Pipeline Öğrenci",  value: stats.pipeline.toLocaleString("tr"),    icon: "🔥" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#ccc", fontSize: 15 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, kurum veya il ara…"
            style={{ width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "10px 13px 10px 38px", fontSize: 14, outline: "none", background: "#fff" }} />
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
          {[{ key: "tümü", label: "Tümü" }, ...STATUSES].map(s => {
            const active = filterStatus === s.key;
            return (
              <button key={s.key} className="chip-filter" onClick={() => setFilterStatus(s.key)}
                style={{ background: active ? "#1a1a1a" : "#fff", color: active ? "#fff" : "#666", borderColor: active ? "#1a1a1a" : "#e8e8e8" }}>
                {s.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#ccc", fontSize: 14 }}>Kayıt bulunamadı.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(lead => (
            <div key={lead.id} className="card-hover" onClick={() => setDetailId(lead.id)}
              style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{lead.name}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{lead.kurum}</div>
                </div>
                <StatusBadge statusKey={lead.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <SinavBadge types={lead.sinavTipi} />
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#999" }}>
                  <span>📍 {lead.il}</span>
                  <span>🎓 {lead.ogrenciSayisi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "#ccc", textAlign: "center" }}>{filtered.length} kayıt</div>
      </div>

      {currentLead && (
        <div className="detail-overlay" onClick={e => e.target === e.currentTarget && setDetailId(null)}>
          <div className="detail-panel">
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ width: 36, height: 4, background: "#e5e5e5", borderRadius: 99, margin: "0 auto 14px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{currentLead.name}</div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>{currentLead.kurum}</div>
                </div>
                <StatusBadge statusKey={currentLead.status} />
              </div>
            </div>
            <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "📞", label: "Telefon", val: currentLead.phone || "—" },
                { icon: "📍", label: "Konum",   val: [currentLead.ilce, currentLead.il].filter(Boolean).join(" / ") || "—" },
                { icon: "🎓", label: "Öğrenci Sayısı", val: `${currentLead.ogrenciSayisi || 0} öğrenci` },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, background: "#f5f5f5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{r.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{r.val}</div>
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>Sınav Tipi</div>
                <SinavBadge types={currentLead.sinavTipi} />
              </div>
              {currentLead.note && (
                <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Not</div>
                  <div style={{ fontSize: 13, color: "#555" }}>{currentLead.note}</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setDetailId(null)}>Kapat</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={() => openEdit(currentLead)}>✏️ Düzenle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, background: "#e5e5e5", borderRadius: 99, margin: "0 auto 12px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{modal === "add" ? "Yeni Lead Ekle" : "Lead Düzenle"}</div>
                <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa" }}>×</button>
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Ad Soyad *</label>
                <input {...inp("name")} placeholder="Örn: Ahmet Yılmaz" />
              </div>
              <div className="field">
                <label>Telefon No</label>
                <input {...inp("phone")} placeholder="05__ ___ __ __" type="tel" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="field">
                  <label>İl</label>
                  <select {...inp("il")}>
                    <option value="">Seçiniz</option>
                    {ILLER.map(il => <option key={il}>{il}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>İlçe</label>
                  <input {...inp("ilce")} placeholder="İlçe adı" />
                </div>
              </div>
              <div className="field">
                <label>Kurum İsmi</label>
                <input {...inp("kurum")} placeholder="Örn: Gelecek Dershanesi" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 4 }}>Sınav Tipi</div>
                <div style={{ fontSize: 11, color: "#ccc", marginBottom: 8 }}>Birden fazla seçilebilir</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {SINAV_TIPLERI.map(s => {
                    const active = form.sinavTipi.includes(s.key);
                    return (
                      <button key={s.key} type="button" className={`sinav-btn${active ? " active" : ""}`} onClick={() => toggleSinav(s.key)}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{s.label}</div>
                        <div style={{ fontSize: 9, opacity: .65, marginTop: 2 }}>{s.desc}</div>
                        {active && <div style={{ fontSize: 14, marginTop: 4 }}>✓</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="field">
                <label>Öğrenci Sayısı</label>
                <input {...inp("ogrenciSayisi")} type="number" min="0" placeholder="Örn: 150" />
              </div>
              <div className="field">
                <label>Durum</label>
                <select {...inp("status")}>
                  {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Not</label>
                <textarea {...inp("note")} rows={3} placeholder="Ek notlar…" style={{ resize: "vertical" }} />
              </div>
            </div>
            <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #f0f0f0", flexShrink: 0, display: "flex", gap: 8 }}>
              {modal !== "add" && (
                <button className="btn-ghost" onClick={() => setConfirmDelete(modal.id)} style={{ color: "#ef4444", borderColor: "#fecaca" }}>Sil</button>
              )}
              <button className="btn-ghost" onClick={() => setModal(null)}>İptal</button>
              <button className="btn-primary" onClick={saveForm} style={{ flex: 1 }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal">
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Bu lead'i silmek istiyor musunuz?</div>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 24 }}>Bu işlem geri alınamaz.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>İptal</button>
                <button className="btn-primary" onClick={() => deleteLead(confirmDelete)} style={{ background: "#ef4444" }}>Evet, Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
