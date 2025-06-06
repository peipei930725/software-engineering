import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useUser } from "../contexts/UserContext.jsx";

function AnnouncementPage() {
  const { userInfo } = useUser();
  const [form, setForm] = useState({
    aid: "",
    title: "",
    context: "",
    datetime: "",
  });
  const [announcements, setAnnouncements] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
		if (!userInfo.isLoggedIn || userInfo.role !== "admin") {
			// 有登入 而且 是管理員  => 沒登入 或 不是管理員
			navigate("/login");
		}
  }, [userInfo, navigate]);

  // 預設自動填入現在時間
  // 編輯模式狀態
  const [editAid, setEditAid] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    context: "",
    datetime: "",
  });

  // 取得所有公告
  useEffect(() => {
    fetch("http://localhost:5000/api/announcement", { credentials: "include" })
      .then((res) => res.json())
      .then(setAnnouncements)
      .catch(() => setError("無法取得公告"));
  }, []);

  // 新增公告表單自動填入現在時間
  useEffect(() => {
    if (!form.datetime) {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setForm((f) => ({ ...f, datetime: local }));
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 編輯表單變更
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // 立即填入現在時間
  const handleNow = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm((f) => ({ ...f, datetime: local }));
  };

  // 新增公告
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!form.aid || !form.title || !form.context || !form.datetime) {
      setError("公告編號、標題、內容、發布時間皆為必填！");
      return;
    }
    if (!userInfo.isLoggedIn || !userInfo.username) {
      setError("請先登入管理員帳號");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          aid: form.aid,
          title: form.title,
          context: form.context,
          datetime: form.datetime,
          admin_ssn: userInfo.username,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(data.message);
        setForm({
          aid: "",
          title: "",
          context: "",
          datetime: "",
        });
        fetch("http://localhost:5000/api/announcement", { credentials: "include" })
          .then((res) => res.json())
          .then(setAnnouncements);
        handleNow();
      } else {
        setError(data.message || "公告新增失敗");
      }
    } catch {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
  };

  // 點擊編輯
  const handleEdit = (a) => {
    setEditAid(a.aid);
    setEditForm({
      title: a.title,
      context: a.context,
      datetime: a.datetime.slice(0, 16), // yyyy-MM-ddTHH:mm
    });
    setMsg("");
    setError("");
  };

  // 送出編輯
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!editForm.title || !editForm.context || !editForm.datetime) {
      setError("所有欄位皆為必填！");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/announcement/${editAid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(data.message);
        setEditAid(null);
        fetch("http://localhost:5000/api/announcement", { credentials: "include" })
          .then((res) => res.json())
          .then(setAnnouncements);
      } else {
        setError(data.message || "公告修改失敗");
      }
    } catch {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] min-h-screen w-screen m-0 pt-32">
        {/* 新增公告表單，下移且內容全黑 */}
        <div className="max-w-2xl mx-auto mb-8 p-8 bg-white rounded-3xl shadow-2xl border border-gray-200 text-black">
          <div className="text-2xl font-bold mb-6 text-center text-[#007BFF] tracking-wider">
            新增公告
          </div>
          {msg && (
            <div className="text-green-600 mb-4 text-center font-semibold">
              {msg}
            </div>
          )}
          {error && (
            <div className="text-red-500 mb-4 text-center font-semibold">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-black">
            <input
              type="number"
              name="aid"
              value={form.aid}
              onChange={handleChange}
              placeholder="公告編號"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition text-black"
            />
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="公告標題"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition text-black"
            />
            <textarea
              name="context"
              value={form.context}
              onChange={handleChange}
              rows={5}
              placeholder="公告內容"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition text-black"
            />
            <div className="flex items-center gap-2">
              <label className="font-semibold text-black mb-0">
                選擇發布時間：
              </label>
              <input
                type="datetime-local"
                name="datetime"
                value={form.datetime}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition text-black"
              />
              <button
                type="button"
                onClick={handleNow}
                className="ml-2 px-3 py-2 bg-white text-blue-700 rounded-lg border border-blue-300 hover:bg-blue-50 transition"
                title="立即填入現在時間"
              >
                現在
              </button>
            </div>
            <input
              type="text"
              value={userInfo.username || ""}
              disabled
              placeholder="公告發布者（自動帶入）"
              className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50 shadow-lg"
            >
              {isLoading ? "新增中..." : "新增公告"}
            </button>
          </form>
        </div>
        {/* 公告列表 */}
        <div className="max-w-4xl mx-auto mb-10 p-8 bg-white rounded-3xl shadow-2xl border border-gray-200">
          <div className="text-2xl font-bold mb-6 text-center text-[#007BFF] tracking-wider">
            所有公告
          </div>
          <ul className="space-y-6">
            {announcements.length > 0 ? (
              announcements.map((a) =>
                editAid === a.aid ? (
                  // 編輯表單
                  <li key={a.aid} className="p-6 rounded-xl border border-blue-200 bg-blue-50 shadow-lg">
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                      <div className="font-bold text-blue-700">編輯公告 #{a.aid}</div>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <textarea
                        name="context"
                        value={editForm.context}
                        onChange={handleEditChange}
                        required
                        rows={3}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="datetime-local"
                        name="datetime"
                        value={editForm.datetime}
                        onChange={handleEditChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <div className="flex gap-3 mt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                          disabled={isLoading}
                        >
                          儲存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAid(null)}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-semibold"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </li>
                ) : (
                  // 一般公告顯示
                  <li
                    className="p-6 rounded-xl border border-gray-200 bg-[#f9f9f9] shadow hover:shadow-lg transition"
                    key={a.aid}
                  >
                    <div className="text-lg font-bold text-blue-700 mb-2 flex items-center">
                      <span className="mr-2 text-gray-400">ID：{a.aid}</span>
                      <span>{a.title}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      發布日期：{a.datetime}
                    </div>
                    <div className="text-base text-gray-800 whitespace-pre-line mb-2">
                      {a.context}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      發布者：{a.admin_ssn}
                    </div>
                    {userInfo.role === "admin" && (
                      <button
                        onClick={() => handleEdit(a)}
                        className="mt-2 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm font-bold"
                      >
                        編輯
                      </button>
                    )}
                  </li>
                )
              )
            ) : (
              <li className="text-gray-500 text-center">目前沒有公告。</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default AnnouncementPage;
