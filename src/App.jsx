import { useState, useMemo, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const STATUSES = [
  { key:"yeni",       label:"Yeni",             color:"#6366f1", bg:"#eef2ff" },
  { key:"iletisim",   label:"İletişimde",        color:"#f59e0b", bg:"#fffbeb" },
  { key:"teklif",     label:"Teklif Gönderildi", color:"#3b82f6", bg:"#eff6ff" },
  { key:"kazanildi",  label:"Kazanıldı",         color:"#10b981", bg:"#ecfdf5" },
  { key:"kaybedildi", label:"Kaybedildi",        color:"#ef4444", bg:"#fef2f2" },
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
  overlay: { position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" },
  sheet: { background:"#fff",width:"100%",maxWidth:520,borderRadius:"20px 20px 0 0",maxHeight:"88vh",display:"flex",flexDirection:"column" },
  closeBtn: { width:40,height:40,borderRadius:"50%",background:"#f0f0f0",border:"none",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#444",flexShrink:0 },
  field: { display:"flex",flexDirection:"column",gap:5 },
  label: { fontSize:11,fontWeight:700,color:"#999",letterSpacing:".07em",textTransform:"uppercase" },
  input: { border:"1.5px solid #e8e8e8",borderRadius:10,padding:"10px 13px",fontSize:14,outline:"none",background:"#fff",color:"#1a1a1a",fontFamily:"inherit",width:"100%" },
  btnPrimary: { background:"#1a1a1a",color:"#fff",border:"none",padding:"12px 16px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" },
  btnGhost: { background:"transparent",border:"1.5px solid #e5e5e5",padding:"10px 14px",borderRadius:10,fontSize:13,fontWeight:500,cursor:"pointer",color:"#555",fontFamily:"inherit" },
};

const StatusBadge = ({statusKey}) => {
  const s = STATUSES.find(x=>x.key===statusKey)||STATUSES[0];
  return <span style={{display:"inline-block",padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:700,color:s.color,background:s.bg,whiteSpace:"nowrap"}}>{s.label}</span>;
};
const SinavBadge = ({types}) => (
  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
    {(types||[]).map(t=><span key={t} style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,background:t==="TYT"?"#fef3c7":t==="AYT"?"#ede9fe":"#dcfce7",color:t==="TYT"?"#92400e":t==="AYT"?"#5b21b6":"#15803d"}}>{t}</span>)}
  </div>
);

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const handleLogin = async()=>{ setLoading(true);setError(""); const{error}=await supabase.auth.signInWithPassword({email,password}); if(error)setError("E-posta veya şifre hatalı."); setLoading(false); };
  return (
    <div style={{minHeight:"100vh",background:"#f6f6f5",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{background:"#fff",borderRadius:16,padding:"36px 28px",width:"100%",maxWidth:360,boxShadow:"0 4px 32px rgba(0,0,0,.08)"}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:500,letterSpacing:"-0.04em",marginBottom:6}}>crm<span style={{color:"#6366f1"}}>.</span></div>
        <div style={{fontSize:13,color:"#aaa",marginBottom:24}}>vintakip.com</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={S.field}><label style={S.label}>E-posta</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ornek@mail.com" style={S.input}/></div>
          <div style={S.field}><label style={S.label}>Şifre</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={S.input}/></div>
          {error&&<div style={{fontSize:13,color:"#ef4444",background:"#fef2f2",padding:"8px 12px",borderRadius:8}}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{...S.btnPrimary,opacity:loading?.6:1,marginTop:4}}>
            {loading?"Giriş yapılıyor...":"Giriş Yap"}
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
        <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:15}}>📥 Toplu Lead Yükle</div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
          {done?(<div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:48,marginBottom:12}}>🎉</div><div style={{fontWeight:700,fontSize:16}}>{rows.length} kayıt yüklendi!</div></div>):(
            <>
              <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#0369a1",marginBottom:6}}>📋 Önce şablonu indirin</div>
                <button onClick={downloadTemplate} style={{background:"#0ea5e9",color:"#fff",border:"none",padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>⬇️ Şablon İndir</button>
              </div>
              <div onClick={()=>document.getElementById("fileInput").click()} style={{border:"2px dashed #e8e8e8",borderRadius:12,padding:"24px 20px",textAlign:"center",cursor:"pointer",background:"#fafafa"}}>
                <div style={{fontSize:32,marginBottom:8}}>📂</div><div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Dosyayı seçin</div><div style={{fontSize:12,color:"#aaa"}}>.xlsx veya .csv</div>
                <input id="fileInput" type="file" accept=".xlsx,.csv" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
              </div>
              {error&&<div style={{fontSize:13,color:"#ef4444",background:"#fef2f2",padding:"8px 12px",borderRadius:8}}>{error}</div>}
              {rows.length>0&&<div style={{fontSize:13,color:"#10b981",background:"#ecfdf5",padding:"8px 12px",borderRadius:8,fontWeight:600}}>✅ {rows.length} kayıt hazır!</div>}
            </>
          )}
        </div>
        <div style={{padding:"12px 16px 28px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,flexShrink:0}}>
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
        {[{icon:"👥",label:"Toplam Lead",value:leads.length},{icon:"🏆",label:"Kazanma Oranı",value:`%${oran}`},{icon:"🎓",label:"Toplam Öğrenci",value:toplamOg.toLocaleString("tr")},{icon:"✅",label:"Kazanılan Öğrenci",value:kazOg.toLocaleString("tr")}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"14px"}}>
            <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.03em"}}>{s.value}</div>
            <div style={{fontSize:10,color:"#bbb",marginTop:3,fontWeight:500}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"14px"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Durum Dağılımı</div>
        {sd.map(s=>(
          <div key={s.key} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:13}}>{s.label}</span><span style={{fontSize:12,color:"#888"}}>{s.sayi} · %{s.oran}</span></div>
            <div style={{height:7,background:"#f5f5f5",borderRadius:99}}><div style={{height:"100%",width:`${s.oran}%`,background:s.color,borderRadius:99}}/></div>
          </div>
        ))}
      </div>
      {ayMap.length>0&&(
        <div style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📈 Aylık Lead</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}}>
            {ayMap.map(([ay,sayi])=>(
              <div key={ay} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:10,fontWeight:600,color:"#6366f1"}}>{sayi}</div>
                <div style={{width:"100%",background:"#6366f1",borderRadius:"4px 4px 0 0",height:`${(sayi/maxAy)*72}px`,minHeight:4}}/>
                <div style={{fontSize:8,color:"#bbb"}}>{ay.slice(5)}/{ay.slice(2,4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"14px"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>🎓 Sınav Tipi</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {sinav.map(s=>(
            <div key={s.key} style={{textAlign:"center",background:"#f9f9f9",borderRadius:10,padding:"12px 8px"}}>
              <div style={{fontSize:18,fontWeight:700,color:s.key==="TYT"?"#92400e":s.key==="AYT"?"#5b21b6":"#15803d"}}>{s.sayi}</div>
              <div style={{fontSize:11,fontWeight:700,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      {ilMap.length>0&&(
        <div style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>🗺️ İllere Göre</div>
          {ilMap.map(([il,sayi])=>(
            <div key={il} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:13}}>{il}</span><span style={{fontSize:12,color:"#888"}}>{sayi}</span></div>
              <div style={{height:6,background:"#f5f5f5",borderRadius:99}}><div style={{height:"100%",width:`${(sayi/maxIl)*100}%`,background:"#3b82f6",borderRadius:99}}/></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ÖDEME GEÇMİŞİ ──────────────────────────────────────────────────────────
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
        <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div><div style={{fontWeight:700,fontSize:15}}>{firma.firma_adi}</div><div style={{fontSize:12,color:"#aaa"}}>Ödeme Takibi</div></div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
          {/* Bu ay toggle */}
          <div style={{background:buAyO?.odeme_yapti?"#ecfdf5":"#fef2f2",border:`1.5px solid ${buAyO?.odeme_yapti?"#10b981":"#ef4444"}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{ayLabel(buAy())}</div>
              <div style={{fontSize:12,color:"#888",marginTop:1}}>{buAyO?.odeme_yapti?`✅ ${Number(buAyO?.tutar||0).toLocaleString("tr")} ₺`:"❌ Ödenmedi"}</div>
            </div>
            <button onClick={toggleBuAy} style={{padding:"8px 14px",borderRadius:99,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",background:buAyO?.odeme_yapti?"#10b981":"#ef4444",color:"#fff"}}>
              {buAyO?.odeme_yapti?"Ödedi ✓":"Ödenmedi"}
            </button>
          </div>
          {/* Ay seç */}
          <div style={{background:"#f9f9f9",borderRadius:12,padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontWeight:700,fontSize:12,color:"#555"}}>📝 Ödeme Kaydı</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
              {sonAylar.map(ay=>{const v=odemeler.find(o=>o.ay===ay); const a=seciliAy===ay; return(
                <button key={ay} onClick={()=>{setSeciliAy(ay);if(v)setYeni({tutar:v.tutar||"",tarih:v.odeme_tarihi||new Date().toISOString().slice(0,10),odeme_yapti:v.odeme_yapti});else setYeni({tutar:firma.tutar||"",tarih:new Date().toISOString().slice(0,10),odeme_yapti:false});}}
                  style={{padding:"5px 11px",borderRadius:99,border:`1.5px solid ${a?"#1a1a1a":"#e8e8e8"}`,background:a?"#1a1a1a":"#fff",color:a?"#fff":"#555",fontSize:10,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
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
                <button key={String(o.v)} onClick={()=>setYeni(f=>({...f,odeme_yapti:o.v}))} style={{padding:"9px",borderRadius:10,border:`2px solid ${yeni.odeme_yapti===o.v?"#1a1a1a":"#e8e8e8"}`,background:yeni.odeme_yapti===o.v?"#1a1a1a":"#fff",color:yeni.odeme_yapti===o.v?"#fff":"#555",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>
              ))}
            </div>
            <button onClick={kaydet} disabled={kayitLoading} style={{...S.btnPrimary,opacity:kayitLoading?.6:1}}>💾 {kayitLoading?"Kaydediliyor...":"Kaydet"}</button>
          </div>
          {/* Geçmiş */}
          <div>
            <div style={{fontWeight:700,fontSize:12,color:"#555",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
              <span>📋 Ödeme Geçmişi</span>
              <span style={{color:"#10b981"}}>Toplam: {toplamO.toLocaleString("tr")} ₺</span>
            </div>
            {loading&&<div style={{textAlign:"center",padding:"16px",color:"#ccc",fontSize:13}}>Yükleniyor…</div>}
            {!loading&&odemeler.length===0&&<div style={{textAlign:"center",padding:"16px",color:"#ccc",fontSize:13}}>Kayıt yok.</div>}
            {odemeler.map(o=>(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:o.odeme_yapti?"#f0fdf4":"#fef2f2",borderRadius:10,padding:"10px 12px",marginBottom:6}}>
                <div><div style={{fontWeight:600,fontSize:13}}>{ayLabel(o.ay)}</div>{o.odeme_tarihi&&<div style={{fontSize:11,color:"#888"}}>{new Date(o.odeme_tarihi).toLocaleDateString("tr-TR")}</div>}</div>
                <div style={{fontWeight:700,fontSize:14,color:o.odeme_yapti?"#10b981":"#ef4444"}}>{o.odeme_yapti?`${Number(o.tutar).toLocaleString("tr")} ₺`:"❌"}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"10px 16px 28px",borderTop:"1px solid #f0f0f0",flexShrink:0}}>
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

  const stats=useMemo(()=>({ toplamF:firmalar.length, odeyenler:Object.values(odemeDur).filter(Boolean).length, toplamT:firmalar.reduce((s,f)=>s+(Number(f.tutar)||0),0), tahsil:firmalar.filter(f=>odemeDur[f.id]).reduce((s,f)=>s+(Number(f.tutar)||0),0) }),[firmalar,odemeDur]);

  const openAdd=()=>{setForm(EMPTY_FIRMA);setModal("add");};
  const openEdit=(f)=>{setForm({firma_adi:f.firma_adi,tutar:f.tutar,odeme_tipi:f.odeme_tipi,ertugrul:f.ertugrul||"",burak:f.burak||"",onur:f.onur||"",notlar:f.notlar||""});setModal(f);setDetailF(null);};
  const saveForm=async()=>{ if(!form.firma_adi.trim())return; const p={firma_adi:form.firma_adi,tutar:Number(form.tutar)||0,odeme_tipi:form.odeme_tipi,ertugrul:Number(form.ertugrul)||0,burak:Number(form.burak)||0,onur:Number(form.onur)||0,notlar:form.notlar||"",user_id:userId}; if(modal==="add")await supabase.from("firmalar").insert([p]); else await supabase.from("firmalar").update(p).eq("id",modal.id); setModal(null);fetchF(); };
  const delF=async(id)=>{ await supabase.from("firmalar").delete().eq("id",id); setConfirmDel(null);setModal(null);setDetailF(null);fetchF(); };
  const inp=(f)=>({value:form[f],onChange:e=>setForm(x=>({...x,[f]:e.target.value}))});

  return (
    <div style={{padding:"12px",maxWidth:640,margin:"0 auto",paddingBottom:90}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[{icon:"🏢",label:"Toplam Firma",value:stats.toplamF},{icon:"✅",label:"Bu Ay Ödedi",value:`${stats.odeyenler}/${stats.toplamF}`},{icon:"💰",label:"Toplam Tutar",value:stats.toplamT.toLocaleString("tr")+"₺"},{icon:"🏦",label:"Tahsil Edilen",value:stats.tahsil.toLocaleString("tr")+"₺"}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:18,marginBottom:5}}>{s.icon}</div>
            <div style={{fontSize:18,fontWeight:700,letterSpacing:"-0.02em"}}>{s.value}</div>
            <div style={{fontSize:10,color:"#bbb",marginTop:3,fontWeight:500}}>{s.label}</div>
          </div>
        ))}
      </div>
      <button onClick={openAdd} style={{...S.btnPrimary,width:"100%",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <span style={{fontSize:17}}>+</span> Yeni Firma Ekle
      </button>
      {loading&&<div style={{textAlign:"center",padding:"40px",color:"#ccc"}}>Yükleniyor…</div>}
      {!loading&&firmalar.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#ccc"}}>Henüz firma yok.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {firmalar.map(f=>{const odedi=odemeDur[f.id]; return(
          <div key={f.id} style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"13px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,cursor:"pointer"}} onClick={()=>setDetailF(f)}>
                <div style={{fontWeight:700,fontSize:15}}>{f.firma_adi}</div>
                <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{Number(f.tutar).toLocaleString("tr")} ₺ · <span style={{color:f.odeme_tipi==="faturali"?"#3b82f6":"#10b981",fontWeight:600}}>{f.odeme_tipi==="faturali"?"🧾 Faturalı":"💵 Nakit"}</span></div>
              </div>
              <button onClick={()=>setOdemeModal(f)} style={{padding:"5px 10px",borderRadius:99,border:"none",fontWeight:700,fontSize:11,cursor:"pointer",background:odedi?"#ecfdf5":"#fef2f2",color:odedi?"#10b981":"#ef4444",flexShrink:0}}>
                {odedi?"✅ Ödedi":"❌ Ödemedi"}
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
              {[{ad:"Ertuğrul",val:f.ertugrul},{ad:"Burak",val:f.burak},{ad:"Onur",val:f.onur}].map(k=>(
                <div key={k.ad} style={{background:"#f9f9f9",borderRadius:8,padding:"7px 8px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#bbb",fontWeight:600,textTransform:"uppercase"}}>{k.ad}</div>
                  <div style={{fontSize:13,fontWeight:700,marginTop:1}}>{Number(k.val||0).toLocaleString("tr")}₺</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setOdemeModal(f)} style={{width:"100%",background:"#f5f5f5",border:"none",padding:"8px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",color:"#444"}}>📋 Ödeme Geçmişi</button>
          </div>
        );})}
      </div>

      {/* Detail */}
      {detailF&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setDetailF(null)}>
          <div style={S.sheet}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontWeight:700,fontSize:16}}>{detailF.firma_adi}</div>
              <button onClick={()=>setDetailF(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
              {[{icon:"💰",label:"Aylık Tutar",val:Number(detailF.tutar).toLocaleString("tr")+" ₺"},{icon:"🧾",label:"Ödeme Tipi",val:detailF.odeme_tipi==="faturali"?"Faturalı":"Nakit"}].map(r=>(
                <div key={r.label} style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:38,height:38,background:"#f5f5f5",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.icon}</div>
                  <div><div style={{fontSize:10,color:"#bbb",fontWeight:700,textTransform:"uppercase"}}>{r.label}</div><div style={{fontSize:14,fontWeight:500}}>{r.val}</div></div>
                </div>
              ))}
              <div style={{background:"#f9f9f9",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",marginBottom:8}}>Bölüşüm</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{ad:"Ertuğrul",val:detailF.ertugrul},{ad:"Burak",val:detailF.burak},{ad:"Onur",val:detailF.onur}].map(k=>(
                    <div key={k.ad} style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#bbb",fontWeight:600}}>{k.ad}</div>
                      <div style={{fontSize:15,fontWeight:700,marginTop:2}}>{Number(k.val||0).toLocaleString("tr")} ₺</div>
                    </div>
                  ))}
                </div>
              </div>
              {detailF.notlar&&<div style={{background:"#fafafa",border:"1px solid #f0f0f0",borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10,color:"#bbb",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Not</div><div style={{fontSize:13}}>{detailF.notlar}</div></div>}
            </div>
            <div style={{padding:"10px 16px 28px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>setDetailF(null)} style={{...S.btnGhost,flex:1}}>Kapat</button>
              <button onClick={()=>setConfirmDel(detailF.id)} style={{...S.btnGhost,color:"#ef4444",borderColor:"#fecaca"}}>Sil</button>
              <button onClick={()=>openEdit(detailF)} style={{...S.btnPrimary,flex:2}}>✏️ Düzenle</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit */}
      {modal&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontWeight:700,fontSize:15}}>{modal==="add"?"Yeni Firma":"Firma Düzenle"}</div>
              <button onClick={()=>setModal(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
              <div style={S.field}><label style={S.label}>Firma Adı *</label><input {...inp("firma_adi")} placeholder="Örn: ABC Dijital" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Aylık Tutar (₺)</label><input {...inp("tutar")} type="number" placeholder="5000" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Ödeme Tipi</label>
                <select {...inp("odeme_tipi")} style={S.input}><option value="faturali">🧾 Faturalı</option><option value="nakit">💵 Nakit</option></select>
              </div>
              <div>
                <div style={{...S.label,marginBottom:8}}>Bölüşüm (₺)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{k:"ertugrul",l:"Ertuğrul"},{k:"burak",l:"Burak"},{k:"onur",l:"Onur"}].map(x=>(
                    <div key={x.k} style={S.field}><label style={S.label}>{x.l}</label><input {...inp(x.k)} type="number" placeholder="0" style={S.input}/></div>
                  ))}
                </div>
                <div style={{fontSize:11,color:"#888",marginTop:5,textAlign:"right"}}>
                  Toplam: {(Number(form.ertugrul||0)+Number(form.burak||0)+Number(form.onur||0)).toLocaleString("tr")} ₺
                  {Number(form.tutar)>0&&Number(form.ertugrul||0)+Number(form.burak||0)+Number(form.onur||0)!==Number(form.tutar)&&<span style={{color:"#ef4444",marginLeft:5}}>⚠️</span>}
                </div>
              </div>
              <div style={S.field}><label style={S.label}>Not (opsiyonel)</label><textarea {...inp("notlar")} rows={2} placeholder="Ek notlar…" style={{...S.input,resize:"vertical"}}/></div>
            </div>
            <div style={{padding:"10px 16px 28px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,flexShrink:0}}>
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
              <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Firmayı sil?</div>
              <div style={{fontSize:13,color:"#aaa",marginBottom:24}}>Tüm ödeme geçmişi silinir.</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setConfirmDel(null)} style={{...S.btnGhost,flex:1}}>İptal</button>
                <button onClick={()=>delF(confirmDel)} style={{...S.btnPrimary,flex:1,background:"#ef4444"}}>Sil</button>
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
    <div style={{minHeight:"100vh",background:"#f6f6f5",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#1a1a1a",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea,button{font-family:inherit}
        .sinav-btn{border:2px solid #e8e8e8;border-radius:10px;padding:9px 6px;cursor:pointer;background:#fff;text-align:center;width:100%}
        .sinav-btn.on{border-color:#1a1a1a;background:#1a1a1a;color:#fff}
        .chip{padding:7px 13px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid transparent;white-space:nowrap;background:none}
        .card{background:#fff;border:1px solid #ebebeb;border-radius:12px;padding:13px 14px;cursor:pointer;transition:opacity .1s}
        .card:active{opacity:.8}
      `}</style>

      {/* TOP BAR — sadece logo + sağ aksiyonlar */}
      <div style={{background:"#fff",borderBottom:"1px solid #ebebeb",padding:"0 14px",display:"flex",alignItems:"center",height:52,position:"sticky",top:0,zIndex:50}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontWeight:500,fontSize:17,letterSpacing:"-0.04em"}}>crm<span style={{color:"#6366f1"}}>.</span></div>
        <div style={{flex:1}}/>
        {sayfa==="leads"&&<button onClick={()=>setShowImport(true)} style={{background:"#f5f5f5",border:"none",padding:"7px 10px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",color:"#444",marginRight:6}}>📥</button>}
        <button onClick={()=>supabase.auth.signOut()} style={{background:"#f5f5f5",border:"none",padding:"7px 10px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",color:"#444"}}>Çıkış</button>
        {sayfa==="leads"&&<button onClick={openAdd} style={{...S.btnPrimary,padding:"8px 14px",marginLeft:6,fontSize:13}}>+ Yeni</button>}
      </div>

      {/* İÇERİK */}
      <div style={{paddingBottom:72}}>
        {sayfa==="leads"&&(
          <div style={{padding:"12px 12px 0",maxWidth:640,margin:"0 auto"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{label:"Lead",value:stats.total,icon:"👥"},{label:"Kazanılan",value:stats.kazanildi,icon:"✅"},{label:"Öğrenci",value:stats.topOg.toLocaleString("tr"),icon:"🎓"}].map(s=>(
                <div key={s.label} style={{background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"11px 10px"}}>
                  <div style={{fontSize:16,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontSize:18,fontWeight:700,letterSpacing:"-0.03em",lineHeight:1}}>{s.value}</div>
                  <div style={{fontSize:9,color:"#bbb",marginTop:3,fontWeight:500}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{position:"relative",marginBottom:8}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#ccc",fontSize:14}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ara…" style={{...S.input,paddingLeft:36,width:"100%"}}/>
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:10}}>
              {[{key:"tümü",label:"Tümü"},...STATUSES].map(s=>{ const a=filterStatus===s.key; return <button key={s.key} className="chip" onClick={()=>setFilterStatus(s.key)} style={{background:a?"#1a1a1a":"#fff",color:a?"#fff":"#666",borderColor:a?"#1a1a1a":"#e8e8e8"}}>{s.label}</button>; })}
            </div>
            {loading&&<div style={{textAlign:"center",padding:"40px",color:"#ccc"}}>Yükleniyor…</div>}
            {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#ccc"}}>Kayıt bulunamadı.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.map(lead=>(
                <div key={lead.id} className="card" onClick={()=>setDetailId(lead.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1,minWidth:0,marginRight:8}}>
                      <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lead.name}</div>
                      <div style={{fontSize:12,color:"#aaa",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lead.kurum||"—"}</div>
                    </div>
                    <StatusBadge statusKey={lead.status}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <SinavBadge types={lead.sinav_tipi}/>
                    <div style={{display:"flex",gap:8,fontSize:11,color:"#bbb"}}>
                      {lead.il&&<span>📍{lead.il}</span>}
                      {lead.ogrenci_sayisi>0&&<span>🎓{lead.ogrenci_sayisi}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:8,fontSize:11,color:"#ccc",textAlign:"center",paddingBottom:4}}>{filtered.length} kayıt</div>
          </div>
        )}
        {sayfa==="rapor"&&<RaporSayfasi leads={leads}/>}
        {sayfa==="ajans"&&<AjansSayfasi userId={session.user.id}/>}
      </div>

      {/* ALT TAB BAR */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #ebebeb",display:"flex",zIndex:50,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {[{key:"leads",icon:"👥",label:"Leads"},{key:"rapor",icon:"📊",label:"Rapor"},{key:"ajans",icon:"🏢",label:"Ajans"}].map(t=>{const a=sayfa===t.key; return(
          <button key={t.key} onClick={()=>setSayfa(t.key)} style={{flex:1,background:"none",border:"none",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{fontSize:20}}>{t.icon}</div>
            <div style={{fontSize:10,fontWeight:a?700:500,color:a?"#1a1a1a":"#bbb"}}>{t.label}</div>
            {a&&<div style={{width:18,height:2.5,background:"#1a1a1a",borderRadius:99}}/>}
          </button>
        );})}
      </div>

      {/* LEAD DETAIL */}
      {currentLead&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setDetailId(null)}>
          <div style={S.sheet}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div><div style={{fontWeight:700,fontSize:16}}>{currentLead.name}</div><div style={{fontSize:12,color:"#aaa"}}>{currentLead.kurum}</div></div>
              <button onClick={()=>setDetailId(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
              <StatusBadge statusKey={currentLead.status}/>
              {[{icon:"📞",label:"Telefon",val:currentLead.phone||"—"},{icon:"📍",label:"Konum",val:[currentLead.ilce,currentLead.il].filter(Boolean).join(" / ")||"—"},{icon:"🎓",label:"Öğrenci",val:`${currentLead.ogrenci_sayisi||0} öğrenci`}].map(r=>(
                <div key={r.label} style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:38,height:38,background:"#f5f5f5",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.icon}</div>
                  <div><div style={{fontSize:10,color:"#bbb",fontWeight:700,textTransform:"uppercase"}}>{r.label}</div><div style={{fontSize:14,fontWeight:500}}>{r.val}</div></div>
                </div>
              ))}
              <div><div style={{fontSize:10,color:"#bbb",fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Sınav Tipi</div><SinavBadge types={currentLead.sinav_tipi}/></div>
              {currentLead.note&&<div style={{background:"#fafafa",border:"1px solid #f0f0f0",borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10,color:"#bbb",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Not</div><div style={{fontSize:13,color:"#555"}}>{currentLead.note}</div></div>}
            </div>
            <div style={{padding:"10px 16px 28px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,flexShrink:0}}>
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
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontWeight:700,fontSize:15}}>{modal==="add"?"Yeni Lead":"Lead Düzenle"}</div>
              <button onClick={()=>setModal(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
              <div style={S.field}><label style={S.label}>Ad Soyad *</label><input {...inp("name")} placeholder="Ahmet Yılmaz" style={S.input}/></div>
              <div style={S.field}><label style={S.label}>Telefon</label><input {...inp("phone")} type="tel" placeholder="05__ ___ __ __" style={S.input}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={S.field}><label style={S.label}>İl</label><select {...inp("il")} style={S.input}><option value="">Seçiniz</option>{ILLER.map(il=><option key={il}>{il}</option>)}</select></div>
                <div style={S.field}><label style={S.label}>İlçe</label><input {...inp("ilce")} placeholder="İlçe" style={S.input}/></div>
              </div>
              <div style={S.field}><label style={S.label}>Kurum</label><input {...inp("kurum")} placeholder="Gelecek Dershanesi" style={S.input}/></div>
              <div>
                <div style={{...S.label,marginBottom:6}}>Sınav Tipi</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {SINAV_TIPLERI.map(s=>{const a=form.sinavTipi.includes(s.key); return(
                    <button key={s.key} type="button" className={`sinav-btn${a?" on":""}`} onClick={()=>toggleSinav(s.key)}>
                      <div style={{fontWeight:700,fontSize:14}}>{s.label}</div>
                      <div style={{fontSize:9,opacity:.6,marginTop:1}}>{s.desc}</div>
                      {a&&<div style={{fontSize:12,marginTop:2}}>✓</div>}
                    </button>
                  );})}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={S.field}><label style={S.label}>Öğrenci Sayısı</label><input {...inp("ogrenciSayisi")} type="number" min="0" placeholder="150" style={S.input}/></div>
                <div style={S.field}><label style={S.label}>Durum</label><select {...inp("status")} style={S.input}>{STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
              </div>
              <div style={S.field}><label style={S.label}>Not</label><textarea {...inp("note")} rows={2} style={{...S.input,resize:"vertical"}}/></div>
            </div>
            <div style={{padding:"10px 16px 28px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,flexShrink:0}}>
              {modal!=="add"&&<button onClick={()=>setConfirmDel(modal.id)} style={{...S.btnGhost,color:"#ef4444",borderColor:"#fecaca"}}>Sil</button>}
              <button onClick={()=>setModal(null)} style={{...S.btnGhost}}>İptal</button>
              <button onClick={saveForm} style={{...S.btnPrimary,flex:1}}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LEAD */}
      {confirmDel&&sayfa==="leads"&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setConfirmDel(null)}>
          <div style={S.sheet}>
            <div style={{padding:"32px 24px",textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Sil?</div>
              <div style={{fontSize:13,color:"#aaa",marginBottom:24}}>Bu işlem geri alınamaz.</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setConfirmDel(null)} style={{...S.btnGhost,flex:1}}>İptal</button>
                <button onClick={()=>deleteLead(confirmDel)} style={{...S.btnPrimary,flex:1,background:"#ef4444"}}>Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImport&&<BulkImportModal onClose={()=>setShowImport(false)} onImport={fetchLeads} userId={session.user.id}/>}
    </div>
  );
}
