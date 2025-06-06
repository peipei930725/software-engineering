import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useUser } from "../contexts/UserContext.jsx";

function AnnouncementPage() {
  const { userInfo } = useUser();
  const [form, setForm] = useState({
    title: "",
    content: "",
    datetime: "",
  });
  const [announcements, setAnnouncements] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 預設自動填入現在時間
  useEffect(() => {
    if (!form.datetime) {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setForm((f) => ({ ...f, datetime: local }));
    }
  }, []);

  // 取得所有公告
  useEffect(() => {
    fetch("http://localhost:5000/api/announcement", { credentials: "include" })
      .then((res) => res.json())
      .then(setAnnouncements)
      .catch(() => setError("無法取得公告"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 立即填入現在時間
  const handleNow = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm((f) => ({ ...f, datetime: local }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!form.title || !form.content || !form.datetime) {
      setError("所有欄位皆為必填！");
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
          title: form.title,
          content: form.content,
          datetime: form.datetime,
          admin_ssn: userInfo.username,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(data.message);
        setForm({ title: "", content: "", datetime: "" });
        fetch("http://localhost:5000/api/announcement", { credentials: "include" })
          .then((res) => res.json())
          .then(setAnnouncements);
        // 新增後自動填入現在時間
        handleNow();
      } else {
        setError(data.message || "公告新增失敗");
      }
    } catch {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#f4f4f9] min-h-screen w-screen m-0">
        {/* 新增公告表單，下移且內容全黑 */}
        <div className="max-w-2xl mx-auto mt-24 mb-8 p-8 bg-white rounded-3xl shadow-2xl border border-gray-200 text-black">
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
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="公告標題"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition text-black"
            />
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              placeholder="公告內容"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition text-black"
            />
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700 text-black mb-0">
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
                className="ml-2 px-3 py-2 bg-white text-white rounded-lg border border-white hover:bg-blue-50 transition"
                title="立即填入現在時間"
            >
              現在
            </button>
            </div>
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
              announcements.map((a) => (
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
                  <div className="text-base text-gray-800 whitespace-pre-line">
                    {a.content}
                  </div>
                </li>
              ))
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
