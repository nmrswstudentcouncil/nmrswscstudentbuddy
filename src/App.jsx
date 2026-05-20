import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import LearnCourse from './pages/LearnCourse';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCourse from './pages/CreateCourse';
import CourseDetail from './pages/CourseDetail';
import TutorDashboard from './pages/TutorDashboard';
import Certificate from './pages/Certificate';
import './App.css'; // ลิงก์เข้ากับสไตล์เรดไวท์พรีเมียมตัวใหม่

function App() {
  return (
    <BrowserRouter>
      {/* แถบเมนูด้านบนสุด สไตล์ขาวใส Glassmorphism */}
      <Navbar />
      
      {/* ส่วนเนื้อหาหลัก ควบคุมพื้นหลังสว่างนุ่มนวลสไตล์ แดง-ขาว */}
      <div className="main-app-container">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          
          {/* Auth Pages (หน้าล็อกอิน/สมัครสมาชิกแบบมีแถบแบนเนอร์ไล่เฉดสีแดงหรูๆ) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Learning & Dashboards */}
          <Route path="/learn/:courseId" element={<LearnCourse />} />
          <Route path="/dashboard/student" element={<div className="empty-state"><div className="icon">🎓</div><h3>Student Dashboard</h3><p>ระบบกำลังอยู่ระหว่างการพัฒนาคู่หู!</p></div>} />
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          <Route path="/dashboard/tutor/create" element={<CreateCourse />} />
          
          {/* Certificates & Profiles */}
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/profile/:userId" element={<div className="empty-state"><div className="icon">👤</div><h3>หน้า Profile</h3><p>ระบบกำลังสร้างอยู่ อดใจรออีกนิดครับ</p></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;