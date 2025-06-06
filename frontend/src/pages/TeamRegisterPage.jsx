import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function TeamRegisterPage() {
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
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 表單變更處理
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 表單送出
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    // 基本必填欄位驗證
    if (!form.name || !form.student1_id || !form.student2_id) {
      setError("隊伍名稱、學生1和學生2的身分證字號為必填！");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/team/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(data.msg || "隊伍註冊成功！");
        setTimeout(() => navigate("/home"), 1500);
      } else {
        setError(data.msg || "註冊失敗，請檢查資料。");
      }
    } catch (err) {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
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
            className="w-full py-3 mt-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "送出中..." : "確認報名隊伍"}
          </button>
          {error && (
            <div className="mt-2 text-center text-red-500 font-semibold">
              {error}
            </div>
          )}
          {msg && (
            <div className="mt-2 text-center text-green-600 font-semibold">
              {msg}
            </div>
          )}
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
