import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 假設 ssn 來自登入狀態或 localStorage
  const ssn = localStorage.getItem("ssn");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("新密碼與確認密碼不一致！");
      return;
    }

    if (!window.confirm("確定修改密碼嗎？")) {
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ssn,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.msg || "密碼已更新！");
        setTimeout(() => navigate("/console"), 1200);
      } else {
        setError(data.msg || "密碼更新失敗");
      }
    } catch (err) {
      setError("無法連接伺服器");
    }
  };

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

      <div className="bg-white text-black rounded-3xl shadow-2xl border border-white/30 p-10 md:p-12 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-8 text-black text-center">
          修改密碼
        </h2>
        <form className="text-black" onSubmit={handleSubmit}>
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
          <div>
            <label className="">新密碼</label>
            <input
              type="password"
              name="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="請輸入新密碼"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
              required
            />
          </div>
          <div>
            <label className="">確認新密碼</label>
            <input
              type="password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="請再次輸入新密碼"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-8 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-600 hover:shadow-xl transition"
          >
            確認修改
          </button>
          {error && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              {error}
            </div>
          )}
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

export default ChangePasswordPage;
