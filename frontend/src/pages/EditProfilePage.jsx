import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

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
  const { userInfo } = useUser();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
		if (!userInfo.isLoggedIn) {
			// 有登入 而且 是管理員  => 沒登入 或 不是管理員
			navigate("/login");
		}
  }, [userInfo, navigate]);

  useEffect(() => {
    if (!userInfo.isLoggedIn || !userInfo.username) {
      setError("未登入或找不到用戶資訊");
      return;
    }
    fetch(`/api/profile?ssn=${encodeURIComponent(userInfo.username)}`, {
      credentials: 'include' // ← 這裡加上
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
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // ← 這裡加上
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
      setError(`無法連接伺服器。${err}`);
    }
  };

  if (error && !profile)
    return (
      <div className="bg-[#023047] min-h-screen flex items-center justify-center text-yellow-200 text-xl">
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
      {/* 右上角返回上一頁按鈕 */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-8 right-8 z-50 group"
        style={{ textDecoration: "none" }}
      >
        <div className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-transform duration-300 cursor-pointer">
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
            返回上一頁
          </span>
        </div>
      </button>

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
          {error && profile && (
            <div className="mt-4 text-center text-yellow-500 font-semibold">
              {error}
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
