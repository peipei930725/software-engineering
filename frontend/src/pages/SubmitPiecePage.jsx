import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

function SubmitPiecePage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tid: "",
    name: "",
    demo: "",
    poster: "",
    code: "",
    document: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "student") {
      navigate("/login");
    }
  }, [userInfo, isLoadingUser,navigate]);

  useEffect(() => {
    const tid = userInfo?.idNumber || localStorage.getItem("tid") || "T2025001";
    setForm((prev) => ({ ...prev, tid }));
  }, [userInfo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    const fields = ["name", "demo", "poster", "code", "document"];
    const isEmpty = fields.some((key) => !form[key]);
    if (isEmpty) {
      setError("請填寫所有欄位！");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/piece/submit?ssn=${encodeURIComponent(userInfo.ssn)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message|| "作品已成功繳交！");
        setTimeout(() => window.history.back(), 1200);
      } else {
        setError(data.message || "繳交失敗，請檢查資料。");
      }
    } catch (err) {
      setError(`無法連接伺服器。${err}`);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex flex-col items-center justify-center inset-0 overflow-y-auto pb-4 relative">
        <div className="bg-white text-black rounded-3xl shadow-2xl border border-white/30 p-10 md:p-12 max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-8 text-black text-center">作品繳交</h2>
          <ReminderBlock />
          <form className="text-black" onSubmit={handleSubmit}>
            <InputColumn columnName="作品名稱" placeHolder="請輸入作品名稱" name="name" value={form.name} onChange={handleChange} />
            <InputColumn columnName="Demo 連結" placeHolder="請輸入 demo 網址" name="demo" value={form.demo} onChange={handleChange} />
            <InputColumn columnName="海報連結" placeHolder="請輸入海報網址（可用雲端連結）" name="poster" value={form.poster} onChange={handleChange} />
            <InputColumn columnName="程式碼連結" placeHolder="請輸入程式碼網址（如 GitHub）" name="code" value={form.code} onChange={handleChange} />
            <InputColumn columnName="文件連結" placeHolder="請輸入說明文件網址" name="document" value={form.document} onChange={handleChange} />

            <button
              type="submit"
              className="w-full mt-8 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-600 hover:shadow-xl transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "送出中..." : "確認繳交"}
            </button>

            {error && <div className="mt-4 text-center text-red-500 font-semibold">{error}</div>}
            {msg && <div className="mt-4 text-center text-green-600 font-semibold">{msg}</div>}
          </form>
        </div>
      </div>
    </>
  );
}

function ReminderBlock() {
  return (
    <div className="mb-8 p-4 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 shadow">
      <ul className="list-disc list-inside text-base font-semibold">
        <li>請確認所有連結皆可正常開啟。</li>
        <li>Demo、海報、程式碼、文件皆需填寫正確網址。</li>
      </ul>
    </div>
  );
}

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
