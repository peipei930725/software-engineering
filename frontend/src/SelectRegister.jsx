import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectRegister.css';

function SelectRegister() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // 根據選擇的身分跳轉到對應的註冊頁面
    switch(role) {
      case 'student':
        navigate('/register/student');
        break;
      case 'teacher':
        navigate('/register/teacher');
        break;
      case 'judge':
        navigate('/register/judge');
        break;
      default:
        break;
    }
  };

  return (
    <div className="select-register-page">
      <div className="register-container">
        <h1>選擇您的身分類別</h1>
        <div className="register-options">
          {/* 第一行：2個選項（上方） */}
          <div className="row-1">
            <div onClick={() => handleRoleSelect('student')}>
              <img src="/student.png" alt="Student" />
              <p>學生</p>
            </div>
            <div onClick={() => handleRoleSelect('teacher')}>
              <img src="/teacher.jpg" alt="Teacher" />
              <p>指導老師</p>
            </div>
          </div>
          
          {/* 第二行：1個選項（下方中央） */}
          <div className="row-2">
            <div onClick={() => handleRoleSelect('judge')}>
              <img src="/judge.png" alt="Judge" />
              <p>評審</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectRegister;
