import { useState, useMemo, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ACCENT = "#FF6B35";
const ACCENT2 = "#FF8C5A";
const DARK = "#1A1A2E";
const CARD_BG = "#FFFFFF";

const STATUSES = [
  { key:"yeni",       label:"Yeni",             color:"#7C3AED", bg:"#EDE9FE" },
  { key:"iletisim",   label:"İletişimde",        color:"#D97706", bg:"#FEF3C7" },
  { key:"teklif",     label:"Teklif Gönderildi", color:"#2563EB", bg:"#DBEAFE" },
  { key:"kazanildi",  label:"Kazanıldı",         color:"#059669", bg:"#D1FAE5" },
  { key:"kaybedildi", label:"Kaybedildi",        color:"#DC2626", bg:"#FEE2E2" },
];
const SINAV_TIPLERI = [
  { key:"TYT", label:"TYT", desc:"Temel Yeterlilik" },
  { key:"AYT", label:"AYT", desc:"Alan Yeterlilik" },
  { key:"LGS", label:"LGS", desc:"Liseye Geçiş" },
];
const ILLER = ["Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Şanlıurfa","Siirt","Sinop","Şırnak","Sivas","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"];

const EMPTY_FORM = { name:"",phone:"",il:"",ilce:"",kurum:"",sinavTipi:[],ogrenciSayisi:"",status:"yeni",note:"" };
const EMPTY_FIRMA = { firma_adi:"",tutar:"",odeme_tipi:"faturali",ertugrul:"",burak:"",onur:"",notlar:"" };

const buAy = () => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; };
const ayLabel = (ay) => { const [y,m]=ay.split("-"); return `${["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"][+m-1]} ${y}`; };

const S = {
  overlay: { position:"fixed",inset:0,background:"rgba(26,26,46,.6)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" },
  sheet: { background:"#fff",width:"100%",maxWidth:520,borderRadius:"24px 24px 0 0",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.15)" },
  closeBtn: { width:40,height:40,borderRadius:"50%",background:"#F3F4F6",border:"none",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7280",flexShrink:0 },
  field: { display:"flex",flexDirection:"column",gap:6 },
  label: { fontSize:11,fontWeight:700,color:"#9CA3AF",letterSpacing:".08em",textTransform:"uppercase" },
  input: { border:"2px solid #F3F4F6",borderRadius:12,padding:"11px 14px",fontSize:14,outline:"none",background:"#FAFAFA",color:"#1A1A2E",fontFamily:"inherit",width:"100%",transition:"border-color .2s" },
  btnPrimary: { background:`linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,color:"#fff",border:"none",padding:"13px 20px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 15px rgba(255,107,53,.35)` },
  btnGhost: { background:"transparent",border:"2px solid #E5E7EB",padding:"11px 16px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",color:"#6B7280",fontFamily:"inherit" },
};

const StatusBadge = ({statusKey}) => {
  const s = STATUSES.find(x=>x.key===statusKey)||STATUSES[0];
  return <span style={{display:"inline-block",padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:700,color:s.color,background:s.bg,whiteSpace:"nowrap"}}>{s.label}</span>;
};
const SinavBadge = ({types}) => (
  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
    {(types||[]).map(t=><span key={t} style={{padding:"3px 9px",borderRadius:8,fontSize:11,fontWeight:700,background:t==="TYT"?"#FEF3C7":t==="AYT"?"#EDE9FE":"#D1FAE5",color:t==="TYT"?"#92400E":t==="AYT"?"#5B21B6":"#065F46"}}>{t}</span>)}
  </div>
);

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const handleLogin = async()=>{ setLoading(true);setError(""); const{error}=await supabase.auth.signInWithPassword({email,password}); if(error)setError("E-posta veya şifre hatalı."); setLoading(false); };
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans','Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .login-input:focus{border-color:${ACCENT} !important;background:#fff !important;box-shadow:0 0 0 4px rgba(255,107,53,.1)}
      `}</style>
      {/* Dekoratif daireler */}
      <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:"rgba(255,107,53,.08)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-150,left:-100,width:500,height:500,borderRadius:"50%",background:"rgba(255,140,90,.06)",pointerEvents:"none"}}/>

      <div style={{background:"rgba(255,255,255,.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:24,padding:"40px 32px",width:"100%",maxWidth:380,position:"relative",zIndex:1}}>
        {/* Logo */}
        <div style={{marginBottom:32,textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,borderRadius:20,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,marginBottom:16,boxShadow:`0 8px 24px rgba(255,107,53,.4)`}}>
            <span style={{fontSize:28}}>🎯</span>
          </div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:500,color:"#fff",letterSpacing:"-0.04em"}}>vin<span style={{color:ACCENT}}>takip</span></div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginTop:4}}>CRM Sistemi</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={S.field}>
            <label style={{...S.label,color:"rgba(255,255,255,.5)"}}>E-posta</label>
            <input className="login-input" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ornek@mail.com"
              style={{...S.input,background:"rgba(255,255,255,.08)",border:"2px solid rgba(255,255,255,.1)",color:"#fff"}}/>
          </div>
          <div style={S.field}>
            <label style={{...S.label,color:"rgba(255,255,255,.5)"}}>Şifre</label>
            <input className="login-input" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••"
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              style={{...S.input,background:"rgba(255,255,255,.08)",border:"2px solid rgba(255,255,255,.1)",color:"#fff"}}/>
          </div>
          {error&&<div style={{fontSize:13,color:"#FCA5A5",background:"rgba(220,38,38,.15)",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(220,38,38,.2)"}}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{...S.btnPrimary,marginTop:8,opacity:loading?.7:1,fontSize:15,padding:"14px"}}>
            {loading?"Giriş yapılıyor...":"Giriş Yap →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BULK IMPORT ────────────────────────────────────────────────────────────
function BulkImportModal({onClose,onImport,userId}) {
  const [rows,setRows]=useState([]); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false);
  const handleFile=(file)=>{ setError("");setRows([]); const r=new FileReader(); r.onload=(e)=>{ try{ const d=new Uint8Array(e.target.result); const wb=XLSX.read(d,{type:"array"}); const ws=wb.Sheets[wb.SheetNames[0]]; const j=XLSX.utils.sheet_to_json(ws,{defval:""}); if(!j.length){setError("Dosya boş.");return;} setRows(j); }catch{setError("Dosya okunamadı."); } }; r.readAsArrayBuffer(file); };
  const downloadTemplate=()=>{ const ws=XLSX.utils.aoa_to_sheet([["Ad Soyad","Telefon","Kurum"]]); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Leads"); XLSX.writeFile(wb,"sablon.xlsx"); };
  const handleImport=async()=>{ if(!rows.length)return; setLoading(true); const p=rows.map(r=>({name:r["Ad Soyad"]||r["name"]||r["Name"]||r["full_name"]||"",phone:String(r["Telefon"]||r["phone"]||r["Phone Number"]||""),kurum:r["Kurum"]||r["kurum"]||"",status:"yeni",sinav_tipi:[],ogrenci_sayisi:0,user_id:userId})).filter(r=>r.name||r.phone); const{error}=await supabase.from("leads").insert(p); if(error)setError("Hata: "+error.message); else{setDone(true);onImport();} setLoading(false); };
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.sheet}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontWeight:800,fontSize:16,color:DARK}}>📥 Toplu Lead Yükle</div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
          {done?(<div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:56,marginBottom:12}}>🎉</div><div style={{fontWeight:800,fontSize:18,color:DARK}}>{rows.length} kayıt yüklendi!</div></div>):(
            <>
              <div style={{background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)",border:"1px solid #BFDBFE",borderRadius:14,padding:"14px 16px"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1D4ED8",marginBottom:8}}>📋 Önce şablonu indirin</div>
                <button onClick={downloadTemplate} style={{background:"#2563EB",color:"#fff",border:"none",padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer"}}>⬇️ Şablon İndir</button>
              </div>
              <div onClick={()=>document.getElementById("fileInput").click()} style={{border:"2px dashed #E5E7EB",borderRadius:16,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:"#FAFAFA",transition:"border-color .2s"}}>
                <div style={{fontSize:36,marginBottom:8}}>📂</div>
                <div style={{fontWeight:700,fontSize:14,color:DARK,marginBottom:4}}>Dosyayı seçin</div>
                <div style={{fontSize:12,color:"#9CA3AF"}}>.xlsx veya .csv</div>
                <input id="fileInput" type="file" accept=".xlsx,.csv" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
              </div>
              {error&&<div style={{fontSize:13,color:"#DC2626",background:"#FEE2E2",padding:"10px 14px",borderRadius:10}}>{error}</div>}
              {rows.length>0&&<div style={{fontSize:13,color:"#059669",background:"#D1FAE5",padding:"10px 14px",borderRadius:10,fontWeight:700}}>✅ {rows.length} kayıt hazır!</div>}
            </>
          )}
        </div>
        <div style={{padding:"14px 20px 28px",borderTop:"1px solid #F3F4F6",display:"flex",gap:8,flexShrink:0}}>
          <button onClick={onClose} style={{...S.btnGhost,flex:1}}>{done?"Kapat":"İptal"}</button>
          {!done&&<button onClick={handleImport} disabled={!rows.length||loading} style={{...S.btnPrimary,flex:2,opacity:(!rows.length||loading)?.4:1}}>{loading?"Yükleniyor...":rows.length>0?`${rows.length} Kaydı Yükle`:"Dosya Seçin"}</button>}
        </div>
      </div>
    </div>
  );
}

// ── RAPOR ──────────────────────────────────────────────────────────────────
function RaporSayfasi({leads}) {
  const sd = STATUSES.map(s=>({...s,sayi:leads.filter(l=>l.status===s.key).length,oran:leads.length?Math.round(leads.filter(l=>l.status===s.key).length/leads.length*100):0}));
  const sinav = SINAV_TIPLERI.map(s=>({...s,sayi:leads.filter(l=>(l.sinav_tipi||[]).includes(s.key)).length}));
  const ilMap = useMemo(()=>{ const m={}; leads.forEach(l=>{if(l.il)m[l.il]=(m[l.il]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6); },[leads]);
  const ayMap = useMemo(()=>{ const m={}; leads.forEach(l=>{if(l.created_at){const a=l.created_at.slice(0,7);m[a]=(m[a]||0)+1;}}); return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).slice(-6); },[leads]);
  const maxAy=Math.max(...ayMap.map(a=>a[1]),1), maxIl=Math.max(...ilMap.map(i=>i[1]),1);
  const toplamOg=leads.reduce((s,l)=>s+(Number(l.ogrenci_sayisi)||0),0);
  const kazOg=leads.filter(l=>l.status==="kazanildi").reduce((s,l)=>s+(Number(l.ogrenci_sayisi)||0),0);
  const oran=leads.filter(l=>["kazanildi","kaybedildi"].includes(l.status)).length?Math.round(leads.filter(l=>l.status==="kazanildi").length/leads.filter(l=>["kazanildi","kaybedildi"].includes(l.status)).length*100):0;
  return (
    <div style={{padding:"12px",maxWidth:640,margin:"0 auto",display:"flex",flexDirection:"column",gap:12,paddingBottom:90}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {icon:"👥",label:"Toplam Lead",value:leads.length,grad:"linear-gradient(135deg,#667EEA,#764BA2)"},
          {icon:"🏆",label:"Kazanma Oranı",value:`%${oran}`,grad:`linear-gradient(135deg,${ACCENT},${ACCENT2})`},
          {icon:"🎓",label:"Toplam Öğrenci",value:toplamOg.toLocaleString("tr"),grad:"linear-gradient(135deg,#11998E,#38EF7D)"},
          {icon:"✅",label:"Kazanılan Öğrenci",value:kazOg.toLocaleString("tr"),grad:"linear-gradient(135deg,#4776E6,#8E54E9)"},
        ].map(s=>(
          <div key={s.label} style={{borderRadius:16,padding:"16px",background:s.grad,color:"#fff",boxShadow:"0 4px 15px rgba(0,0,0,.1)"}}>
            <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.03em"}}>{s.value}</div>
            <div style={{fontSize:10,marginTop:3,opacity:.8,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{background:"#fff",borderRadius:16,padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:14,color:DARK}}>📊 Durum Dağılımı</div>
        {sd.map(s=>(
          <div key={s.key} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:DARK}}>{s.label}</span><span style={{fontSize:12,color:"#9CA3AF",fontWeight:600}}>{s.sayi} · %{s.oran}</span></div>
            <div style={{height:8,background:"#F3F4F6",borderRadius:99}}><div style={{height:"100%",width:`${s.oran}%`,background:s.color,borderRadius:99,transition:"width .5s"}}/></div>
          </div>
        ))}
      </div>

      {ayMap.length>0&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:14,color:DARK}}>📈 Aylık Lead</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}}>
            {ayMap.map(([ay,sayi])=>(
              <div key={ay} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:10,fontWeight:700,color:ACCENT}}>{sayi}</div>
                <div style={{width:"100%",background:`linear-gradient(180deg,${ACCENT},${ACCENT2})`,borderRadius:"6px 6px 0 0",height:`${(sayi/maxAy)*72}px`,minHeight:4}}/>
                <div style={{fontSize:8,color:"#9CA3AF"}}>{ay.slice(5)}/{ay.slice(2,4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:16,padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:14,color:DARK}}>🎓 Sınav Tipi</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {sinav.map((s,i)=>(
            <div key={s.key} style={{textAlign:"center",background:["linear-gradient(135deg,#FEF3C7,#FDE68A)","linear-gradient(135deg,#EDE9FE,#DDD6FE)","linear-gradient(135deg,#D1FAE5,#A7F3D0)"][i],borderRadius:14,padding:"14px 8px"}}>
              <div style={{fontSize:22,fontWeight:800,color:["#92400E","#5B21B6","#065F46"][i]}}>{s.sayi}</div>
              <div style={{fontSize:12,fontWeight:800,marginTop:2,color:["#92400E","#5B21B6","#065F46"][i]}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {ilMap.length>0&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:14,color:DARK}}>🗺️ İllere Göre</div>
          {ilMap.map(([il,sayi],i)=>(
            <div key={il} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:DARK}}>{il}</span><span style={{fontSize:12,color:"#9CA3AF",fontWeight:600}}>{sayi}</span></div>
              <div style={{height:7,background:"#F3F4F6",borderRadius:99}}><div style={{height:"100%",width:`${(sayi/maxIl)*100}%`,background:`linear-gradient(90deg,${ACCENT},${ACCENT2})`,borderRadius:99}}/></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ÖDEME MODALİ ──────────────────────────────────────────────────────────
function OdemeModal({firma,userId,onClose}) {
  const [odemeler,setOdemeler]=useState([]); const [loading,setLoading]=useState(true);
  const [yeni,setYeni]=useState({tutar:firma.tutar||"",tarih:new Date().toISOString().slice(0,10),odeme_yapti:true});
  const [seciliAy,setSeciliAy]=useState(buAy()); const [kayitLoading,setKayitLoading]=useState(false);
  useEffect(()=>{fetchO();},[]);
  const fetchO=async()=>{ setLoading(true); const{data}=await supabase.from("odeme_gecmisi").select("*").eq("firma_id",firma.id).order("ay",{ascending:false}); setOdemeler(data||[]); setLoading(false); };
  const buAyO=odemeler.find(o=>o.ay===buAy());
  const toggleBuAy=async()=>{ if(buAyO)await supabase.from("odeme_gecmisi").update({odeme_yapti:!buAyO.odeme_yapti}).eq("id",buAyO.id); else await supabase.from("odeme_gecmisi").insert([{firma_id:firma.id,user_id:userId,ay:buAy(),tutar:Number(firma.tutar)||0,odeme_tarihi:new Date().toISOString().slice(0,10),odeme_yapti:true}]); fetchO(); };
  const kaydet=async()=>{ setKayitLoading(true); const m=odemeler.find(o=>o.ay===seciliAy); if(m)await supabase.from("odeme_gecmisi").update({tutar:Number(yeni.tutar)||0,odeme_tarihi:yeni.tarih,odeme_yapti:yeni.odeme_yapti}).eq("id",m.id); else await supabase.from("odeme_gecmisi").insert([{firma_id:firma.id,user_id:userId,ay:seciliAy,tutar:Number(yeni.tutar)||0,odeme_tarihi:yeni.tarih,odeme_yapti:yeni.odeme_yapti}]); await fetchO(); setKayitLoading(false); };
  const sonAylar=[]; const now=new Date(); for(let i=0;i<6;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1);sonAylar.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);}
  const toplamO=odemeler.filter(o=>o.odeme_yapti).reduce((s,o)=>s+(Number(o.tutar)||0),0);
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.sheet,maxHeight:"92vh"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div><div style={{fontWeight:800,fontSize:16,color:DARK}}>{firma.firma_adi}</div><div style={{fontSize:12,color:"#9CA3AF"}}>Ödeme Takibi</div></div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:buAyO?.odeme_yapti?"linear-gradient(135deg,#D1FAE5,#A7F3D0)":"linear-gradient(135deg,#FEE2E2,#FECACA)",border:`2px solid ${buAyO?.odeme_yapti?"#6EE7B7":"#FCA5A5"}`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontWeight:800,fontSize:14,color:buAyO?.odeme_yapti?"#065F46":"#991B1B"}}>{ayLabel(buAy())}</div><div style={{fontSize:12,color:buAyO?.odeme_yapti?"#059669":"#DC2626",marginTop:2}}>{buAyO?.odeme_yapti?`✅ ${Number(buAyO?.tutar||0).toLocaleString("tr")} ₺`:"❌ Ödenmedi"}</div></div>
            <button onClick={toggleBuAy} style={{padding:"9px 16px",borderRadius:12,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",background:buAyO?.odeme_yapti?"#059669":"#DC2626",color:"#fff",fontFamily:"inherit",boxShadow:`0 4px 12px ${buAyO?.odeme_yapti?"rgba(5,150,105,.3)":"rgba(220,38,38,.3)"}`}}>{buAyO?.odeme_yapti?"Ödedi ✓":"Ödenmedi"}</button>
          </div>
          <div style={{background:"#F9FAFB",borderRadius:16,padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontWeight:800,fontSize:13,color:DARK}}>📝 Ödeme Kaydı</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
              {sonAylar.map(ay=>{const v=odemeler.find(o=>o.ay===ay); const a=seciliAy===ay; return(
                <button key={ay} onClick={()=>{setSeciliAy(ay);if(v)setYeni({tutar:v.tutar||"",tarih:v.odeme_tarihi||new Date().toISOString().slice(0,10),odeme_yapti:v.odeme_yapti});else setYeni({tutar:firma.tutar||"",tarih:new Date().toISOString().slice(0,10),odeme_yapti:false});}}
                  style={{padding:"6px 12px",borderRadius:99,border:`2px solid ${a?ACCENT:"#E5E7EB"}`,background:a?ACCENT:"#fff",color:a?"#fff":"#6B7280",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit"}}>
                  {ayLabel(ay)} {v?(v.odeme_yapti?"✅":"❌"):""}
                </button>
              );})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div style={S.field}><label style={S.label}>Tutar (₺)</label><input value={yeni.tutar} onChange={e=>setYeni(f=>({...f,tutar:e.target.value}))} type="number" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Tarih</label><input value={yeni.tarih} onChange={e=>setYeni(f=>({...f,tarih:e.target.value}))} type="date" style={S.input}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{v:true,l:"✅ Ödedi"},{v:false,l:"❌ Ödemedi"}].map(o=>(
                <button key={String(o.v)} onClick={()=>setYeni(f=>({...f,odeme_yapti:o.v}))} style={{padding:"10px",borderRadius:12,border:`2px solid ${yeni.odeme_yapti===o.v?ACCENT:"#E5E7EB"}`,background:yeni.odeme_yapti===o.v?ACCENT:"#fff",color:yeni.odeme_yapti===o.v?"#fff":"#6B7280",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>
              ))}
            </div>
            <button onClick={kaydet} disabled={kayitLoading} style={{...S.btnPrimary,opacity:kayitLoading?.6:1}}>💾 {kayitLoading?"Kaydediliyor...":"Kaydet"}</button>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:13,color:DARK,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
              <span>📋 Ödeme Geçmişi</span>
              <span style={{color:"#059669",background:"#D1FAE5",padding:"3px 10px",borderRadius:99,fontSize:12}}>Toplam: {toplamO.toLocaleString("tr")} ₺</span>
            </div>
            {loading&&<div style={{textAlign:"center",padding:"16px",color:"#9CA3AF",fontSize:13}}>Yükleniyor…</div>}
            {!loading&&odemeler.length===0&&<div style={{textAlign:"center",padding:"16px",color:"#9CA3AF",fontSize:13}}>Kayıt yok.</div>}
            {odemeler.map(o=>(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:o.odeme_yapti?"linear-gradient(135deg,#F0FDF4,#DCFCE7)":"linear-gradient(135deg,#FFF1F2,#FFE4E6)",borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${o.odeme_yapti?"#BBF7D0":"#FECDD3"}`}}>
                <div><div style={{fontWeight:700,fontSize:13,color:DARK}}>{ayLabel(o.ay)}</div>{o.odeme_tarihi&&<div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{new Date(o.odeme_tarihi).toLocaleDateString("tr-TR")}</div>}</div>
                <div style={{fontWeight:800,fontSize:15,color:o.odeme_yapti?"#059669":"#DC2626"}}>{o.odeme_yapti?`${Number(o.tutar).toLocaleString("tr")} ₺`:"❌"}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"12px 16px 28px",borderTop:"1px solid #F3F4F6",flexShrink:0}}>
          <button onClick={onClose} style={{...S.btnGhost,width:"100%"}}>Kapat</button>
        </div>
      </div>
    </div>
  );
}

// ── AJANS ──────────────────────────────────────────────────────────────────
function AjansSayfasi({userId}) {
  const [firmalar,setFirmalar]=useState([]); const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null); const [form,setForm]=useState(EMPTY_FIRMA);
  const [detailF,setDetailF]=useState(null); const [odemeModal,setOdemeModal]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null); const [odemeDur,setOdemeDur]=useState({});

  useEffect(()=>{fetchF();},[]);
  const fetchF=async()=>{ setLoading(true); const{data}=await supabase.from("firmalar").select("*").order("created_at",{ascending:false}); setFirmalar(data||[]);
    if(data?.length){const{data:od}=await supabase.from("odeme_gecmisi").select("firma_id,odeme_yapti").eq("ay",buAy()); const m={}; (od||[]).forEach(o=>{m[o.firma_id]=o.odeme_yapti;}); setOdemeDur(m);} setLoading(false); };

  const stats=useMemo(()=>({
    toplamF:firmalar.length,
    odeyenler:Object.values(odemeDur).filter(Boolean).length,
    toplamT:firmalar.reduce((s,f)=>s+(Number(f.tutar)||0),0),
    tahsil:firmalar.filter(f=>odemeDur[f.id]).reduce((s,f)=>s+(Number(f.tutar)||0),0),
    ertugrul:firmalar.filter(f=>odemeDur[f.id]).reduce((s,f)=>s+(Number(f.ertugrul)||0),0),
    burak:firmalar.filter(f=>odemeDur[f.id]).reduce((s,f)=>s+(Number(f.burak)||0),0),
    onur:firmalar.filter(f=>odemeDur[f.id]).reduce((s,f)=>s+(Number(f.onur)||0),0),
  }),[firmalar,odemeDur]);

  const openAdd=()=>{setForm(EMPTY_FIRMA);setModal("add");};
  const openEdit=(f)=>{setForm({firma_adi:f.firma_adi,tutar:f.tutar,odeme_tipi:f.odeme_tipi,ertugrul:f.ertugrul||"",burak:f.burak||"",onur:f.onur||"",notlar:f.notlar||""});setModal(f);setDetailF(null);};
  const saveForm=async()=>{ if(!form.firma_adi.trim())return; const p={firma_adi:form.firma_adi,tutar:Number(form.tutar)||0,odeme_tipi:form.odeme_tipi,ertugrul:Number(form.ertugrul)||0,burak:Number(form.burak)||0,onur:Number(form.onur)||0,notlar:form.notlar||"",user_id:userId}; if(modal==="add")await supabase.from("firmalar").insert([p]); else await supabase.from("firmalar").update(p).eq("id",modal.id); setModal(null);fetchF(); };
  const delF=async(id)=>{ await supabase.from("firmalar").delete().eq("id",id); setConfirmDel(null);setModal(null);setDetailF(null);fetchF(); };
  const inp=(f)=>({value:form[f],onChange:e=>setForm(x=>({...x,[f]:e.target.value}))});

  return (
    <div style={{padding:"12px",maxWidth:640,margin:"0 auto",paddingBottom:90}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {[
          {icon:"🏢",label:"Toplam Firma",value:stats.toplamF,grad:"linear-gradient(135deg,#667EEA,#764BA2)"},
          {icon:"✅",label:"Bu Ay Ödedi",value:`${stats.odeyenler}/${stats.toplamF}`,grad:`linear-gradient(135deg,#11998E,#38EF7D)`},
          {icon:"💰",label:"Toplam Tutar",value:stats.toplamT.toLocaleString("tr")+"₺",grad:`linear-gradient(135deg,${ACCENT},${ACCENT2})`},
          {icon:"🏦",label:"Tahsil Edilen",value:stats.tahsil.toLocaleString("tr")+"₺",grad:"linear-gradient(135deg,#4776E6,#8E54E9)"},
        ].map(s=>(
          <div key={s.label} style={{borderRadius:16,padding:"14px",background:s.grad,color:"#fff",boxShadow:"0 4px 15px rgba(0,0,0,.1)"}}>
            <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:17,fontWeight:800,letterSpacing:"-0.02em"}}>{s.value}</div>
            <div style={{fontSize:10,marginTop:3,opacity:.8,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* KİŞİ BAZLI KAZANÇ */}
      <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
        <div style={{fontWeight:800,fontSize:13,color:DARK,marginBottom:12}}>💸 Bu Ay Kişi Bazlı Kazanç</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {ad:"Ertuğrul",val:stats.ertugrul,grad:"linear-gradient(135deg,#667EEA,#764BA2)"},
            {ad:"Burak",val:stats.burak,grad:`linear-gradient(135deg,${ACCENT},${ACCENT2})`},
            {ad:"Onur",val:stats.onur,grad:"linear-gradient(135deg,#11998E,#38EF7D)"},
          ].map(k=>(
            <div key={k.ad} style={{textAlign:"center",background:k.grad,borderRadius:12,padding:"12px 6px",color:"#fff",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
              <div style={{fontSize:10,fontWeight:700,opacity:.8,textTransform:"uppercase",marginBottom:4}}>{k.ad}</div>
              <div style={{fontSize:14,fontWeight:800}}>{Number(k.val||0).toLocaleString("tr")} ₺</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={openAdd} style={{...S.btnPrimary,width:"100%",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:15}}>
        <span style={{fontSize:18}}>+</span> Yeni Firma Ekle
      </button>

      {loading&&<div style={{textAlign:"center",padding:"40px",color:"#9CA3AF"}}>Yükleniyor…</div>}
      {!loading&&firmalar.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#9CA3AF"}}>Henüz firma yok.</div>}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {firmalar.map(f=>{const odedi=odemeDur[f.id]; return(
          <div key={f.id} style={{background:"#fff",borderRadius:16,padding:"14px",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:"1px solid #F3F4F6"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,cursor:"pointer"}} onClick={()=>setDetailF(f)}>
                <div style={{fontWeight:800,fontSize:15,color:DARK}}>{f.firma_adi}</div>
                <div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{Number(f.tutar).toLocaleString("tr")} ₺ · <span style={{color:f.odeme_tipi==="faturali"?"#2563EB":"#059669",fontWeight:700}}>{f.odeme_tipi==="faturali"?"🧾 Faturalı":"💵 Nakit"}</span></div>
              </div>
              <button onClick={()=>setOdemeModal(f)} style={{padding:"6px 12px",borderRadius:99,border:"none",fontWeight:700,fontSize:11,cursor:"pointer",background:odedi?"#D1FAE5":"#FEE2E2",color:odedi?"#059669":"#DC2626",flexShrink:0,fontFamily:"inherit"}}>
                {odedi?"✅ Ödedi":"❌ Ödemedi"}
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
              {[{ad:"Ertuğrul",val:f.ertugrul,c:"#7C3AED"},{ad:"Burak",val:f.burak,c:ACCENT},{ad:"Onur",val:f.onur,c:"#059669"}].map(k=>(
                <div key={k.ad} style={{background:"#F9FAFB",borderRadius:10,padding:"8px",textAlign:"center",border:"1px solid #F3F4F6"}}>
                  <div style={{fontSize:9,color:"#9CA3AF",fontWeight:700,textTransform:"uppercase"}}>{k.ad}</div>
                  <div style={{fontSize:13,fontWeight:800,marginTop:2,color:k.c}}>{Number(k.val||0).toLocaleString("tr")}₺</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setOdemeModal(f)} style={{width:"100%",background:"#F9FAFB",border:"1px solid #F3F4F6",padding:"9px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",color:"#6B7280",fontFamily:"inherit"}}>📋 Ödeme Geçmişi</button>
          </div>
        );})}
      </div>

      {detailF&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setDetailF(null)}>
          <div style={S.sheet}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:16,color:DARK}}>{detailF.firma_adi}</div>
              <button onClick={()=>setDetailF(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
              {[{icon:"💰",label:"Aylık Tutar",val:Number(detailF.tutar).toLocaleString("tr")+" ₺"},{icon:"🧾",label:"Ödeme Tipi",val:detailF.odeme_tipi==="faturali"?"Faturalı":"Nakit"}].map(r=>(
                <div key={r.label} style={{display:"flex",gap:14,alignItems:"center",background:"#F9FAFB",borderRadius:14,padding:"12px 14px"}}>
                  <div style={{width:42,height:42,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{r.icon}</div>
                  <div><div style={{fontSize:10,color:"#9CA3AF",fontWeight:700,textTransform:"uppercase"}}>{r.label}</div><div style={{fontSize:15,fontWeight:700,color:DARK}}>{r.val}</div></div>
                </div>
              ))}
              <div style={{background:"#F9FAFB",borderRadius:14,padding:"14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",marginBottom:10}}>Bölüşüm</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{ad:"Ertuğrul",val:detailF.ertugrul,c:"#7C3AED"},{ad:"Burak",val:detailF.burak,c:ACCENT},{ad:"Onur",val:detailF.onur,c:"#059669"}].map(k=>(
                    <div key={k.ad} style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#9CA3AF",fontWeight:600}}>{k.ad}</div>
                      <div style={{fontSize:16,fontWeight:800,marginTop:2,color:k.c}}>{Number(k.val||0).toLocaleString("tr")} ₺</div>
                    </div>
                  ))}
                </div>
              </div>
              {detailF.notlar&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:12,padding:"12px 14px"}}><div style={{fontSize:10,color:"#92400E",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Not</div><div style={{fontSize:13,color:"#78350F"}}>{detailF.notlar}</div></div>}
            </div>
            <div style={{padding:"12px 20px 28px",borderTop:"1px solid #F3F4F6",display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>setDetailF(null)} style={{...S.btnGhost,flex:1}}>Kapat</button>
              <button onClick={()=>setConfirmDel(detailF.id)} style={{...S.btnGhost,color:"#DC2626",borderColor:"#FECACA"}}>Sil</button>
              <button onClick={()=>openEdit(detailF)} style={{...S.btnPrimary,flex:2}}>✏️ Düzenle</button>
            </div>
          </div>
        </div>
      )}

      {modal&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:15,color:DARK}}>{modal==="add"?"Yeni Firma":"Firma Düzenle"}</div>
              <button onClick={()=>setModal(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
              <div style={S.field}><label style={S.label}>Firma Adı *</label><input {...inp("firma_adi")} placeholder="Örn: ABC Dijital" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Aylık Tutar (₺)</label><input {...inp("tutar")} type="number" placeholder="5000" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Ödeme Tipi</label><select {...inp("odeme_tipi")} style={S.input}><option value="faturali">🧾 Faturalı</option><option value="nakit">💵 Nakit</option></select></div>
              <div>
                <div style={{...S.label,marginBottom:8}}>Bölüşüm (₺)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{k:"ertugrul",l:"Ertuğrul"},{k:"burak",l:"Burak"},{k:"onur",l:"Onur"}].map(x=>(
                    <div key={x.k} style={S.field}><label style={S.label}>{x.l}</label><input {...inp(x.k)} type="number" placeholder="0" style={S.input}/></div>
                  ))}
                </div>
                <div style={{fontSize:11,color:"#9CA3AF",marginTop:6,textAlign:"right",fontWeight:600}}>
                  Toplam: {(Number(form.ertugrul||0)+Number(form.burak||0)+Number(form.onur||0)).toLocaleString("tr")} ₺
                  {Number(form.tutar)>0&&Number(form.ertugrul||0)+Number(form.burak||0)+Number(form.onur||0)!==Number(form.tutar)&&<span style={{color:"#DC2626",marginLeft:5}}>⚠️ Eşleşmiyor</span>}
                </div>
              </div>
              <div style={S.field}><label style={S.label}>Not (opsiyonel)</label><textarea {...inp("notlar")} rows={2} style={{...S.input,resize:"vertical"}}/></div>
            </div>
            <div style={{padding:"12px 20px 28px",borderTop:"1px solid #F3F4F6",display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>setModal(null)} style={{...S.btnGhost,flex:1}}>İptal</button>
              <button onClick={saveForm} style={{...S.btnPrimary,flex:2}}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setConfirmDel(null)}>
          <div style={S.sheet}>
            <div style={{padding:"32px 24px",textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:12}}>🗑️</div>
              <div style={{fontWeight:800,fontSize:16,marginBottom:8,color:DARK}}>Firmayı sil?</div>
              <div style={{fontSize:13,color:"#9CA3AF",marginBottom:24}}>Tüm ödeme geçmişi silinir.</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setConfirmDel(null)} style={{...S.btnGhost,flex:1}}>İptal</button>
                <button onClick={()=>delF(confirmDel)} style={{...S.btnPrimary,flex:1,background:"linear-gradient(135deg,#EF4444,#DC2626)",boxShadow:"0 4px 15px rgba(220,38,38,.35)"}}>Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {odemeModal&&<OdemeModal firma={odemeModal} userId={userId} onClose={()=>{setOdemeModal(null);fetchF();}}/>}
    </div>
  );
}

// ── ANA APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [session,setSession]=useState(null); const [leads,setLeads]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(""); const [filterStatus,setFilterStatus]=useState("tümü");
  const [modal,setModal]=useState(null); const [form,setForm]=useState(EMPTY_FORM);
  const [confirmDel,setConfirmDel]=useState(null); const [detailId,setDetailId]=useState(null);
  const [showImport,setShowImport]=useState(false); const [sayfa,setSayfa]=useState("leads");

  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>setSession(session)); supabase.auth.onAuthStateChange((_,s)=>setSession(s)); },[]);
  useEffect(()=>{if(session)fetchLeads();},[session]);

  const fetchLeads=async()=>{ setLoading(true); const{data}=await supabase.from("leads").select("*").order("created_at",{ascending:false}); setLeads(data||[]); setLoading(false); };

  const filtered=useMemo(()=>leads.filter(l=>{ const q=search.toLowerCase(); return(!q||l.name?.toLowerCase().includes(q)||l.kurum?.toLowerCase().includes(q)||l.il?.toLowerCase().includes(q))&&(filterStatus==="tümü"||l.status===filterStatus); }),[leads,search,filterStatus]);

  const stats=useMemo(()=>({ total:leads.length, kazanildi:leads.filter(l=>l.status==="kazanildi").length, topOg:leads.filter(l=>l.status==="kazanildi").reduce((s,l)=>s+(Number(l.ogrenci_sayisi)||0),0) }),[leads]);

  const openAdd=()=>{setForm(EMPTY_FORM);setModal("add");};
  const openEdit=(lead)=>{ setForm({name:lead.name||"",phone:lead.phone||"",il:lead.il||"",ilce:lead.ilce||"",kurum:lead.kurum||"",sinavTipi:lead.sinav_tipi||[],ogrenciSayisi:lead.ogrenci_sayisi||"",status:lead.status||"yeni",note:lead.note||""}); setModal(lead);setDetailId(null); };
  const toggleSinav=(key)=>setForm(f=>({...f,sinavTipi:f.sinavTipi.includes(key)?f.sinavTipi.filter(x=>x!==key):[...f.sinavTipi,key]}));
  const saveForm=async()=>{ if(!form.name.trim())return; const p={name:form.name,phone:form.phone,il:form.il,ilce:form.ilce,kurum:form.kurum,sinav_tipi:form.sinavTipi,ogrenci_sayisi:Number(form.ogrenciSayisi)||0,status:form.status,note:form.note,user_id:session.user.id}; if(modal==="add")await supabase.from("leads").insert([p]); else await supabase.from("leads").update(p).eq("id",modal.id); setModal(null);fetchLeads(); };
  const deleteLead=async(id)=>{ await supabase.from("leads").delete().eq("id",id); setConfirmDel(null);setModal(null);setDetailId(null);fetchLeads(); };
  const inp=(f)=>({value:form[f],onChange:e=>setForm(x=>({...x,[f]:e.target.value}))});
  const currentLead=detailId?leads.find(l=>l.id===detailId):null;

  if(!session)return <LoginScreen/>;

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:DARK,overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:inherit}
        .sinav-btn{border:2px solid #E5E7EB;border-radius:12px;padding:10px 6px;cursor:pointer;background:#fff;text-align:center;width:100%;transition:all .2s}
        .sinav-btn.on{border-color:${ACCENT};background:${ACCENT};color:#fff}
        .chip{padding:8px 14px;border-radius:99px;font-size:12px;font-weight:700;cursor:pointer;border:2px solid transparent;white-space:nowrap;background:none;transition:all .2s}
        .lead-card{background:#fff;border-radius:16px;padding:14px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #F3F4F6;transition:transform .15s,box-shadow .15s}
        .lead-card:active{transform:scale(.98);box-shadow:0 1px 6px rgba(0,0,0,.08)}
        input:focus,select:focus,textarea:focus{border-color:${ACCENT} !important;box-shadow:0 0 0 4px rgba(255,107,53,.1);outline:none}
      `}</style>

      {/* TOP BAR */}
      <div style={{background:"#fff",borderBottom:"1px solid #F3F4F6",padding:"0 16px",display:"flex",alignItems:"center",height:56,position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 4px 10px rgba(255,107,53,.3)`}}>🎯</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:16,letterSpacing:"-0.03em",color:DARK}}>vin<span style={{color:ACCENT}}>takip</span></div>
        </div>
        <div style={{flex:1}}/>
        {sayfa==="leads"&&<button onClick={()=>setShowImport(true)} style={{background:"#F3F4F6",border:"none",padding:"8px 10px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",color:"#6B7280",marginRight:6}}>📥</button>}
        <button onClick={()=>supabase.auth.signOut()} style={{background:"#FEE2E2",border:"none",padding:"8px 10px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",color:"#DC2626"}}>Çıkış</button>
        {sayfa==="leads"&&<button onClick={openAdd} style={{...S.btnPrimary,padding:"9px 16px",marginLeft:6,fontSize:13}}>+ Yeni</button>}
      </div>

      <div style={{paddingBottom:80}}>
        {sayfa==="leads"&&(
          <div style={{padding:"14px 12px 0",maxWidth:640,margin:"0 auto"}}>
            {/* STATS */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {label:"Lead",value:stats.total,icon:"👥",grad:"linear-gradient(135deg,#667EEA,#764BA2)"},
                {label:"Kazanılan",value:stats.kazanildi,icon:"🏆",grad:`linear-gradient(135deg,${ACCENT},${ACCENT2})`},
                {label:"Öğrenci",value:stats.topOg.toLocaleString("tr"),icon:"🎓",grad:"linear-gradient(135deg,#11998E,#38EF7D)"},
              ].map(s=>(
                <div key={s.label} style={{borderRadius:16,padding:"12px 10px",background:s.grad,color:"#fff",boxShadow:"0 4px 15px rgba(0,0,0,.1)"}}>
                  <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:20,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1}}>{s.value}</div>
                  <div style={{fontSize:9,marginTop:4,opacity:.8,fontWeight:600,textTransform:"uppercase"}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ARAMA */}
            <div style={{position:"relative",marginBottom:10}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#9CA3AF",fontSize:16}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="İsim, kurum veya il ara…"
                style={{...S.input,paddingLeft:42,width:"100%",borderRadius:14,fontSize:14}}/>
            </div>

            {/* FİLTRELER */}
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:12}}>
              {[{key:"tümü",label:"Tümü"},...STATUSES].map(s=>{ const a=filterStatus===s.key; return(
                <button key={s.key} className="chip" onClick={()=>setFilterStatus(s.key)}
                  style={{background:a?ACCENT:"#fff",color:a?"#fff":"#6B7280",borderColor:a?ACCENT:"#E5E7EB",boxShadow:a?`0 4px 12px rgba(255,107,53,.3)`:"none"}}>{s.label}</button>
              ); })}
            </div>

            {loading&&<div style={{textAlign:"center",padding:"40px",color:"#9CA3AF"}}>Yükleniyor…</div>}
            {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#9CA3AF"}}>Kayıt bulunamadı.</div>}

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(lead=>(
                <div key={lead.id} className="lead-card" onClick={()=>setDetailId(lead.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{flex:1,minWidth:0,marginRight:10}}>
                      <div style={{fontWeight:800,fontSize:15,color:DARK,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lead.name}</div>
                      <div style={{fontSize:12,color:"#9CA3AF",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lead.kurum||"—"}</div>
                    </div>
                    <StatusBadge statusKey={lead.status}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <SinavBadge types={lead.sinav_tipi}/>
                    <div style={{display:"flex",gap:8,fontSize:11,color:"#9CA3AF",fontWeight:600}}>
                      {lead.il&&<span>📍 {lead.il}</span>}
                      {lead.ogrenci_sayisi>0&&<span>🎓 {lead.ogrenci_sayisi}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,fontSize:11,color:"#9CA3AF",textAlign:"center",fontWeight:600}}>{filtered.length} kayıt</div>
          </div>
        )}
        {sayfa==="rapor"&&<RaporSayfasi leads={leads}/>}
        {sayfa==="ajans"&&<AjansSayfasi userId={session.user.id}/>}
      </div>

      {/* ALT TAB BAR */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #F3F4F6",display:"flex",zIndex:50,paddingBottom:"env(safe-area-inset-bottom)",boxShadow:"0 -4px 20px rgba(0,0,0,.06)"}}>
        {[{key:"leads",icon:"👥",label:"Leads"},{key:"rapor",icon:"📊",label:"Rapor"},{key:"ajans",icon:"🏢",label:"Ajans"}].map(t=>{const a=sayfa===t.key; return(
          <button key={t.key} onClick={()=>setSayfa(t.key)} style={{flex:1,background:"none",border:"none",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{fontSize:22,filter:a?"none":"grayscale(1) opacity(.5)"}}>{t.icon}</div>
            <div style={{fontSize:10,fontWeight:a?800:500,color:a?ACCENT:"#9CA3AF"}}>{t.label}</div>
            {a&&<div style={{width:20,height:3,background:`linear-gradient(90deg,${ACCENT},${ACCENT2})`,borderRadius:99}}/>}
          </button>
        );})}
      </div>

      {/* LEAD DETAIL */}
      {currentLead&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setDetailId(null)}>
          <div style={S.sheet}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div><div style={{fontWeight:800,fontSize:17,color:DARK}}>{currentLead.name}</div><div style={{fontSize:12,color:"#9CA3AF"}}>{currentLead.kurum}</div></div>
              <button onClick={()=>setDetailId(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
              <StatusBadge statusKey={currentLead.status}/>
              {[{icon:"📞",label:"Telefon",val:currentLead.phone||"—"},{icon:"📍",label:"Konum",val:[currentLead.ilce,currentLead.il].filter(Boolean).join(" / ")||"—"},{icon:"🎓",label:"Öğrenci",val:`${currentLead.ogrenci_sayisi||0} öğrenci`}].map(r=>(
                <div key={r.label} style={{display:"flex",gap:14,alignItems:"center",background:"#F9FAFB",borderRadius:14,padding:"12px 14px"}}>
                  <div style={{width:42,height:42,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{r.icon}</div>
                  <div><div style={{fontSize:10,color:"#9CA3AF",fontWeight:700,textTransform:"uppercase"}}>{r.label}</div><div style={{fontSize:15,fontWeight:700,color:DARK}}>{r.val}</div></div>
                </div>
              ))}
              <div style={{background:"#F9FAFB",borderRadius:14,padding:"12px 14px"}}>
                <div style={{fontSize:10,color:"#9CA3AF",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Sınav Tipi</div>
                <SinavBadge types={currentLead.sinav_tipi}/>
              </div>
              {currentLead.note&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:12,padding:"12px 14px"}}><div style={{fontSize:10,color:"#92400E",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Not</div><div style={{fontSize:13,color:"#78350F"}}>{currentLead.note}</div></div>}
            </div>
            <div style={{padding:"12px 20px 28px",borderTop:"1px solid #F3F4F6",display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>setDetailId(null)} style={{...S.btnGhost,flex:1}}>Kapat</button>
              <button onClick={()=>openEdit(currentLead)} style={{...S.btnPrimary,flex:2}}>✏️ Düzenle</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT LEAD */}
      {modal&&sayfa==="leads"&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:16,color:DARK}}>{modal==="add"?"Yeni Lead":"Lead Düzenle"}</div>
              <button onClick={()=>setModal(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"14px 20px",display:"flex",flexDirection:"column",gap:12}}>
              <div style={S.field}><label style={S.label}>Ad Soyad *</label><input {...inp("name")} placeholder="Ahmet Yılmaz" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Telefon</label><input {...inp("phone")} type="tel" placeholder="05__ ___ __ __" style={S.input}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={S.field}><label style={S.label}>İl</label><select {...inp("il")} style={S.input}><option value="">Seçiniz</option>{ILLER.map(il=><option key={il}>{il}</option>)}</select></div>
                <div style={S.field}><label style={S.label}>İlçe</label><input {...inp("ilce")} placeholder="İlçe" style={S.input}/></div>
              </div>
              <div style={S.field}><label style={S.label}>Kurum</label><input {...inp("kurum")} placeholder="Gelecek Dershanesi" style={S.input}/></div>
              <div>
                <div style={{...S.label,marginBottom:8}}>Sınav Tipi</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {SINAV_TIPLERI.map(s=>{const a=form.sinavTipi.includes(s.key); return(
                    <button key={s.key} type="button" className={`sinav-btn${a?" on":""}`} onClick={()=>toggleSinav(s.key)}>
                      <div style={{fontWeight:800,fontSize:14}}>{s.label}</div>
                      <div style={{fontSize:9,opacity:.6,marginTop:2}}>{s.desc}</div>
                      {a&&<div style={{fontSize:13,marginTop:3}}>✓</div>}
                    </button>
                  );})}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={S.field}><label style={S.label}>Öğrenci Sayısı</label><input {...inp("ogrenciSayisi")} type="number" min="0" placeholder="150" style={S.input}/></div>
                <div style={S.field}><label style={S.label}>Durum</label><select {...inp("status")} style={S.input}>{STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
              </div>
              <div style={S.field}><label style={S.label}>Not</label><textarea {...inp("note")} rows={2} style={{...S.input,resize:"vertical"}}/></div>
            </div>
            <div style={{padding:"12px 20px 28px",borderTop:"1px solid #F3F4F6",display:"flex",gap:8,flexShrink:0}}>
              {modal!=="add"&&<button onClick={()=>setConfirmDel(modal.id)} style={{...S.btnGhost,color:"#DC2626",borderColor:"#FECACA"}}>Sil</button>}
              <button onClick={()=>setModal(null)} style={S.btnGhost}>İptal</button>
              <button onClick={saveForm} style={{...S.btnPrimary,flex:1}}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel&&sayfa==="leads"&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setConfirmDel(null)}>
          <div style={S.sheet}>
            <div style={{padding:"32px 24px",textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:12}}>🗑️</div>
              <div style={{fontWeight:800,fontSize:16,marginBottom:8,color:DARK}}>Sil?</div>
              <div style={{fontSize:13,color:"#9CA3AF",marginBottom:24}}>Bu işlem geri alınamaz.</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setConfirmDel(null)} style={{...S.btnGhost,flex:1}}>İptal</button>
                <button onClick={()=>deleteLead(confirmDel)} style={{...S.btnPrimary,flex:1,background:"linear-gradient(135deg,#EF4444,#DC2626)",boxShadow:"0 4px 15px rgba(220,38,38,.35)"}}>Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImport&&<BulkImportModal onClose={()=>setShowImport(false)} onImport={fetchLeads} userId={session.user.id}/>}
    </div>
  );
}
