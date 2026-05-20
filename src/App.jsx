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
// นำเข้า App.css เพื่อเรียกใช้งานสไตล์ธีมพรีเมียม
import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      {/* Navbar แสดงผลคงที่ด้านบนสุด */}
      <Navbar />
      
      {/* เปลี่ยนสไตล์จากเดิมที่เป็น Tailwind (min-height:screen, bg-gray-50) 
        มาใช้สไตล์หลักของตัวโปรเจ็กต์ เพื่อให้พื้นหลังเว็บไซต์สอดคล้องกันทุกหน้า 
      */}
      <div className="main-app-container">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Learning & Dashboards */}
          <Route path="/learn/:courseId" element={<LearnCourse />} />
          <Route path="/dashboard/student" element={<div className="empty-state">Student Dashboard (กำลังสร้าง)</div>} />
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          <Route path="/dashboard/tutor/create" element={<CreateCourse />} />
          
          {/* Certificates & Profiles */}
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/profile/:userId" element={<div className="empty-state">หน้า Profile (กำลังสร้าง)</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;