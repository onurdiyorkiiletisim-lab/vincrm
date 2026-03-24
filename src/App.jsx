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

const EMPTY_FORM = { name:"", phone:"", il:"", ilce:"", kurum:"", sinavTipi:[], ogrenciSayisi:"", status:"yeni", note:"" };

const StatusBadge = ({ statusKey }) => {
  const s = STATUSES.find(x => x.key === statusKey) || STATUSES[0];
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, color:s.color, background:s.bg, whiteSpace:"nowrap" }}>{s.label}</span>;
};

const SinavBadge = ({ types }) => (
  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
    {(types||[]).map(t => (
      <span key={t} style={{ padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700, background:t==="TYT"?"#fef3c7":t==="AYT"?"#ede9fe":"#dcfce7", color:t==="TYT"?"#92400e":t==="AYT"?"#5b21b6":"#15803d" }}>{t}</span>
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
          <div><label style={{ fontSize:11, fontWeight:700, color:"#999", letterSpacing:".07em", textTransform:"uppercase", display:"block", marginBottom:5 }}>E-posta</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ornek@mail.com" style={{ width:"100%", border:"1.5px solid #e8e8e8", borderRadius:10, padding:"10px 13px", fontSize:14, outline:"none", fontFamily:"inherit" }} /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:"#999", letterSpacing:".07em", textTransform:"uppercase", display:"block", marginBottom:5 }}>Şifre</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{ width:"100%", border:"1.5px solid #e8e8e8", borderRadius:10, padding:"10px 13px", fontSize:14, outline:"none", fontFamily:"inherit" }} /></div>
          {error && <div style={{ fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ background:"#1a1a1a", color:"#fff", border:"none", padding:12, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", marginTop:4, opacity:loading?.6:1, fontFamily:"inherit" }}>
            {loading?"Giriş yapılıyor...":"Giriş Yap"}</button>
        </div>
      </div>
    </div>
  );
}

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
        const wb = XLSX.read(data, { type:"array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval:"" });
        if (!json.length) { setError("Dosya boş görünüyor."); return; }
        setRows(json);
      } catch { setError("Dosya okunamadı."); }
    };
    reader.readAsArrayBuffer(file);
  };
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([["Ad Soyad","Telefon","Kurum"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "sablon.xlsx");
  };
  const handleImport = async () => {
    if (!rows.length) return;
    setLoading(true);
    const payload = rows.map(r => ({
      name: r["Ad Soyad"]||r["ad soyad"]||r["name"]||r["Name"]||r["full_name"]||r["Full Name"]||r["first_name"]||"",
      phone: String(r["Telefon"]||r["telefon"]||r["phone"]||r["Phone Number"]||r["phone_number"]||""),
      kurum: r["Kurum"]||r["kurum"]||r["school"]||r["School"]||"",
      status:"yeni", sinav_tipi:[], ogrenci_sayisi:0, user_id:userId,
    })).filter(r => r.name||r.phone);
    const { error } = await supabase.from("leads").insert(payload);
    if (error) setError("Yükleme hatası: "+error.message);
    else { setDone(true); onImport(); }
    setLoading(false);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff", width:"100%", maxWidth:520, borderRadius:"20px 20px 0 0", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"12px 20px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>📥 Toplu Lead Yükle</div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:"50%", background:"#f5f5f5", border:"none", fontSize:18, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
          {done ? (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
              <div style={{ fontWeight:700, fontSize:16 }}>{rows.length} kayıt yüklendi!</div>
            </div>
          ) : (
            <>
              <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#0369a1", marginBottom:6 }}>📋 Önce şablonu indirin</div>
                <button onClick={downloadTemplate} style={{ background:"#0ea5e9", color:"#fff", border:"none", padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>⬇️ Şablon İndir (.xlsx)</button>
              </div>
              <div onClick={()=>document.getElementById("fileInput").click()} style={{ border:"2px dashed #e8e8e8", borderRadius:12, padding:"24px 20px", textAlign:"center", cursor:"pointer", background:"#fafafa" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Dosyayı seçin</div>
                <div style={{ fontSize:12, color:"#aaa" }}>.xlsx veya .csv</div>
                <input id="fileInput" type="file" accept=".xlsx,.csv" style={{ display:"none" }} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])} />
              </div>
              {error && <div style={{ fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{error}</div>}
              {rows.length>0 && <div style={{ fontSize:13, color:"#10b981", background:"#ecfdf5", padding:"8px 12px", borderRadius:8, fontWeight:600 }}>✅ {rows.length} kayıt hazır!</div>}
            </>
          )}
        </div>
        <div style={{ padding:"12px 20px 24px", borderTop:"1px solid #f0f0f0", display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={onClose} style={{ flex:1, background:"transparent", border:"1.5px solid #e5e5e5", padding:"11px", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer" }}>{done?"Kapat":"İptal"}</button>
          {!done && <button onClick={handleImport} disabled={!rows.length||loading} style={{ flex:2, background:"#1a1a1a", color:"#fff", border:"none", padding:"11px", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", opacity:(!rows.length||loading)?.4:1 }}>{loading?"Yükleniyor...":rows.length>0?`${rows.length} Kaydı Yükle`:"Dosya Seçin"}</button>}
        </div>
      </div>
    </div>
  );
}

// RAPOR SAYFASI
function RaporSayfasi({ leads }) {
  const statusDagilim = STATUSES.map(s => ({
    ...s,
    sayi: leads.filter(l => l.status === s.key).length,
    oran: leads.length ? Math.round(leads.filter(l => l.status === s.key).length / leads.length * 100) : 0,
  }));

  const sinavDagilim = SINAV_TIPLERI.map(s => ({
    ...s,
    sayi: leads.filter(l => (l.sinav_tipi||[]).includes(s.key)).length,
  }));

  const ilDagilim = useMemo(() => {
    const map = {};
    leads.forEach(l => { if (l.il) map[l.il] = (map[l.il]||0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,8);
  }, [leads]);

  const aylikDagilim = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      if (l.created_at) {
        const ay = l.created_at.slice(0,7);
        map[ay] = (map[ay]||0) + 1;
      }
    });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).slice(-6);
  }, [leads]);

  const maxAylik = Math.max(...aylikDagilim.map(a => a[1]), 1);
  const maxIl = Math.max(...ilDagilim.map(i => i[1]), 1);

  const toplamOgrenci = leads.reduce((s,l) => s+(Number(l.ogrenci_sayisi)||0), 0);
  const kazanilanOgrenci = leads.filter(l=>l.status==="kazanildi").reduce((s,l) => s+(Number(l.ogrenci_sayisi)||0), 0);
  const kazanmaOrani = leads.filter(l=>["kazanildi","kaybedildi"].includes(l.status)).length
    ? Math.round(leads.filter(l=>l.status==="kazanildi").length / leads.filter(l=>["kazanildi","kaybedildi"].includes(l.status)).length * 100)
    : 0;

  return (
    <div style={{ padding:"14px", maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Özet Kartlar */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { icon:"👥", label:"Toplam Lead", value:leads.length },
          { icon:"🏆", label:"Kazanma Oranı", value:`%${kazanmaOrani}` },
          { icon:"🎓", label:"Toplam Öğrenci", value:toplamOgrenci.toLocaleString("tr") },
          { icon:"✅", label:"Kazanılan Öğrenci", value:kazanilanOgrenci.toLocaleString("tr") },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.03em" }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#bbb", marginTop:3, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Durum Dağılımı */}
      <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"16px" }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>📊 Durum Dağılımı</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {statusDagilim.map(s => (
            <div key={s.key}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:500 }}>{s.label}</span>
                <span style={{ fontSize:13, color:"#888" }}>{s.sayi} lead — %{s.oran}</span>
              </div>
              <div style={{ height:8, background:"#f5f5f5", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${s.oran}%`, background:s.color, borderRadius:99, transition:"width .3s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aylık Lead Grafiği */}
      {aylikDagilim.length > 0 && (
        <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"16px" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>📈 Aylık Lead Girişi</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100 }}>
            {aylikDagilim.map(([ay, sayi]) => (
              <div key={ay} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#6366f1" }}>{sayi}</div>
                <div style={{ width:"100%", background:"#6366f1", borderRadius:"4px 4px 0 0", height:`${(sayi/maxAylik)*80}px`, minHeight:4, transition:"height .3s" }} />
                <div style={{ fontSize:9, color:"#bbb", textAlign:"center" }}>{ay.slice(5)}/{ay.slice(2,4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sınav Tipi Dağılımı */}
      <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"16px" }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>🎓 Sınav Tipi Dağılımı</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {sinavDagilim.map(s => (
            <div key={s.key} style={{ textAlign:"center", background:"#f9f9f9", borderRadius:10, padding:"12px 8px" }}>
              <div style={{ fontSize:20, fontWeight:700, color: s.key==="TYT"?"#92400e":s.key==="AYT"?"#5b21b6":"#15803d" }}>{s.sayi}</div>
              <div style={{ fontSize:12, fontWeight:700, marginTop:2 }}>{s.label}</div>
              <div style={{ fontSize:10, color:"#bbb" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* İllere Göre Dağılım */}
      {ilDagilim.length > 0 && (
        <div style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"16px" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>🗺️ İllere Göre Dağılım (Top 8)</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {ilDagilim.map(([il, sayi]) => (
              <div key={il}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{il}</span>
                  <span style={{ fontSize:13, color:"#888" }}>{sayi}</span>
                </div>
                <div style={{ height:6, background:"#f5f5f5", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(sayi/maxIl)*100}%`, background:"#3b82f6", borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [aktifSayfa, setAktifSayfa] = useState("leads"); // "leads" | "rapor"

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    supabase.auth.onAuthStateChange((_e,session)=>setSession(session));
  }, []);

  useEffect(() => { if(session) fetchLeads(); }, [session]);

  const fetchLeads = async () => {
    setLoading(true);
    const {data} = await supabase.from("leads").select("*").order("created_at",{ascending:false});
    setLeads(data||[]);
    setLoading(false);
  };

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q||l.name?.toLowerCase().includes(q)||l.kurum?.toLowerCase().includes(q)||l.il?.toLowerCase().includes(q);
    const matchStatus = filterStatus==="tümü"||l.status===filterStatus;
    return matchSearch&&matchStatus;
  }), [leads,search,filterStatus]);

  const stats = useMemo(() => ({
    total: leads.length,
    kazanildi: leads.filter(l=>l.status==="kazanildi").length,
    topOgrenci: leads.filter(l=>l.status==="kazanildi").reduce((s,l)=>s+(Number(l.ogrenci_sayisi)||0),0),
  }), [leads]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (lead) => {
    setForm({ name:lead.name||"", phone:lead.phone||"", il:lead.il||"", ilce:lead.ilce||"", kurum:lead.kurum||"", sinavTipi:lead.sinav_tipi||[], ogrenciSayisi:lead.ogrenci_sayisi||"", status:lead.status||"yeni", note:lead.note||"" });
    setModal(lead); setDetailId(null);
  };
  const toggleSinav = (key) => setForm(f=>({...f, sinavTipi:f.sinavTipi.includes(key)?f.sinavTipi.filter(x=>x!==key):[...f.sinavTipi,key]}));
  const saveForm = async () => {
    if (!form.name.trim()) return;
    const payload = { name:form.name, phone:form.phone, il:form.il, ilce:form.ilce, kurum:form.kurum, sinav_tipi:form.sinavTipi, ogrenci_sayisi:Number(form.ogrenciSayisi)||0, status:form.status, note:form.note, user_id:session.user.id };
    if (modal==="add") await supabase.from("leads").insert([payload]);
    else await supabase.from("leads").update(payload).eq("id",modal.id);
    setModal(null); fetchLeads();
  };
  const deleteLead = async (id) => {
    await supabase.from("leads").delete().eq("id",id);
    setConfirmDelete(null); setModal(null); setDetailId(null); fetchLeads();
  };
  const inp = (field) => ({ value:form[field], onChange:e=>setForm(f=>({...f,[field]:e.target.value})) });
  const currentLead = detailId ? leads.find(l=>l.id===detailId) : null;

  if (!session) return <LoginScreen />;

  return (
    <div style={{ minHeight:"100vh", background:"#f6f6f5", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#1a1a1a", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:inherit}
        .card-hover{transition:box-shadow .15s;cursor:pointer}
        .card-hover:active{opacity:.85}
        .btn-primary{background:#1a1a1a;color:#fff;border:none;padding:11px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer}
        .btn-primary:disabled{opacity:.4;cursor:not-allowed}
        .btn-ghost{background:transparent;border:1.5px solid #e5e5e5;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;color:#555}
        .field label{display:block;font-size:11px;font-weight:700;color:#999;letter-spacing:.07em;text-transform:uppercase;margin-bottom:5px}
        .field input,.field select,.field textarea{width:100%;border:1.5px solid #e8e8e8;border-radius:10px;padding:10px 13px;font-size:14px;outline:none;background:#fff;color:#1a1a1a}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#1a1a1a}
        .sinav-btn{border:2px solid #e8e8e8;border-radius:10px;padding:10px 8px;cursor:pointer;background:#fff;transition:all .15s;text-align:center;width:100%}
        .sinav-btn.active{border-color:#1a1a1a;background:#1a1a1a;color:#fff}
        .chip-filter{padding:7px 13px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid transparent;white-space:nowrap;background:none}
        .close-btn{width:40px;height:40px;border-radius:50%;background:#f0f0f0;border:none;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#444;flex-shrink:0}
        .bottom-sheet{background:#fff;width:100%;border-radius:20px 20px 0 0;max-height:88vh;display:flex;flex-direction:column}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:flex-end;justify-content:center}
        @media(min-width:600px){.overlay{align-items:center}.bottom-sheet{border-radius:16px;max-width:500px;max-height:85vh}}
        .nav-btn{background:none;border:none;padding:6px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:#888;transition:all .15s}
        .nav-btn.active{background:#1a1a1a;color:#fff}
      `}</style>

      {/* TOP BAR */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ebebeb", padding:"0 14px", display:"flex", alignItems:"center", height:54, gap:8, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontWeight:500, fontSize:17, letterSpacing:"-0.04em" }}>crm<span style={{ color:"#6366f1" }}>.</span></div>
        {/* NAVİGASYON */}
        <div style={{ display:"flex", gap:4, marginLeft:8 }}>
          <button className={`nav-btn${aktifSayfa==="leads"?" active":""}`} onClick={()=>setAktifSayfa("leads")}>Leads</button>
          <button className={`nav-btn${aktifSayfa==="rapor"?" active":""}`} onClick={()=>setAktifSayfa("rapor")}>📊 Rapor</button>
        </div>
        <div style={{ flex:1 }} />
        <button onClick={()=>setShowImport(true)} style={{ background:"#f5f5f5", border:"none", padding:"7px 11px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", color:"#444" }}>📥</button>
        <button onClick={()=>supabase.auth.signOut()} style={{ background:"#f5f5f5", border:"none", padding:"7px 11px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", color:"#444" }}>Çıkış</button>
        <button onClick={openAdd} style={{ background:"#1a1a1a", color:"#fff", border:"none", padding:"8px 14px", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:18, lineHeight:1 }}>+</span> Yeni
        </button>
      </div>

      {/* RAPOR SAYFASI */}
      {aktifSayfa==="rapor" && <RaporSayfasi leads={leads} />}

      {/* LEADS SAYFASI */}
      {aktifSayfa==="leads" && (
        <div style={{ padding:"14px", maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            {[
              { label:"Toplam Lead", value:stats.total, icon:"👥" },
              { label:"Kazanılan", value:stats.kazanildi, icon:"✅" },
              { label:"Kazanılan Öğrenci", value:stats.topOgrenci.toLocaleString("tr"), icon:"🎓" },
            ].map(s => (
              <div key={s.label} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"12px 10px" }}>
                <div style={{ fontSize:18, marginBottom:5 }}>{s.icon}</div>
                <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.03em", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:10, color:"#bbb", marginTop:4, fontWeight:500, lineHeight:1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ position:"relative", marginBottom:10 }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#ccc", fontSize:15 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="İsim, kurum veya il ara…" style={{ width:"100%", border:"1.5px solid #e8e8e8", borderRadius:10, padding:"10px 13px 10px 38px", fontSize:14, outline:"none", background:"#fff" }} />
          </div>

          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6, marginBottom:12, WebkitOverflowScrolling:"touch" }}>
            {[{key:"tümü",label:"Tümü"},...STATUSES].map(s => {
              const active = filterStatus===s.key;
              return <button key={s.key} className="chip-filter" onClick={()=>setFilterStatus(s.key)} style={{ background:active?"#1a1a1a":"#fff", color:active?"#fff":"#666", borderColor:active?"#1a1a1a":"#e8e8e8" }}>{s.label}</button>;
            })}
          </div>

          {loading && <div style={{ textAlign:"center", padding:"40px", color:"#ccc" }}>Yükleniyor…</div>}
          {!loading && filtered.length===0 && <div style={{ textAlign:"center", padding:"40px", color:"#ccc" }}>Kayıt bulunamadı.</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {filtered.map(lead => (
              <div key={lead.id} className="card-hover" onClick={()=>setDetailId(lead.id)} style={{ background:"#fff", border:"1px solid #ebebeb", borderRadius:12, padding:"13px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ flex:1, minWidth:0, marginRight:8 }}>
                    <div style={{ fontWeight:700, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{lead.name}</div>
                    <div style={{ fontSize:12, color:"#aaa", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{lead.kurum||"—"}</div>
                  </div>
                  <StatusBadge statusKey={lead.status} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                  <SinavBadge types={lead.sinav_tipi} />
                  <div style={{ display:"flex", gap:8, fontSize:11, color:"#bbb" }}>
                    {lead.il && <span>📍{lead.il}</span>}
                    {lead.ogrenci_sayisi>0 && <span>🎓{lead.ogrenci_sayisi}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, fontSize:12, color:"#ccc", textAlign:"center" }}>{filtered.length} kayıt</div>
        </div>
      )}

      {/* DETAIL */}
      {currentLead && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setDetailId(null)}>
          <div className="bottom-sheet">
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"relative" }}>
              <div style={{ position:"absolute", width:36, height:4, background:"#e5e5e5", borderRadius:99, left:"50%", transform:"translateX(-50%)", top:8 }} />
              <div style={{ paddingTop:8 }}>
                <div style={{ fontWeight:700, fontSize:16 }}>{currentLead.name}</div>
                <div style={{ fontSize:12, color:"#aaa" }}>{currentLead.kurum}</div>
              </div>
              <button className="close-btn" onClick={()=>setDetailId(null)}>×</button>
            </div>
            <div style={{ overflowY:"auto", flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:12 }}>
              <StatusBadge statusKey={currentLead.status} />
              {[
                { icon:"📞", label:"Telefon", val:currentLead.phone||"—" },
                { icon:"📍", label:"Konum", val:[currentLead.ilce,currentLead.il].filter(Boolean).join(" / ")||"—" },
                { icon:"🎓", label:"Öğrenci", val:`${currentLead.ogrenci_sayisi||0} öğrenci` },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:38, height:38, background:"#f5f5f5", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize:10, color:"#bbb", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{r.label}</div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{r.val}</div>
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize:10, color:"#bbb", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Sınav Tipi</div>
                <SinavBadge types={currentLead.sinav_tipi} />
              </div>
              {currentLead.note && (
                <div style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#bbb", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:4 }}>Not</div>
                  <div style={{ fontSize:13, color:"#555" }}>{currentLead.note}</div>
                </div>
              )}
            </div>
            <div style={{ padding:"10px 16px 24px", borderTop:"1px solid #f0f0f0", display:"flex", gap:8, flexShrink:0 }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setDetailId(null)}>Kapat</button>
              <button className="btn-primary" style={{ flex:2 }} onClick={()=>openEdit(currentLead)}>✏️ Düzenle</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT */}
      {modal && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="bottom-sheet">
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"relative" }}>
              <div style={{ position:"absolute", width:36, height:4, background:"#e5e5e5", borderRadius:99, left:"50%", transform:"translateX(-50%)", top:8 }} />
              <div style={{ fontWeight:700, fontSize:15, paddingTop:8 }}>{modal==="add"?"Yeni Lead Ekle":"Lead Düzenle"}</div>
              <button className="close-btn" onClick={()=>setModal(null)}>×</button>
            </div>
            <div style={{ overflowY:"auto", flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:12 }}>
              <div className="field"><label>Ad Soyad *</label><input {...inp("name")} placeholder="Örn: Ahmet Yılmaz" /></div>
              <div className="field"><label>Telefon No</label><input {...inp("phone")} placeholder="05__ ___ __ __" type="tel" /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div className="field"><label>İl</label><select {...inp("il")}><option value="">Seçiniz</option>{ILLER.map(il=><option key={il}>{il}</option>)}</select></div>
                <div className="field"><label>İlçe</label><input {...inp("ilce")} placeholder="İlçe" /></div>
              </div>
              <div className="field"><label>Kurum İsmi</label><input {...inp("kurum")} placeholder="Örn: Gelecek Dershanesi" /></div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#999", letterSpacing:".07em", textTransform:"uppercase", marginBottom:8 }}>Sınav Tipi <span style={{ fontWeight:400, color:"#ccc", textTransform:"none", letterSpacing:0 }}>(çoklu seçim)</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {SINAV_TIPLERI.map(s => {
                    const active = form.sinavTipi.includes(s.key);
                    return (
                      <button key={s.key} type="button" className={`sinav-btn${active?" active":""}`} onClick={()=>toggleSinav(s.key)}>
                        <div style={{ fontWeight:700, fontSize:15 }}>{s.label}</div>
                        <div style={{ fontSize:9, opacity:.65, marginTop:2 }}>{s.desc}</div>
                        {active&&<div style={{ fontSize:13, marginTop:3 }}>✓</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="field"><label>Öğrenci Sayısı</label><input {...inp("ogrenciSayisi")} type="number" min="0" placeholder="Örn: 150" /></div>
              <div className="field"><label>Durum</label><select {...inp("status")}>{STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
              <div className="field"><label>Not</label><textarea {...inp("note")} rows={3} placeholder="Ek notlar…" style={{ resize:"vertical" }} /></div>
            </div>
            <div style={{ padding:"10px 16px 24px", borderTop:"1px solid #f0f0f0", display:"flex", gap:8, flexShrink:0 }}>
              {modal!=="add"&&<button className="btn-ghost" onClick={()=>setConfirmDelete(modal.id)} style={{ color:"#ef4444", borderColor:"#fecaca" }}>Sil</button>}
              <button className="btn-ghost" onClick={()=>setModal(null)}>İptal</button>
              <button className="btn-primary" onClick={saveForm} style={{ flex:1 }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {confirmDelete && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setConfirmDelete(null)}>
          <div className="bottom-sheet">
            <div style={{ padding:"32px 24px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Silmek istiyor musunuz?</div>
              <div style={{ fontSize:13, color:"#aaa", marginBottom:24 }}>Bu işlem geri alınamaz.</div>
              <div style={{ display:"flex", gap:10 }}>
                <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setConfirmDelete(null)}>İptal</button>
                <button className="btn-primary" onClick={()=>deleteLead(confirmDelete)} style={{ flex:1, background:"#ef4444" }}>Evet, Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImport&&<BulkImportModal onClose={()=>setShowImport(false)} onImport={fetchLeads} userId={session.user.id} />}
    </div>
  );
}
