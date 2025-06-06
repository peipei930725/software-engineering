import { useState } from "react";

function SubmitPiecePage() {
  // 假設 tid 來自 localStorage 或 props
  const tid = localStorage.getItem("tid") || "T2025001";
  const [form, setForm] = useState({
    tid: tid,
    name: "",
    demo: "",
    poster: "",
    code: "",
    document: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    // 前端欄位檢查提醒
    if (
      !form.name ||
      !form.demo ||
      !form.poster ||
      !form.code ||
      !form.document
    ) {
      setError("請填寫所有欄位！");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/piece/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.msg || "作品已成功繳交！");
        setTimeout(() => window.history.back(), 1200);
      } else {
        setError(data.msg || "繳交失敗，請檢查資料。");
      }
    } catch (err) {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
  };

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

      <div className="bg-white text-black rounded-3xl shadow-2xl border border-white/30 p-10 md:p-12 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-8 text-black text-center">
          作品繳交
        </h2>

        {/* 提醒區塊 */}
        <div className="mb-8 p-4 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 shadow">
          <ul className="list-disc list-inside text-base font-semibold">
            <li>請確認所有連結皆可正常開啟。</li>
            <li>Demo、海報、程式碼、文件皆需填寫正確網址。</li>
          </ul>
        </div>

        <form className="text-black" onSubmit={handleSubmit}>
          <InputColumn
            columnName="作品名稱"
            placeHolder="請輸入作品名稱"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <InputColumn
            columnName="Demo 連結"
            placeHolder="請輸入 demo 網址"
            name="demo"
            value={form.demo}
            onChange={handleChange}
          />
          <InputColumn
            columnName="海報連結"
            placeHolder="請輸入海報網址（可用雲端連結）"
            name="poster"
            value={form.poster}
            onChange={handleChange}
          />
          <InputColumn
            columnName="程式碼連結"
            placeHolder="請輸入程式碼網址（如 GitHub）"
            name="code"
            value={form.code}
            onChange={handleChange}
          />
          <InputColumn
            columnName="文件連結"
            placeHolder="請輸入說明文件網址"
            name="document"
            value={form.document}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full mt-8 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-600 hover:shadow-xl transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "送出中..." : "確認繳交"}
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

export default SubmitPiecePage;
