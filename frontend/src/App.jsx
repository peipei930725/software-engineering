// src/App.jsx
import { Routes, Route, useNavigate } from 'react-router-dom'
import TestBack from './TestBack.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { Navigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate()
  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className="site-name">高雄大學學生創意競賽</div>
        <div className="auth-links">
          <a href="/login">登入</a>
          <a href="/register">註冊</a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="main-image">
          <img src="/main.jpg" alt="Main Visual" />
        </div>
        <div className="announcements">
          <div
            className="announcement-header"
            onClick={() => window.location.href = "/announcements"}
            style={{ userSelect: "none" }}
          >
            最新公告 &gt; 更多
          </div>
          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.slice(0, 4).map((item, idx) => (
                <div className="announcement-item" key={idx}>
                  <div className="announcement-title">{item.title}</div>
                  <div className="announcement-date">{item.datetime}</div>
                  <div className="announcement-description">{item.content}</div>
                </div>
              ))
            ) : (
              <div className="announcement-item">目前沒有公告。</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>&copy; 2025 高雄大學學生創意競賽</p>
        <div>
          <a href="/">首頁</a>
          <a href="/about">關於我們</a>
          <a href="/contact">聯繫方式</a>
        </div>
      </div>
    </>
  );
}

// App 主元件
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/testback" element={<TestBack />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>

      {/* 其他路由(不存在的路由:顯示404 not found) */}
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  );
}
