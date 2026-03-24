import { useState, useMemo, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

const EMPTY_FORM = { name: "", phone: "", il: "", ilce: "", kurum: "", sinavTipi: [], ogrenciSayisi: "", status: "yeni", note: "" };

const StatusBadge = ({ statusKey }) => {
  const s = STATUSES.find(x => x.key === statusKey) || STATUSES[0];
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>{s.label}</span>;
};

const SinavBadge = ({ types }) => (
  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
    {(types || []).map(t => (
      <span key={t} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: t==="TYT"?"#fef3c7":t==="AYT"?"#ede9fe":"#dcfce7", color: t==="TYT"?"#92400e":t==="AYT"?"#5b21b6":"#15803d" }}>{t}</span>
    ))}
  </div>
);

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("E-posta veya şifre hatalı.");
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f6f6f5", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background:"#fff", borderRadius:16, padding:"40px 32px", width:"100%", maxWidth:380, boxShadow:"0 4px 32px rgba(0,0,0,.08)" }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:500, letterSpacing:"-0.04em", marginBottom:8 }}>crm<span style={{ color:"#6366f1" }}>.</span></div>
        <div style={{ fontSize:13, color:"#aaa", marginBottom:28 }}>vintakip.com — Giriş Yap</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#999", letterSpacing:".07em", textTransform:"uppercase", display:"block", marginBottom:5 }}>E-posta</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ornek@mail.com" style={{ width:"100%", border:"1.5px solid #e8e8e8", borderRadius:10, padding:"10px 13px", fontSize:14, outline:"none", fontFamily:"inherit" }} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#999", letterSpacing:".07em", textTransform:"uppercase", display:"block", marginBottom:5 }}>Şifre</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{ width:"100%", border:"1.5px solid #e8e8e8", borderRadius:10, padding:"10px 13px", fontSize:14, outline:"none", fontFamily:"inherit" }} />
          </div>
          {error && <div style={{ fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ background:"#1a1a1a", color:"#fff", border:"none", padding:12, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", marginTop:4, opacity:loading?.6:1, fontFamily:"inherit" }}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}

// TOPLU YÜKLEME MODALI
function BulkImportModal({ onClose, onImport, userId }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = (file) => {
    setError(""); setRows([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!json.length) { setError("Dosya boş görünüyor."); return; }
        setRows(json);
      } catch {
        setError("Dosya okunamadı. Lütfen Excel veya CSV olduğundan emin olun.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([["Ad Soyad","Telefon","Kurum"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "sablonu_indir.xlsx");
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setLoading(true);
    const payload = rows.map(r => ({
      name: r["Ad Soyad"] || r["ad soyad"] || r["name"] || r["Name"] || "",
      phone: String(r["Telefon"] || r["telefon"] || r["phone"] || r["Phone"] || ""),
      kurum: r["Kurum"] || r["kurum"] || r["Kurum / Okul adı"] || r["school"] || "",
      status: "yeni",
      sinav_tipi: [],
      ogrenci_sayisi: 0,
      user_id: userId,
    })).filter(r => r.name);
    const { error } = await supabase.from("leads").insert(payload);
    if (error) setError("Yükleme sırasında hata oluştu.");
    else { setDone(true); onImport(); }
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ padding:"14px 20px 12px", borderBottom:"1px solid #f0f0f0", flexShrink:0 }}>
          <div style={{ width:36, height:4, background:"#e5e5e5", borderRadius:99, margin:"0 auto 12px" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontWeight:700, fontSize:16 }}>📥 Toplu Lead Yükle</div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#aaa" }}>×</button>
          </div>
        </div>

        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          {done ? (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{rows.length} kayıt başarıyla yüklendi!</div>
              <div style={{ fontSize:13, color:"#aaa" }}>Tüm leadler sisteme eklendi.</div>
            </div>
          ) : (
            <>
              {/* Şablon İndir */}
              <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#0369a1", marginBottom:4 }}>📋 Önce şablonu indirin</div>
                <div style={{ fontSize:12, color:"#0284c7", marginBottom:8 }}>Excel şablonunu doldurup yükleyin. Sütun adları tam eşleşmeli.</div>
                <button onClick={downloadTemplate} style={{ background:"#0ea5e9", color:"#fff", border:"none", padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  ⬇️ Şablon İndir (.xlsx)
                </button>
              </div>

              {/* Dosya Yükleme Alanı */}
              <div
                onDrop={handleDrop}
                onDragOver={e=>e.preventDefault()}
                onClick={() => document.getElementById("fileInput").click()}
                style={{ border:"2px dashed #e8e8e8", borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer", transition:"border-color .15s", background:"#fafafa" }}
              >
                <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Dosyayı buraya sürükleyin</div>
                <div style={{ fontSize:12, color:"#aaa", marginBottom:10 }}>veya tıklayarak seçin</div>
                <div style={{ fontSize:11, color:"#ccc" }}>.xlsx veya .csv desteklenir</div>
                <input id="fileInput" type="file" accept=".xlsx,.csv" style={{ display:"none" }} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])} />
              </div>

              {error && <div style={{ fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{error}</div>}

              {/* Önizleme */}
              {rows.length > 0 && (
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#999", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8 }}>
                    Önizleme — {rows.length} kayıt bulundu
                  </div>
                  <div style={{ border:"1px solid #f0f0f0", borderRadius:10, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"#f5f5f5", padding:"8px 12px" }}>
                      {["Ad Soyad","Telefon","Kurum"].map(h => (
                        <div key={h} style={{ fontSize:10, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:".06em" }}>{h}</div>
                      ))}
                    </div>
                    {rows.slice(0,5).map((r,i) => (
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", padding:"8px 12px", borderTop:"1px solid #f5f5f5", background: i%2===0?"#fff":"#fafafa" }}>
                        <div style={{ fontSize:12, fontWeight:500 }}>{r["Ad Soyad"]||r["name"]||r["Name"]||"—"}</div>
                        <div style={{ fontSize:12, color:"#666" }}>{r["Telefon"]||r["phone"]||r["Phone"]||"—"}</div>
                        <div style={{ fontSize:12, color:"#666" }}>{r["Kurum"]||r["kurum"]||"—"}</div>
                      </div>
                    ))}
                    {rows.length > 5 && (
                      <div style={{ padding:"8px 12px", fontSize:12, color:"#aaa", textAlign:"center", borderTop:"1px solid #f5f5f5" }}>
                        +{rows.length-5} kayıt daha…
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ padding:"12px 20px 20px", borderTop:"1px solid #f0f0f0", flexShrink:0, display:"flex", gap:8 }}>
          <button className="btn-ghost" style={{ flex:1 }} onClick={onClose}>{done ? "Kapat" : "İptal"}</button>
          {!done && (
            <button className="btn-primary" style={{ flex:2 }} onClick={handleImport} disabled={!rows.length||loading}>
              {loading ? "Yükleniyor..." : `${rows.length} Kaydı Yükle`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tümü");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_e, session) => setSession(session));
  }, []);

  useEffect(() => { if (session) fetchLeads(); }, [session]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.kurum?.toLowerCase().includes(q) || l.il?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "tümü" || l.status === filterStatus;
    return matchSearch && matchStatus;
  }), [leads, search, filterStatus]);

  const stats = useMemo(() => ({
    total: leads.length,
    kazanildi: leads.filter(l => l.status === "kazanildi").length,
    topOgrenci: leads.filter(l => l.status === "kazanildi").reduce((s, l) => s + (Number(l.ogrenci_sayisi)||0), 0),
    pipeline: leads.filter(l => !["kazanildi","kaybedildi"].includes(l.status)).reduce((s, l) => s + (Number(l.ogrenci_sayisi)||0), 0),
  }), [leads]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (lead) => {
    setForm({ name:lead.name||"", phone:lead.phone||"", il:lead.il||"", ilce:lead.ilce||"", kurum:lead.kurum||"", sinavTipi:lead.sinav_tipi||[], ogrenciSayisi:lead.ogrenci_sayisi||"", status:lead.status||"yeni", note:lead.note||"" });
    setModal(lead); setDetailId(null);
  };
  const toggleSinav = (key) => setForm(f => ({ ...f, sinavTipi: f.sinavTipi.includes(key) ? f.sinavTipi.filter(x=>x!==key) : [...f.sinavTipi, key] }));
  const saveForm = async () => {
    if (!form.name.trim()) return;
    const payload = { name:form.name, phone:form.phone, il:form.il, ilce:form.ilce, kurum:form.kurum, sinav_tipi:form.sinavTipi, ogrenci_sayisi:Number(form.ogrenciSayisi)||0, status:form.status, note:form.note, user_id:session.user.id };
    if (modal === "add") await supabase.from("leads").insert([payload]);
    else await supabase.from("leads").update(payload).eq("id", modal.id);
    setModal(null); fetchLeads();
  };
  const deleteLead = async (id) => {
    await supabase.from("leads").delete().eq("id", id);
    setConfirmDelete(null); setModal(null); setDetailId(null); fetchLeads();
  };
  const inp = (field) => ({ value: form[field], onChange: e => setForm(f => ({ ...f, [field]: e.target.value })) });
  const currentLead = detailId ? leads.find(l => l.id === detailId) : null;

  if (!session) return <LoginScreen />;

  return (
    <div style={{ minHeight:"100vh", background:"#f6f6f5", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:inherit}
        .card-hover{transition:box-shadow .15s,transform .12s;cursor:pointer}
        .card-hover:hover{box-shadow:0 4px 18px rgba(0,0,0,.09);transform:translateY(-1px)}
        .btn-primary{background:#1a1a1a;color:#fff;border:none;padding:11px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}
        .btn-primary:hover{opacity:.82}
        .btn-primary:disabled{opacity:.4;cursor:not-allowed}
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

      {/* TOP BAR */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ebebeb", padding:"0 16px", display:"flex", alignItems:"center", height:56, gap:10, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontWeight:500, fontSize:18, letterSpacing:"-0.04em" }}>crm<span style={{ color:"#6366f1" }}>.</span></div>
        <div style={{ flex:1 }} />
        <button className="btn-ghost" onClick={() => setShowImport(true)} style={{ fontSize:12, padding:"6px 12px" }}>📥 Toplu Yükle</button>
        <button className="btn-ghost" onClick={() => supabase.auth.signOut()} style={{ fontSize:12, padding:"6px 12px" }}>Çıkış</button>
        <button className="btn-primary" onClick={openAdd} style={{ padding:"8px 14px", display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
          <span style={{ fontSize:17, lineHeight:1 }}>+</span> Yeni
        </button>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { label:"Toplam Lead", value:stats.total, icon:"👥" },
            { label:"Kazanılan", value:stats.kazanildi, icon:"✅" },
            { label:"Kazanılan Öğrenci", value:stats.topOgrenci.toLocaleString("tr"), icon:"🎓" },
            { label:"Pipeline Öğrenci", value:stats.pipeline.toLocaleString("tr"), icon:"🔥" },
          ].map(s => (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.04em", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#bbb", marginTop:4, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#ccc", fontSize:15 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="İsim, kurum veya il ara…" style={{ width:"100%", border:"1.5px solid #e8e8e8", borderRadius:10, padding:"10px 13px 10px 38px", fontSize:14, outline:"none", background:"#fff" }} />
        </div>

        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
          {[{ key:"tümü", label:"Tümü" }, ...STATUSES].map(s => {
            const active = filterStatus === s.key;
            return <button key={s.key} className="chip-filter" onClick={()=>setFilterStatus(s.key)} style={{ background:active?"#1a1a1a":"#fff", color:active?"#fff":"#666", borderColor:active?"#1a1a1a":"#e8e8e8" }}>{s.label}</button>;
          })}
        </div>

        {loading && <div style={{ textAlign:"center", padding:"48px 20px", color:"#ccc", fontSize:14 }}>Yükleniyor…</div>}
        {!loading && filtered.length===0 && <div style={{ textAlign:"center", padding:"48px 20px", color:"#ccc", fontSize:14 }}>Kayıt bulunamadı.</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(lead => (
            <div key={lead.id} className="card-hover" onClick={()=>setDetailId(lead.id)} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{lead.name}</div>
                  <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{lead.kurum}</div>
                </div>
                <StatusBadge statusKey={lead.status} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                <SinavBadge types={lead.sinav_tipi} />
                <div style={{ display:"flex", gap:10, fontSize:12, color:"#999" }}>
                  {lead.il && <span>📍 {lead.il}</span>}
                  {lead.ogrenci_sayisi > 0 && <span>🎓 {lead.ogrenci_sayisi}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, fontSize:12, color:"#ccc", textAlign:"center" }}>{filtered.length} kayıt</div>
      </div>

      {/* DETAIL */}
      {currentLead && (
        <div className="detail-overlay" onClick={e=>e.target===e.currentTarget&&setDetailId(null)}>
          <div className="detail-panel">
            <div style={{ padding:"16px 20px 0" }}>
              <div style={{ width:36, height:4, background:"#e5e5e5", borderRadius:99, margin:"0 auto 14px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div><div style={{ fontWeight:700, fontSize:18 }}>{currentLead.name}</div><div style={{ fontSize:13, color:"#aaa" }}>{currentLead.kurum}</div></div>
                <StatusBadge statusKey={currentLead.status} />
              </div>
            </div>
            <div style={{ padding:"0 20px 24px", display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { icon:"📞", label:"Telefon", val:currentLead.phone||"—" },
                { icon:"📍", label:"Konum", val:[currentLead.ilce,currentLead.il].filter(Boolean).join(" / ")||"—" },
                { icon:"🎓", label:"Öğrenci Sayısı", val:`${currentLead.ogrenci_sayisi||0} öğrenci` },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:38, height:38, background:"#f5f5f5", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize:10, color:"#bbb", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>{r.label}</div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{r.val}</div>
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize:10, color:"#bbb", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", marginBottom:6 }}>Sınav Tipi</div>
                <SinavBadge types={currentLead.sinav_tipi} />
              </div>
              {currentLead.note && (
                <div style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:10, color:"#bbb", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", marginBottom:4 }}>Not</div>
                  <div style={{ fontSize:13, color:"#555" }}>{currentLead.note}</div>
                </div>
              )}
              <div style={{ display:"flex", gap:8, paddingTop:4 }}>
                <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setDetailId(null)}>Kapat</button>
                <button className="btn-primary" style={{ flex:2 }} onClick={()=>openEdit(currentLead)}>✏️ Düzenle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {modal && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div style={{ padding:"14px 20px 12px", borderBottom:"1px solid #f0f0f0", flexShrink:0 }}>
              <div style={{ width:36, height:4, background:"#e5e5e5", borderRadius:99, margin:"0 auto 12px" }} />
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontWeight:700, fontSize:16 }}>{modal==="add"?"Yeni Lead Ekle":"Lead Düzenle"}</div>
                <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#aaa" }}>×</button>
              </div>
            </div>
            <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>
              <div className="field"><label>Ad Soyad *</label><input {...inp("name")} placeholder="Örn: Ahmet Yılmaz" /></div>
              <div className="field"><label>Telefon No</label><input {...inp("phone")} placeholder="05__ ___ __ __" type="tel" /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div className="field"><label>İl</label><select {...inp("il")}><option value="">Seçiniz</option>{ILLER.map(il=><option key={il}>{il}</option>)}</select></div>
                <div className="field"><label>İlçe</label><input {...inp("ilce")} placeholder="İlçe adı" /></div>
              </div>
              <div className="field"><label>Kurum İsmi</label><input {...inp("kurum")} placeholder="Örn: Gelecek Dershanesi" /></div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#999", letterSpacing:".07em", textTransform:"uppercase", marginBottom:4 }}>Sınav Tipi</div>
                <div style={{ fontSize:11, color:"#ccc", marginBottom:8 }}>Birden fazla seçilebilir</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {SINAV_TIPLERI.map(s => {
                    const active = form.sinavTipi.includes(s.key);
                    return (
                      <button key={s.key} type="button" className={`sinav-btn${active?" active":""}`} onClick={()=>toggleSinav(s.key)}>
                        <div style={{ fontWeight:700, fontSize:16 }}>{s.label}</div>
                        <div style={{ fontSize:9, opacity:.65, marginTop:2 }}>{s.desc}</div>
                        {active && <div style={{ fontSize:14, marginTop:4 }}>✓</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="field"><label>Öğrenci Sayısı</label><input {...inp("ogrenciSayisi")} type="number" min="0" placeholder="Örn: 150" /></div>
              <div className="field"><label>Durum</label><select {...inp("status")}>{STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
              <div className="field"><label>Not</label><textarea {...inp("note")} rows={3} placeholder="Ek notlar…" style={{ resize:"vertical" }} /></div>
            </div>
            <div style={{ padding:"12px 20px 20px", borderTop:"1px solid #f0f0f0", flexShrink:0, display:"flex", gap:8 }}>
              {modal!=="add" && <button className="btn-ghost" onClick={()=>setConfirmDelete(modal.id)} style={{ color:"#ef4444", borderColor:"#fecaca" }}>Sil</button>}
              <button className="btn-ghost" onClick={()=>setModal(null)}>İptal</button>
              <button className="btn-primary" onClick={saveForm} style={{ flex:1 }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {confirmDelete && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setConfirmDelete(null)}>
          <div className="modal">
            <div style={{ padding:"32px 24px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Bu lead'i silmek istiyor musunuz?</div>
              <div style={{ fontSize:13, color:"#aaa", marginBottom:24 }}>Bu işlem geri alınamaz.</div>
              <div style={{ display:"flex", gap:10 }}>
                <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setConfirmDelete(null)}>İptal</button>
                <button className="btn-primary" onClick={()=>deleteLead(confirmDelete)} style={{ background:"#ef4444" }}>Evet, Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT */}
      {showImport && <BulkImportModal onClose={()=>setShowImport(false)} onImport={fetchLeads} userId={session.user.id} />}
    </div>
  );
}
