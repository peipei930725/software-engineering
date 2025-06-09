import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";

function GradePage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const [pieces, setPieces] = useState([]);
  const [selectedPid, setSelectedPid] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 取得今年所有可評分作品
  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "judge") {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:5000/api/judge/pieces?ssn=${encodeURIComponent(userInfo.ssn)}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("無法取得作品資料");
        return res.json();
      })
      .then((data) => {
        console.log("取得作品資料：", data);  
        setPieces(data.pieces || []);
      })
      .catch(() => setStatus("無法取得作品資料，請稍後再試"));
  }, [userInfo, isLoadingUser, navigate]);

  // 送出評分
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPid) {
      setStatus("請先選擇作品");
      return;
    }
    if (score === "" || isNaN(score) || score < 0 || score > 100) {
      setStatus("請輸入 0~100 的有效分數");
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5000/api/judge/score?ssn=${encodeURIComponent(userInfo.ssn)}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pid: selectedPiece.pid,
        score: Number(score),
        comment,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("送出失敗");
        return res.json();
      })
      .then(() => {
        setStatus("評分與回饋已送出！");
        setScore("");
        setComment("");
      })
      .catch(() => setStatus("送出失敗，請稍後再試"))
      .finally(() => setLoading(false));
  };

  // 取得選中作品的詳細資訊
  const selectedPiece = pieces.find((p) => String(p.pid) === String(selectedPid));

  // 取得今年度
  const currentYear = 2025; // 你可以直接寫死，也可以用 new Date().getFullYear()

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white text-black rounded-2xl shadow-2xl border border-[#8ecae6]">
          <h2 className="text-2xl font-bold mb-8 text-center text-[#8ecae6] tracking-wider">
            評審評分與回饋
          </h2>
          {status && (
            <div className="mb-6 text-center text-red-600 font-semibold">
              {status}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="font-bold text-[#219ebc] block mb-2">
                選擇作品
              </label>
              <select
                className="w-full p-2 border rounded mb-2"
                value={selectedPid}
                onChange={(e) => setSelectedPid(e.target.value)}
                required
              >
                <option value="">請選擇作品</option>
                {pieces
                  .filter((piece) => piece.year === currentYear)
                  .map((piece) => (
                    <option key={piece.pid} value={piece.pid}>
                      {piece.name}
                    </option>
                  ))}
              </select>
            </div>

            {selectedPiece && (
              <div className="mb-6 bg-[#e7f5ff] p-4 rounded">
                <div>
                  <span className="font-bold text-[#219ebc]">作品名稱：</span>
                  {selectedPiece.name}
                </div>
                <div>
                  <span className="font-bold text-[#219ebc]">Demo：</span>
                  {selectedPiece.demo ? (
                    <a
                      href={selectedPiece.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      觀看 Demo
                    </a>
                  ) : (
                    "尚未提供"
                  )}
                </div>
                <div>
                  <span className="font-bold text-[#219ebc]">Document：</span>
                  {selectedPiece.document ? (
                    <a
                      href={selectedPiece.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      查看 Document
                    </a>
                  ) : (
                    "尚未提供"
                  )}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="font-bold text-[#219ebc] block mb-2">
                分數（0-100）
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-8">
              <label className="font-bold text-[#219ebc] block mb-2">
                回饋留言
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="請輸入您的回饋"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#219ebc] text-white rounded-lg font-bold hover:bg-[#126782] transition"
              disabled={loading}
            >
              {loading ? "送出中..." : "送出評分"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default GradePage;
