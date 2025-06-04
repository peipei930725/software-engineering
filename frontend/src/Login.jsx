import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    idNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 身分證字號驗證
  const validateIdNumber = (id) => {
    const regex = /^[A-Z][12]\d{8}$/;
    if (!regex.test(id)) return false;
    
    // 台灣身分證字號檢查碼驗證
    const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
    const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
    let sum = letters.indexOf(id[0]) + 10;
    
    for (let i = 1; i < 10; i++) {
      sum += parseInt(id[i]) * weights[i];
    }
    
    return (sum + parseInt(id[10])) % 10 === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase() // 身分證字號自動轉大寫
    }));
    
    // 清除對應的錯誤訊息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 驗證身分證字號
    if (!formData.idNumber) {
      newErrors.idNumber = '請輸入身分證字號';
    } else if (!validateIdNumber(formData.idNumber)) {
      newErrors.idNumber = '身分證字號格式不正確';
    }

    // 驗證密碼
    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要6個字元';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // 這裡可以串接你的後端 API
        console.log('登入資料:', formData);
        
        // 模擬 API 請求
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert('登入成功！');
        // 登入成功後的處理，例如跳轉頁面
        // window.location.href = '/';
        
      } catch (error) {
        alert('登入失敗，請檢查帳號密碼');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>帳號登入</h1>
          <p>請輸入您的身分證字號和密碼</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="idNumber">身分證字號</label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="請輸入身分證字號 (例：A123456789)"
              maxLength="10"
              className={errors.idNumber ? 'error' : ''}
            />
            {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入密碼"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/">返回首頁</Link>
          <span>|</span>
          <Link to="/register">註冊新帳號</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
