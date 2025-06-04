import { Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import SelectRegister from './SelectRegister.jsx';
import './App.css';

// 模擬公告資料
const announcements = [
  {
    title: "競賽報名開始！",
    datetime: "2025-06-01",
    content: "高雄大學學生創意競賽即日起開放報名，歡迎踴躍參加！"
  },
  {
    title: "初賽說明會",
    datetime: "2025-06-05",
    content: "本週五下午舉辦初賽說明會，請有興趣的同學準時參加。"
  },
  {
    title: "決賽地點公告",
    datetime: "2025-06-10",
    content: "決賽將於創新大樓 1F 舉行，請各隊提前報到。"
  },
  {
    title: "活動照片上傳",
    datetime: "2025-06-15",
    content: "活動照片已上傳至官網，歡迎下載留念。"
  }
];

// 首頁元件
function HomePage() {
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
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<SelectRegister />} />
      {/* 其他路由... */}
    </Routes>
  );
}
