import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  School, Home, Settings, LogIn, UserPlus, LogOut, Search, 
  BookOpen, GraduationCap, FileText, PlayCircle, Star, 
  Save, AlertCircle, CheckCircle, Info, FileVideo, ArrowLeft
} from 'lucide-react';
import './App.css';

const UNIVERSITY_LIST = [
  "จุฬาลงกรณ์มหาวิทยาลัย", "มหาวิทยาลัยเกษตรศาสตร์", "มหาวิทยาลัยขอนแก่น", "มหาวิทยาลัยเชียงใหม่",
  "มหาวิทยาลัยธรรมศาสตร์", "มหาวิทยาลัยมหิดล", "มหาวิทยาลัยศิลปากร", "มหาวิทยาลัยสงขลานครินทร์",
  "สถาบันบัณฑิตพัฒนบริหารศาสตร์", "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี", "มหาวิทยาลัยเทคโนโลยีสุรนารี",
  "มหาวิทยาลัยนเรศวร", "มหาวิทยาลัยมหาสารคาม", "มหาวิทยาลัยวลัยลักษณ์", "มหาวิทยาลัยแม่ฟ้าหลวง",
  "มหาวิทยาลัยราชภัฏพิบูลสงคราม", "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
  "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ", "มหาวิทยาลัยบูรพา", "มหาวิทยาลัยพะเยา", "อื่นๆ"
];

const COLORS = ['#E53935', '#880E4F', '#4A148C', '#B71C1C', '#004D40', '#E65100', '#F5C842', '#1ABFA0'];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [portfolioId, setPortfolioId] = useState(() => localStorage.getItem('portfolioId') || null);

  const [page, setPage] = useState('home');
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [portfoliosData, setPortfoliosData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [savedPorts, setSavedPorts] = useState(() => {
    const saved = localStorage.getItem('savedPorts');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchText, setSearchText] = useState('');
  const [filterUni, setFilterUni] = useState('');
  const [filterRound, setFilterRound] = useState('');

  const [selectedAlumni, setSelectedAlumni] = useState(null);

  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regStep, setRegStep] = useState(1);
  const [regRole, setRegRole] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regGen, setRegGen] = useState('');

  const [formRound, setFormRound] = useState('');
  const [formUni, setFormUni] = useState('');
  const [formFaculty, setFormFaculty] = useState('');
  const [formMajor, setFormMajor] = useState('');
  const [formGpax, setFormGpax] = useState('');
  const [formScore, setFormScore] = useState('');
  const [formDriveLink, setFormDriveLink] = useState('');
  const [formYoutubeLink, setFormYoutubeLink] = useState('');
  const [formAdvice, setFormAdvice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem('savedPorts', JSON.stringify(savedPorts));
  }, [savedPorts]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    const syncProfileData = async () => {
      if (isLoggedIn && portfolioId) {
        const { data } = await supabase.from('portfolios').select('*').eq('id', portfolioId).single();
        if (data) {
          setFormRound(data.round || ''); setFormUni(data.uni || ''); setFormFaculty(data.faculty || '');
          setFormMajor(data.major || ''); setFormGpax(data.gpax || ''); setFormScore(data.score || '');
          setFormDriveLink(data.drive_link || ''); setFormYoutubeLink(data.youtube_link || ''); setFormAdvice(data.advice || '');
        }
      }
    };
    syncProfileData();
  }, [isLoggedIn, portfolioId]);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 4000);
  };

  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolios').select('*').eq('role', 'alumni').not('uni', 'is', null).order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id, round: item.round, faculty: item.faculty, major: item.major, uni: item.uni, name: item.name,
          gen: item.gen, color: item.color || getRandomColor(), hasPort: item.has_port, hasVid: item.has_vid,
          advice: item.advice, gpax: item.gpax, score: item.score, driveLink: item.drive_link, youtubeLink: item.youtube_link, email: item.email
        }));
        setPortfoliosData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return portfoliosData.filter(d => {
      const matchTxt = !searchText || (d.faculty + d.major).toLowerCase().includes(searchText.toLowerCase());
      const matchUni = !filterUni || d.uni === filterUni;
      const matchRound = !filterRound || d.round === filterRound;
      return matchTxt && matchUni && matchRound;
    });
  }, [searchText, filterUni, filterRound, portfoliosData]);

  const savedPortfoliosData = useMemo(() => {
    return portfoliosData.filter(d => savedPorts.includes(d.id));
  }, [savedPorts, portfoliosData]);

  const viewDetail = (id) => {
    setSelectedAlumni(portfoliosData.find(x => x.id === id));
    setPage('detail');
    window.scrollTo(0, 0);
  };

  const toggleSavePort = (e, id) => {
    if (e) e.stopPropagation();
    setSavedPorts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const doLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showAlert('warning', 'กรุณากรอกอีเมล/Username และรหัสผ่านให้ครบถ้วน');
      return;
    }
    try {
      const { data, error } = await supabase.from('portfolios').select('*').or(`email.eq.${loginEmail},name.eq.${loginEmail}`).limit(1);
      if (error) throw error;

      if (data && data.length > 0) {
        const item = data[0];
        const userObj = { name: item.name, role: item.role || 'student', grade: item.grade || '', gen: item.gen || '', school: 'สตรีวิทยา ๓', email: item.email };
        localStorage.setItem('isLoggedIn', 'true'); localStorage.setItem('currentUser', JSON.stringify(userObj)); localStorage.setItem('portfolioId', item.id.toString());
        setPortfolioId(item.id); setCurrentUser(userObj);
        
        setFormRound(item.round || ''); setFormUni(item.uni || ''); setFormFaculty(item.faculty || ''); setFormMajor(item.major || '');
        setFormGpax(item.gpax || ''); setFormScore(item.score || ''); setFormDriveLink(item.drive_link || ''); setFormYoutubeLink(item.youtube_link || ''); setFormAdvice(item.advice || '');

        setIsLoggedIn(true); setPage('home'); showAlert('success', 'เข้าสู่ระบบสำเร็จ!'); window.scrollTo(0, 0);
      } else {
        showAlert('error', 'ไม่พบบัญชีผู้ใช้นี้ในระบบ หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) { showAlert('error', 'เข้าสู่ระบบล้มเหลว: ' + err.message); }
  };

  const handleRegisterNext = async (step) => {
    if (step === 2) {
      if (!regEmail || !regUsername || !regPassword) { showAlert('warning', 'กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regEmail)) { showAlert('warning', 'รูปแบบอีเมลไม่ถูกต้อง'); return; }
      try {
        const { data: emailCheck } = await supabase.from('portfolios').select('email').eq('email', regEmail);
        if (emailCheck && emailCheck.length > 0) { showAlert('error', 'อีเมลนี้ถูกลงทะเบียนแล้ว'); return; }
        const { data: nameCheck } = await supabase.from('portfolios').select('name').eq('name', regUsername);
        if (nameCheck && nameCheck.length > 0) { showAlert('error', 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว'); return; }
      } catch (err) { showAlert('error', 'ไม่สามารถตรวจสอบข้อมูลได้'); return; }
    }
    
    if (step === 3) {
      if (regRole === 'student' && !regGrade) { showAlert('warning', 'กรุณาเลือกระดับชั้น'); return; }
      if (regRole === 'alumni' && !regGen) { showAlert('warning', 'กรุณาเลือกรุ่นที่จบ'); return; }

      try {
        const payload = { email: regEmail, name: regUsername, role: regRole, grade: regRole === 'student' ? regGrade : null, gen: regRole === 'alumni' ? regGen : null, color: getRandomColor() };
        const { data, error } = await supabase.from('portfolios').insert([payload]).select();
        if (error) throw error;
        
        const userObj = { name: regUsername, role: regRole, grade: regGrade, gen: regGen, school: 'สตรีวิทยา ๓', email: regEmail };
        localStorage.setItem('isLoggedIn', 'true'); localStorage.setItem('currentUser', JSON.stringify(userObj));
        if (data && data.length > 0) { setPortfolioId(data[0].id); localStorage.setItem('portfolioId', data[0].id.toString()); }

        setCurrentUser(userObj); setFormRound(''); setFormUni(''); setFormFaculty(''); setFormMajor('');
        setIsLoggedIn(true); setPage('home'); showAlert('success', 'สร้างบัญชีสำเร็จ! ยินดีต้อนรับครับ');
      } catch (err) { showAlert('error', 'เกิดข้อผิดพลาด: ' + err.message); return; }
    }
    setRegStep(step);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); localStorage.removeItem('portfolioId');
    setIsLoggedIn(false); setCurrentUser(null); setPortfolioId(null); setPage('home'); showAlert('success', 'ออกจากระบบเรียบร้อยแล้ว');
  };

  const handleSaveProfile = async () => {
    if (!formFaculty || !formMajor || !formUni || !formRound) { showAlert('warning', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'); return; }
    setIsSaving(true);
    try {
      const payload = { round: formRound, faculty: formFaculty, major: formMajor, uni: formUni, gpax: formGpax, score: formScore, drive_link: formDriveLink, youtube_link: formYoutubeLink, advice: formAdvice, has_port: formDriveLink ? true : false, has_vid: formYoutubeLink ? true : false };
      if (portfolioId) {
        const { error } = await supabase.from('portfolios').update(payload).eq('id', portfolioId);
        if (error) throw error; showAlert('success', 'บันทึกและเผยแพร่ข้อมูลเรียบร้อยแล้ว!');
      } else { showAlert('error', 'ไม่พบรหัสผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่'); }
      fetchPortfolios(); 
    } catch (error) { showAlert('error', 'เกิดข้อผิดพลาด: ' + error.message); } finally { setIsSaving(false); }
  };

  return (
    <>
      {alertMsg.text && (
        <div className={`global-toast toast-${alertMsg.type}`}>
          {alertMsg.type === 'error' && <AlertCircle size={20} />}
          {alertMsg.type === 'success' && <CheckCircle size={20} />}
          {alertMsg.type === 'warning' && <Info size={20} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      <nav>
        <div className="logo" style={{cursor: 'pointer'}} onClick={() => { setPage('home'); fetchPortfolios(); }}>
          <div className="logo-icon"><School size={24} /></div>
          NMRSW Student Buddy
        </div>
        <div className="nav-links">
          <button className={`link ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}><Home size={18} /> หน้าหลัก</button>
          {!isLoggedIn ? (
            <>
              <button className={`link ${page === 'login' ? 'active' : ''}`} onClick={() => setPage('login')}><LogIn size={18} /> เข้าสู่ระบบ</button>
              <button className="btn-nav" onClick={() => { setPage('register'); setRegStep(1); }}><UserPlus size={18} /> สมัครสมาชิก</button>
            </>
          ) : (
            <button className={`link ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}><Settings size={18} /> ตั้งค่า</button>
          )}
        </div>
      </nav>

      {/* ===== HOME PAGE ===== */}
      {page === 'home' && (
         <div className="page active">
         <div className="hero">
           <h1>ค้นหาแนวทาง <span>รุ่นพี่ NMR.SW</span></h1>
           <p style={{ marginBottom: 0 }}>รวบรวมประสบการณ์จากพี่ๆ พร้อม Portfolio และคลิปแนะนำ ครอบคลุมทุกสายการเรียน ทั้งวิทย์-คณิต ศิลป์-คำนวณ และศิลป์-ภาษา</p>
         </div>
         
         <div className="stats-strip">
           <div className="stat"><div className="stat-num">{portfoliosData.length}</div><div className="stat-label">ศิษย์เก่าที่แชร์ข้อมูล</div></div>
           <div className="stat"><div className="stat-num">{new Set(portfoliosData.map(d => d.uni)).size}</div><div className="stat-label">มหาวิทยาลัย</div></div>
           <div className="stat"><div className="stat-num">{portfoliosData.filter(d => d.hasPort).length}</div><div className="stat-label">Portfolio ที่แชร์</div></div>
         </div>

         <div className="main-content">
           <div className="filter-bar">
             <div><label>ค้นหาคณะ / สาขา</label><input type="text" className="premium-input" placeholder="เช่น วิศวกรรมคอมพิวเตอร์..." value={searchText} onChange={e => setSearchText(e.target.value)} /></div>
             <div>
               <label>มหาวิทยาลัย</label>
               <select className="premium-input" value={filterUni} onChange={e => setFilterUni(e.target.value)}>
                 <option value="">ทั้งหมด</option>
                 {UNIVERSITY_LIST.map(uni => (<option key={uni} value={uni}>{uni}</option>))}
               </select>
             </div>
             <div><label>รอบที่ติด</label><select className="premium-input" value={filterRound} onChange={e => setFilterRound(e.target.value)}><option value="">ทั้งหมด</option><option value="1">รอบ 1 - Portfolio</option><option value="2">รอบ 2 - Quota</option><option value="3">รอบ 3 Admission</option></select></div>
             <div><button className="btn-search"><Search size={18} /> ค้นหา</button></div>
           </div>

           <div className="results-header">
             <h3>ผลการค้นหาทั้งหมด</h3><span className="results-count">แสดง {filteredData.length} รายการ</span>
           </div>
           
           {isLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text2)' }}>
                <h3>⏳ กำลังดึงข้อมูลจาก Database...</h3>
              </div>
           ) : (
             <div className="cards-grid">
               {filteredData.length === 0 ? (
                 <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon"><Search size={48} /></div><h3>ยังไม่มีข้อมูลในระบบ</h3><p>รอรุ่นพี่มาแชร์ประสบการณ์อยู่นะครับ!</p></div>
               ) : (
                 filteredData.map(d => (
                   <div key={d.id} className="uni-card" style={{ position: 'relative' }} onClick={() => viewDetail(d.id)}>
                     <button 
                        style={{ position: 'absolute', top: '12px', right: '12px', background: savedPorts.includes(d.id) ? '#FFFDE7' : 'white', border: `1px solid ${savedPorts.includes(d.id) ? '#F5C842' : 'var(--gray2)'}`, width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onClick={(e) => toggleSavePort(e, d.id)}
                        title={savedPorts.includes(d.id) ? "ยกเลิกการบันทึก" : "บันทึกพอร์ตนี้"}
                      >
                        <Star size={18} fill={savedPorts.includes(d.id) ? '#F5C842' : 'none'} color={savedPorts.includes(d.id) ? '#F5C842' : '#94a3b8'} />
                      </button>

                     <div className="card-top">
                       <div><span className={`card-round r${d.round}`}>{d.round === '1' ? '⭐ รอบ 1' : d.round === '2' ? '📋 รอบ 2' : '📝 รอบ 3'}</span></div>
                       <div className="card-faculty" style={{ paddingRight: '30px' }}>{d.faculty}</div>
                       <div className="card-major">{d.major}</div>
                       <div className="card-uni" style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px'}}><School size={16} /> {d.uni}</div>
                     </div>
                     <div className="card-bottom">
                       <div className="alumni-info"><div className="avatar" style={{ background: d.color }}>{d.name.charAt(0)}</div><div><div className="alumni-name">{d.name}</div><div className="alumni-gen">รุ่น {d.gen}</div></div></div>
                       <div className="card-assets">
                         {d.hasPort && <span className="asset-badge has-port" title="มี Portfolio"><FileText size={16} /></span>}
                         {d.hasVid && <span className="asset-badge has-vid" title="มีวิดีโอแนะนำตัว"><PlayCircle size={16} /></span>}
                       </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
           )}
         </div>
       </div>
      )}

      {/* ===== MY PROFILE PAGE (ตั้งค่า) ===== */}
      {page === 'profile' && currentUser && (
        <div className="profile-page-wrapper">
          <div className="profile-header-banner">
            <div className="profile-avatar-large">{currentUser.name.charAt(0)}</div>
            <div className="profile-header-info">
              <h1>{currentUser.name}</h1>
              <p>
                <span className="role-badge">
                  {currentUser.role === 'student' ? <><BookOpen size={14} /> นักเรียนปัจจุบัน</> : <><GraduationCap size={14} /> ศิษย์เก่า</>}
                </span>
                {currentUser.role === 'student' ? `ชั้น ${currentUser.grade}` : `รุ่นที่ ${currentUser.gen}`} 
                <span style={{opacity: 0.5}}>|</span> <School size={16} /> โรงเรียน{currentUser.school}
              </p>
            </div>
          </div>

          <div className="profile-content-grid">
            <div>
              <div className="profile-card">
                <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}><Settings size={20}/> ข้อมูลบัญชี</h3>
                <div className="info-item" style={{ marginBottom: '1rem' }}><label>อีเมล</label><p>{currentUser.email}</p></div>
                <div className="info-item" style={{ marginBottom: '1rem' }}><label>สถานะ</label><p>{currentUser.role === 'student' ? 'นักเรียน' : 'ศิษย์เก่า'}</p></div>
                
                {currentUser.role === 'alumni' && (
                  <div className="info-item" style={{ padding: '12px', background: 'var(--gray1)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <label>สถานะข้อมูลในหน้าค้นหา</label>
                    {formUni ? (
                      <p style={{ color: '#16A34A', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px', display:'flex', alignItems:'center', gap:'6px' }}><CheckCircle size={16}/> เผยแพร่แล้ว</p>
                    ) : (
                      <p style={{ color: '#D97706', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px', display:'flex', alignItems:'center', gap:'6px' }}><AlertCircle size={16}/> ยังไม่เผยแพร่</p>
                    )}
                  </div>
                )}
                
                <button className="btn-main" style={{ marginTop: '10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', boxShadow: 'none' }} onClick={handleLogout}>
                  <LogOut size={18} /> ออกจากระบบ
                </button>
              </div>
            </div>

            <div>
              {currentUser.role === 'student' ? (
                <div className="profile-card">
                  <h3 style={{ marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}><Star fill="#F5C842" color="#F5C842" size={24} /> พอร์ตโฟลิโอที่บันทึกไว้</h3>
                  
                  {savedPortfoliosData.length === 0 ? (
                    <div className="empty-state" style={{ padding: '3rem 2rem', border: '1px dashed var(--gray3)', background: 'var(--light)', borderRadius: '16px' }}>
                      <div className="icon"><Star size={48} /></div>
                      <h4>ยังไม่มีพอร์ตโฟลิโอที่บันทึกไว้</h4>
                      <p style={{marginTop: '8px'}}>คุณสามารถกดไอคอนรูปดาวที่การ์ดของรุ่นพี่เพื่อเก็บไว้อ่านทีหลังได้ครับ</p>
                      <button className="btn-main" style={{ width: 'auto', padding: '10px 24px', marginTop: '1.5rem' }} onClick={() => setPage('home')}><Search size={18}/> ค้นหารุ่นพี่เลย</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {savedPortfoliosData.map(d => (
                         <div key={d.id} className="uni-card" style={{ position: 'relative' }} onClick={() => viewDetail(d.id)}>
                            <button 
                               style={{ position: 'absolute', top: '12px', right: '12px', background: '#FFFDE7', border: '1px solid #F5C842', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                               onClick={(e) => toggleSavePort(e, d.id)}
                             >
                               <Star size={18} fill="#F5C842" color="#F5C842" />
                             </button>
                            <div className="card-top">
                              <div><span className={`card-round r${d.round}`}>{d.round === '1' ? '⭐ รอบ 1' : d.round === '2' ? '📋 รอบ 2' : '📝 รอบ 3'}</span></div>
                              <div className="card-faculty" style={{ paddingRight: '30px' }}>{d.faculty}</div>
                              <div className="card-major">{d.major}</div>
                              <div className="card-uni" style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px'}}><School size={16}/> {d.uni}</div>
                            </div>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="profile-card">
                  <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}><FileText size={20}/> ลงข้อมูลและ Portfolio ของคุณ</h3>
                  <p style={{ color: 'var(--text2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>ข้อมูลที่กรอกตรงนี้จะถูกนำไปโชว์ในหน้าค้นหา เพื่อเป็นแนวทางให้กับน้องๆ รุ่นต่อไป</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1rem' }}>
                    <div className="field" style={{ marginBottom: 0 }}><label>รอบที่สอบติด</label><select className="premium-input" value={formRound} onChange={(e)=>setFormRound(e.target.value)}><option value="">เลือก...</option><option value="1">รอบ 1 Portfolio</option><option value="2">รอบ 2 Quota</option><option value="3">รอบ 3 Admission</option></select></div>
                    <div className="field" style={{ marginBottom: 0 }}><label>มหาวิทยาลัย</label><select className="premium-input" value={formUni} onChange={(e)=>setFormUni(e.target.value)}><option value="">เลือกมหาวิทยาลัย...</option>{UNIVERSITY_LIST.map(uni => (<option key={uni} value={uni}>{uni}</option>))}</select></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1rem' }}>
                    <div className="field" style={{ marginBottom: 0 }}><label>คณะ</label><input type="text" className="premium-input" value={formFaculty} onChange={(e)=>setFormFaculty(e.target.value)} placeholder="เช่น วิศวกรรมศาสตร์" /></div>
                    <div className="field" style={{ marginBottom: 0 }}><label>สาขา</label><input type="text" className="premium-input" value={formMajor} onChange={(e)=>setFormMajor(e.target.value)} placeholder="เช่น ซอฟต์แวร์" /></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1rem' }}>
                    <div className="field" style={{ marginBottom: 0 }}><label>เกรดเฉลี่ย (GPAX)</label><input type="text" className="premium-input" value={formGpax} onChange={(e)=>setFormGpax(e.target.value)} placeholder="เช่น 3.85" /></div>
                    <div className="field" style={{ marginBottom: 0 }}><label>คะแนนที่ใช้ยื่น</label><input type="text" className="premium-input" value={formScore} onChange={(e)=>setFormScore(e.target.value)} placeholder="เช่น TGAT 88%, A-Level 75%" /></div>
                  </div>

                  <div className="field"><label>ลิงก์ Google Drive (ไฟล์ Portfolio)</label><input type="text" className="premium-input" value={formDriveLink} onChange={(e)=>setFormDriveLink(e.target.value)} placeholder="วางลิงก์ที่ตั้งค่าเป็น 'ทุกคนที่มีลิงก์' แล้ว" /></div>
                  <div className="field"><label>ลิงก์ YouTube (คลิปวิดีโอแนะนำตัว - ถ้ามี)</label><input type="text" className="premium-input" value={formYoutubeLink} onChange={(e)=>setFormYoutubeLink(e.target.value)} placeholder="เช่น https://www.youtube.com/watch?v=..." /></div>
                  <div className="field"><label>คำแนะนำถึงน้องๆ</label><textarea className="premium-input" rows="5" value={formAdvice} onChange={(e)=>setFormAdvice(e.target.value)} placeholder="แชร์เทคนิคการเตรียมตัว, การทำพอร์ต, หรือประสบการณ์สัมภาษณ์ที่นี่..."></textarea></div>

                  <button className="btn-main" disabled={isSaving} onClick={handleSaveProfile} style={{ opacity: isSaving ? 0.7 : 1 }}>
                    {isSaving ? '⏳ กำลังบันทึกข้อมูล...' : <><Save size={18} /> บันทึกและเผยแพร่ข้อมูลสู่หน้าค้นหา</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== DETAIL PAGE ===== */}
      {page === 'detail' && selectedAlumni && (
        <div className="detail-page-wrapper">
          <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <button className="btn-back" onClick={() => setPage('home')}><ArrowLeft size={18} /> กลับหน้าหลัก</button>
              <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '8px', display: 'flex', gap: '8px' }}><span>{selectedAlumni.round === '1' ? '⭐ รอบ 1 Portfolio' : selectedAlumni.round === '2' ? '📋 รอบ 2 Quota' : '📝 รอบ 3 Admission'}</span></div>
              <h1>{selectedAlumni.faculty}</h1><p style={{fontSize: '1.1rem', opacity: 0.9, display:'flex', alignItems:'center', gap:'8px', marginTop:'8px'}}>สาขา{selectedAlumni.major} <br/> <School size={18} /> {selectedAlumni.uni}</p>
            </div>
            
            <button 
              onClick={() => toggleSavePort(null, selectedAlumni.id)}
              style={{
                background: savedPorts.includes(selectedAlumni.id) ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)',
                border: `1.5px solid ${savedPorts.includes(selectedAlumni.id) ? '#FFC107' : 'rgba(255,255,255,0.3)'}`,
                color: savedPorts.includes(selectedAlumni.id) ? '#FFC107' : 'white',
                padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '600', fontSize: '0.95rem',
                transition: 'all 0.2s', backdropFilter: 'blur(4px)'
              }}
            >
              <Star size={18} fill={savedPorts.includes(selectedAlumni.id) ? '#FFC107' : 'none'} />
              {savedPorts.includes(selectedAlumni.id) ? 'บันทึกแล้ว' : 'บันทึกพอร์ตนี้'}
            </button>
          </div>
          
          <div className="detail-content">
            <div className="info-section">
              <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="info-grid">
                  <div className="info-item"><label>ชื่อพี่ศิษย์เก่า</label><p>{selectedAlumni.name}</p></div>
                  <div className="info-item"><label>จบการศึกษารุ่น</label><p>รุ่นที่ {selectedAlumni.gen}</p></div>
                  <div className="info-item"><label>เกรดเฉลี่ย (GPAX)</label><p>{selectedAlumni.gpax}</p></div>
                  <div className="info-item"><label>คะแนนที่ใช้ยื่น</label><p>{selectedAlumni.score}</p></div>
                </div>
                <hr className="section-sep" />
                <div className="advice-box" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '16px', display:'flex', alignItems:'center', gap:'8px' }}><Info size={20}/> คำแนะนำจากพี่ถึงน้อง</h4>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8 }}>{selectedAlumni.advice}</p>
                </div>
              </div>
            </div>
            <div className="media-section">
              {selectedAlumni.hasVid && selectedAlumni.youtubeLink && (
                 <div>
                    <h3 className="media-title" style={{display:'flex', alignItems:'center', gap:'8px'}}><PlayCircle size={24}/> วีดีโอแนะนำตัว</h3>
                    <div className="video-container">
                       <iframe src={getYouTubeEmbedUrl(selectedAlumni.youtubeLink)} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                 </div>
              )}
              {selectedAlumni.hasPort && selectedAlumni.driveLink && (
                 <div>
                    <h3 className="media-title" style={{display:'flex', alignItems:'center', gap:'8px'}}><FileText size={24}/> Portfolio ฉบับเต็ม</h3>
                    <a href={selectedAlumni.driveLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div className="port-box" style={{ background: 'var(--white)', border: '1px solid var(--gray2)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="port-icon pdf" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FileText size={32} /></div>
                        <div className="port-info"><h4>Portfolio_{selectedAlumni.name.replace(' ', '_')}</h4><p style={{ color: 'var(--teal)', fontWeight: '500' }}>คลิกเพื่อเปิดดูไฟล์ผ่าน Google Drive</p></div>
                      </div>
                    </a>
                 </div>
              )}
              {!selectedAlumni.hasPort && !selectedAlumni.hasVid && (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="icon"><FileVideo size={48} /></div>
                  <h4>ยังไม่มีไฟล์ผลงาน</h4>
                  <p>พี่ยังไม่ได้อัปโหลดพอร์ตโฟลิโอหรือคลิปวิดีโอในระบบครับ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== REGISTER PAGE ===== */}
      {page === 'register' && (
        <div className="auth-page-container">
          <div className="auth-banner">
            <div className="auth-banner-content">
              <div style={{ marginBottom: '1rem', color:'white' }}><School size={64} /></div>
              <h1>สร้างบัญชี<br />NMRSW Buddy</h1>
              <p>เริ่มต้นใช้งานระบบฐานข้อมูล Portfolio และค้นหาเส้นทางการเรียนต่อจากประสบการณ์จริงของรุ่นพี่ ส.ว.๓ สู่รั้วมหาวิทยาลัย</p>
            </div>
          </div>
          <div className="auth-content">
            <div className="auth-card">
              <div className="auth-logo"><h2>สมัครสมาชิกฟรี</h2><p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>กรุณากรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่</p></div>
              <div className="step-bar" style={{ marginBottom: '2rem' }}><div className={`step ${regStep >= 1 ? 'active' : ''} ${regStep > 1 ? 'done' : ''}`}></div><div className={`step ${regStep >= 2 ? 'active' : ''} ${regStep > 2 ? 'done' : ''}`}></div><div className={`step ${regStep === 3 ? 'active done' : ''}`}></div></div>

              {regStep === 1 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div className="field"><label>อีเมล</label><input type="email" className="premium-input" placeholder="your@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} /></div>
                  <div className="field"><label>Username</label><input type="text" className="premium-input" placeholder="ตั้งชื่อผู้ใช้ของคุณ" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} /></div>
                  <div className="field"><label>รหัสผ่าน</label><input type="password" className="premium-input" placeholder="อย่างน้อย 8 ตัวอักษร" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} /></div>
                  <button className="btn-main" onClick={() => handleRegisterNext(2)}>ถัดไป →</button>
                </div>
              )}

              {regStep === 2 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <p className="section-title">เลือกสถานะของคุณ</p>
                  <div className="role-cards">
                    <div className={`role-card ${regRole === 'student' ? 'selected' : ''}`} onClick={() => setRegRole('student')}><div className="icon"><BookOpen size={32} /></div><h4>นักเรียนปัจจุบัน</h4><p>ม.1 - ม.6</p></div>
                    <div className={`role-card ${regRole === 'alumni' ? 'selected' : ''}`} onClick={() => setRegRole('alumni')}><div className="icon"><GraduationCap size={32} /></div><h4>ศิษย์เก่า</h4><p>รุ่นที่เรียนจบไปแล้ว</p></div>
                  </div>

                  {regRole === 'student' && (
                    <div style={{ animation: 'slideUp 0.3s ease' }}>
                      <p className="section-title" style={{ marginTop: '1.5rem', marginBottom: '10px' }}>กำลังศึกษาอยู่ชั้น</p>
                      <div className="grade-grid">
                        {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].map(grade => (
                          <button key={grade} className={`grade-btn ${regGrade === grade ? 'sel' : ''}`} onClick={() => setRegGrade(grade)}>{grade}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {regRole === 'alumni' && (
                    <div style={{ animation: 'slideUp 0.3s ease', marginTop: '1.5rem' }}>
                      <div className="field"><label>รุ่นที่จบ</label><select className="premium-input" value={regGen} onChange={(e) => setRegGen(e.target.value)}><option value="">เลือกรุ่นที่จบ...</option><option value="30">รุ่น 30</option><option value="31">รุ่น 31</option><option value="32">รุ่น 32</option></select></div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text2)', background: 'var(--gray1)', padding: '10px', borderRadius: '8px', display:'flex', alignItems:'center', gap:'8px' }}><Info size={16}/> ข้อมูลมหาวิทยาลัยและ Portfolio สามารถเพิ่มได้ในหน้าตั้งค่าหลังจากการสมัครเสร็จสิ้นครับ</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
                    <button className="btn-main btn-outline" style={{ flex: 1, marginTop: 0 }} onClick={() => handleRegisterNext(1)}>ย้อนกลับ</button>
                    <button className="btn-main" style={{ flex: 2, marginTop: 0, opacity: regRole ? 1 : 0.5 }} disabled={!regRole} onClick={() => handleRegisterNext(3)}>ยืนยันการสมัคร →</button>
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ marginBottom: '1rem', color:'var(--teal)', display:'flex', justifyContent:'center' }}><CheckCircle size={64} /></div>
                  <h2 style={{ color: 'var(--teal)', marginBottom: '0.5rem', fontFamily: "'Prompt', sans-serif" }}>ยินดีต้อนรับ!</h2>
                  <p style={{ color: 'var(--text2)', fontSize: '1rem', marginBottom: '2rem' }}>บัญชีของคุณพร้อมใช้งานแล้ว</p>
                  <button className="btn-main" onClick={() => setPage('home')}><Home size={18} /> เข้าสู่หน้าหลัก</button>
                </div>
              )}
              <div className="alt-link" style={{ marginTop: '2rem' }}>มีบัญชีอยู่แล้ว? <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: 700 }}>เข้าสู่ระบบ</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOGIN PAGE ===== */}
      {page === 'login' && (
        <div className="auth-page-container">
          <div className="auth-banner">
            <div className="auth-banner-content">
              <div style={{ marginBottom: '1rem', color:'white' }}><LogIn size={64} /></div>
              <h1>ยินดีต้อนรับ<br />กลับมาอีกครั้ง</h1>
              <p>เข้าสู่ระบบเพื่อค้นหาและอัปเดตข้อมูล Portfolio ของคุณ หรือแชร์ประสบการณ์ให้รุ่นน้อง</p>
            </div>
          </div>
          <div className="auth-content">
            <div className="auth-card">
              <div className="auth-logo"><h2>เข้าสู่ระบบ</h2><p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>กรุณากรอกข้อมูลบัญชีของคุณ</p></div>
              <div className="field"><label>อีเมล หรือ Username</label><input type="text" className="premium-input" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></div>
              <div className="field" style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>รหัสผ่าน</label>
                  <button style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>ลืมรหัสผ่าน?</button>
                </div>
                <input type="password" className="premium-input" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>
              <button className="btn-main" style={{ marginTop: '2rem' }} onClick={doLogin}><LogIn size={18} /> เข้าสู่ระบบ</button>
              <div className="alt-link" style={{ marginTop: '2rem' }}>
                ยังไม่มีบัญชีใช่ไหม?{' '}
                <button onClick={() => { setPage('register'); setRegStep(1); }} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: 700 }}>สมัครสมาชิกฟรี</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}