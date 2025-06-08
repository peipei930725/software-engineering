import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import Navbar from "../components/Navbar.jsx";

const STATIC_PROFILE = {
  name: "王小明",
  email: "test@example.com",
  phonenumber: "0912345678",
  address: "高雄市楠梓區高雄大學路700號",
  department: "資訊工程學系",
  grade: "3",
  sid: "A1115500",
  degree: "國立高雄大學電機工程學系博士",
  title: "國立高雄大學校長",
  identity: "guest",
};

export default function EditProfilePage() {
  const { userInfo, isLoadingUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || !userInfo.ssn) {
      navigate("/login");
    }
  }, [userInfo, isLoadingUser, navigate]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/profile?ssn=${encodeURIComponent(userInfo.ssn)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("載入失敗");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setForm(data);
      })
      .catch(() => {
        setError("後端連線失敗，顯示預設資料");
        setProfile(STATIC_PROFILE);
        setForm(STATIC_PROFILE);
      });
  }, [userInfo.ssn]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setIsLoading(true);

    if (!currentPassword) {
      setError("請輸入當前密碼才能修改資料！");
      setIsLoading(false);
      return;
    }

    const body = {
      ...form,
      ssn: userInfo.ssn,
      current_password: currentPassword,
    };
    if (newPassword) body.new_password = newPassword;

    try {
      const res = await fetch("http://localhost:5000/api/edit_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "更新失敗");
      } else {
        setMsg(data.message || "更新成功");
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => navigate("/home"), 1200);
      }
    } catch {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
  };

  if (error && !profile) {
    return (
      <>
        <Navbar />
        <div className="bg-[#023047] text-white min-h-screen flex items-center justify-center">
          {error}
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="bg-[#023047] text-white min-h-screen flex items-center justify-center">
          載入中...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* 這裡加上 flex items-center justify-center 讓內容完全置中 */}
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex items-center justify-center">
        <div className="bg-white text-black rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">修改個人資料</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputColumn
              label="姓名"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <InputColumn
              label="E-mail"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <InputColumn
              label="手機號碼"
              name="phonenumber"
              value={form.phonenumber}
              onChange={handleChange}
            />
            <InputColumn
              label="聯絡地址"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            {form.identity === "student" && (
              <>
                <InputColumn
                  label="系所"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
                <div>
                  <label className="block mb-1">年級</label>
                  <select
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="" disabled>
                      請選擇年級
                    </option>
                    {[1, 2, 3, 4].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <InputColumn
                  label="學號"
                  name="sid"
                  value={form.sid}
                  onChange={handleChange}
                />
              </>
            )}

            {form.identity === "teacher" && (
              <InputColumn
                label="學歷"
                name="degree"
                value={form.degree}
                onChange={handleChange}
              />
            )}

            {form.identity === "judge" && (
              <InputColumn
                label="頭銜"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            )}

            <hr className="my-6 border-gray-200" />

            <div>
              <label className="block mb-1">當前密碼（必填）</label>
              <input
                type="password"
                name="current_password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">新密碼（選填）</label>
              <input
                type="password"
                name="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            {msg && (
              <div className="text-green-600 text-center font-semibold">
                {msg}
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? "送出中..." : "確認修改"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function InputColumn({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
    </div>
  );
}
