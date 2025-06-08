// src/TestBack.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TestBack() {
    const [inputText, setInputText] = useState('')       // 新增：輸入框內容
    const [responseText, setResponseText] = useState('')
    const navigate = useNavigate()

    const handleGet = async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/hello')
        if (!res.ok) throw new Error(`狀態碼 ${res.status}`)
        const data = await res.json()
        setResponseText(JSON.stringify(data, null, 2))
    } catch (err) {
        setResponseText(`GET 發生錯誤：${err.message}`)
    }
  }

const handlePost = async () => {
    try {
      // 將輸入框內容包成 JSON 傳給後端
    const res = await fetch('http://127.0.0.1:5000/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
        })
        if (!res.ok) throw new Error(`狀態碼 ${res.status}`)
        const data = await res.json()
        setResponseText(JSON.stringify(data, null, 2))
    } catch (err) {
        setResponseText(`POST 發生錯誤：${err.message}`)
    }
}

return (
    <div
    style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '1rem',
        boxSizing: 'border-box',
        textAlign: 'center'
    }}
    >
    <h2>TestBack API 測試頁面</h2>

    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={handleGet}>發送 GET 請求</button>
        <button onClick={handlePost}>發送 POST 請求</button>
    </div>

      {/* 原本的輸出框改為輸入框 */}
    <textarea
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        placeholder="請在此輸入要傳送的文字"
        style={{
        width: '80%',
        maxWidth: '600px',
        minHeight: '8rem',
        padding: '1rem',
        boxSizing: 'border-box',
        marginBottom: '1rem',
        resize: 'vertical'
        }}
    />

      {/* 新增的輸出框 */}
    <pre
        style={{
        width: '80%',
        maxWidth: '600px',
        background: '#f5f5f5',
        padding: '1rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        color: '#000'
        }}
    >
        {responseText}
    </pre>

    <button
        onClick={() => navigate(-1)}
        style={{ marginTop: '1rem' }}
    >
        返回主頁
    </button>
    </div>
    )
}
