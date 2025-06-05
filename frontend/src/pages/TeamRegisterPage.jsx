import React, { useState } from "react";
import { Link } from "react-router-dom";

function TeamRegisterPage() {
  // 預設表單狀態
  const [form, setForm] = useState({
    name: "",
    student1_id: "",
    student2_id: "",
    student3_id: "",
    student4_id: "",
    student5_id: "",
    student6_id: "",
    professor_id: "",
  });

  // 表單變更處理
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 表單送出（可根據需求改為 fetch 或 axios 傳送到後端）
  const handleSubmit = (e) => {
    e.preventDefault();
    // 這裡可以加上表單驗證與送出邏輯
    alert("表單已送出（請自行串接後端）");
  };

  return (
    <div className="bg-[#023047] min-h-screen w-screen m-0 flex flex-col items-center justify-center pt-10 pb-8">
      <div className="bg-white text-black rounded-3xl p-10 md:p-12 w-full max-w-lg shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          隊伍報名
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 重要提醒 */}
          <div>
            <div className="text-lg font-semibold text-red-600 mb-2">
              重要：自己的身分證字號也需填入！
            </div>
            <div className="text-base text-gray-700 mb-2">
              有標註 <span className="text-red-600">*</span> 的欄位為必填！
            </div>
          </div>
          <InputColumn
            label="隊伍名稱"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <InputColumn
            label="學生1的身分證字號"
            name="student1_id"
            value={form.student1_id}
            onChange={handleChange}
            required
          />
          <InputColumn
            label="學生2的身分證字號"
            name="student2_id"
            value={form.student2_id}
            onChange={handleChange}
            required
          />
          <InputColumn
            label="學生3的身分證字號"
            name="student3_id"
            value={form.student3_id}
            onChange={handleChange}
          />
          <InputColumn
            label="學生4的身分證字號"
            name="student4_id"
            value={form.student4_id}
            onChange={handleChange}
          />
          <InputColumn
            label="學生5的身分證字號"
            name="student5_id"
            value={form.student5_id}
            onChange={handleChange}
          />
          <InputColumn
            label="學生6的身分證字號"
            name="student6_id"
            value={form.student6_id}
            onChange={handleChange}
          />
          <InputColumn
            label="指導老師的身分證字號"
            name="professor_id"
            value={form.professor_id}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            確認報名隊伍
          </button>
        </form>
        <div className="text-center mt-6">
          <Link
            to="/home"
            className="text-blue-500 font-bold hover:underline"
          >
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}

// 單一輸入欄位元件
function InputColumn({ label, name, value, onChange, required }) {
  return (
    <div>
      <label className="block font-semibold mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`輸入${label}`}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded mb-1 mt-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

export default TeamRegisterPage;
