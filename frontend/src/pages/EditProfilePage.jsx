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
  title: "國立高雄大學校長"
};

function EditProfilePage() {
  const { userInfo, isLoadingUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 密碼欄位
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || !userInfo.username) {
      navigate("/login");
    }
  }, [userInfo, isLoadingUser, navigate]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/profile?ssn=${encodeURIComponent(userInfo.ssn)}`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error("載入失敗");
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => {
        setError("後端連線失敗，顯示預設資料");
        if (userInfo.role === "student") {
          setProfile({
            ...STATIC_PROFILE,
            identity: "student"
          });
        } else if (userInfo.role === "teacher") {
          setProfile({
            ...STATIC_PROFILE,
            identity: "teacher"
          });
        } else if (userInfo.role === "judge") {
          setProfile({
            ...STATIC_PROFILE,
            identity: "judge"
          });
        } else {
          setProfile(STATIC_PROFILE);
        }
        console.log(err);
      });
  }, [userInfo]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setIsLoading(true);

    // 驗證必填
    if (!currentPassword) {
      setError("請輸入當前密碼才能修改資料！");
      setIsLoading(false);
      return;
    }

    // 組合要送出的資料
    const body = {
      ...profile,
      current_password: currentPassword
    };
    if (newPassword) {
      body.new_password = newPassword;
    }

    try {
      const res = await fetch("http://localhost:5000/api/edit_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "個人資料或密碼更新失敗");
        setIsLoading(false);
        return;
      }
      setMsg(newPassword ? "資料與密碼已更新！" : "資料已更新！");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => navigate("/console"), 1200);
    } catch (err) {
      setError(`無法連接伺服器。${err}`);
    }
    setIsLoading(false);
  };

  if (error && !profile)
    return (
      <>
        <Navbar />
        <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex items-center justify-center text-yellow-200 text-xl">
          {error}
        </div>
      </>
    );

  if (!profile)
    return (
      <>
        <Navbar />
        <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex items-center justify-center text-white text-xl">
          載入中...
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex flex-col items-center justify-center inset-0 overflow-y-auto pb-4 relative">
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
            {userInfo.role === "student" && (
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
            {userInfo.role === "teacher" && (
              <InputColumn
                columnName="學歷"
                placeHolder="請輸入學歷"
                name="degree"
                value={profile.degree}
                onChange={handleChange}
              />
            )}
            {userInfo.role === "judge" && (
              <InputColumn
                columnName="頭銜"
                placeHolder="請輸入頭銜"
                name="title"
                value={profile.title}
                onChange={handleChange}
              />
            )}

            {/* 密碼欄位 */}
            <hr className="my-10 border-t-2 border-gray-200" />
            <h3 className="text-xl font-bold mb-4 text-black text-center">請輸入當前密碼（必填）</h3>
            <div>
              <label className="">當前密碼</label>
              <input
                type="password"
                name="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="請輸入當前密碼"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
                required
              />
            </div>
            <h3 className="text-xl font-bold mb-4 text-black text-center">修改密碼（可選填）</h3>
            <div>
              <label className="">新密碼</label>
              <input
                type="password"
                name="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="請輸入新密碼"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-8 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-600 hover:shadow-xl transition"
              disabled={isLoading}
            >
              {isLoading ? "送出中..." : "確認修改"}
            </button>
            {msg && (
              <div className="mt-4 text-center text-green-600 font-semibold">
                {msg}
              </div>
            )}
            {error && profile && (
              <div className="mt-4 text-center text-yellow-500 font-semibold">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

// 可重用的輸入欄位元件
function InputColumn({ columnName, placeHolder, name, value, onChange, loading }) {
  return (
    <div>
      <label className="">{columnName}</label>
      {loading ? (
        <Skeleton height={40} className="mb-4 mt-1" />
      ) : (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeHolder}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
          required
        />
      )}
    </div>
  );
}

export default EditProfilePage;
