import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function EditProfilePage() {
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 假設 ssn 來自登入狀態或 localStorage
  const ssn = localStorage.getItem("ssn");

  useEffect(() => {
    if (!ssn) {
      setError("未登入或找不到身分資訊");
      return;
    }
    fetch(`http://localhost:5000/api/profile?ssn=${ssn}`)
      .then(res => {
        if (!res.ok) throw new Error("載入失敗");
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => setError(err.message));
  }, [ssn]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.msg || "資料已更新！");
        setTimeout(() => navigate("/console"), 1000);
      } else {
        setError(data.msg || "更新失敗");
      }
    } catch (err) {
      setError("無法連接伺服器");
    }
  };

  if (error)
    return (
      <div className="bg-[#023047] min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="bg-[#023047] min-h-screen flex items-center justify-center text-white text-xl">
        載入中...
      </div>
    );

  return (
    <div className="bg-[#023047] min-h-screen w-screen m-0 flex flex-col items-center justify-center inset-0 overflow-y-auto pb-4 pt-10 relative">
      {/* 右上角創意返回按鈕 */}
      <Link
        to="/console"
        className="fixed top-8 right-8 z-50 group"
        style={{ textDecoration: "none" }}
      >
        <div className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-transform duration-300 cursor-pointer">
          {/* 原生 SVG icon */}
          <svg
            className="w-6 h-6 text-white mr-2 group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-bold text-white text-base group-hover:text-yellow-200 transition-colors">
            返回個人資料
          </span>
        </div>
      </Link>

      <div className="bg-white text-black rounded-3xl shadow-2xl border border-white/30 p-10 md:p-12 max-w-4xl w-full">
        <h2 className="text-2xl font-bold mb-8 text-black text-center">
          修改個人資料
        </h2>
        <form className="text-black" onSubmit={handleSubmit}>
          <InputColumn
            columnName="姓名"
            placeHolder="請輸入姓名"
            name="name"
            value={profile.name}
            onChange={handleChange}
          />
          <InputColumn
            columnName="E-mail（電子郵件）"
            placeHolder="請輸入E-mail"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />
          <InputColumn
            columnName="手機號碼"
            placeHolder="請輸入手機號碼"
            name="phonenumber"
            value={profile.phonenumber}
            onChange={handleChange}
          />
          <InputColumn
            columnName="聯絡地址"
            placeHolder="請輸入聯絡地址"
            name="address"
            value={profile.address}
            onChange={handleChange}
          />
          {/* 身分專屬欄位 */}
          {profile.identity === "student" && (
            <>
              <InputColumn
                columnName="系所"
                placeHolder="請輸入系所"
                name="department"
                value={profile.department}
                onChange={handleChange}
              />
              <div>
                <label className="">年級</label>
                <select
                  name="grade"
                  value={profile.grade || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
                  required
                >
                  <option value="" disabled>
                    請選擇年級
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <InputColumn
                columnName="學號"
                placeHolder="請輸入學號"
                name="sid"
                value={profile.sid}
                onChange={handleChange}
              />
            </>
          )}
          {profile.identity === "teacher" && (
            <InputColumn
              columnName="學歷"
              placeHolder="請輸入學歷"
              name="degree"
              value={profile.degree}
              onChange={handleChange}
            />
          )}
          {profile.identity === "judge" && (
            <InputColumn
              columnName="頭銜"
              placeHolder="請輸入頭銜"
              name="title"
              value={profile.title}
              onChange={handleChange}
            />
          )}
          <button
            type="submit"
            className="w-full mt-8 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-600 hover:shadow-xl transition"
          >
            確認修改
          </button>
          {msg && (
            <div className="mt-4 text-center text-green-600 font-semibold">
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// 可重用的輸入欄位元件
function InputColumn({ columnName, placeHolder, name, value, onChange }) {
  return (
    <div>
      <label className="">{columnName}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeHolder}
        className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
        required
      />
    </div>
  );
}

export default EditProfilePage;
