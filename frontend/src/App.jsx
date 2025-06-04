// src/App.jsx
import { Routes, Route, useNavigate } from 'react-router-dom'
import TestBack from './TestBack.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Register from './pages/Register.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function Home() {
  const navigate = useNavigate()
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',   // 水平置中
        alignItems: 'center',       // 垂直置中
        width: '100%',              // 滿版寬度
        height: '100vh',            // 滿版高度
        boxSizing: 'border-box'
      }}
    >
      <button onClick={() => navigate('/testback')}>
        前往 API 測試頁面
      </button>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/testback" element={<TestBack />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<Register/>}/>

      {/* 其他路由(不存在的路由:顯示404 not found) */}
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  )
}
