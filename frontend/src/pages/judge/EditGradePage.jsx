import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";

function EditGradePage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const [submittedScores, setSubmittedScores] = useState([]);
  const [editingScore, setEditingScore] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editComment, setEditComment] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 取得已送出評分
  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "judge") {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:5000/api/judge/submitted-scores?ssn=${encodeURIComponent(userInfo.ssn)}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("無法取得評分資料");
        return res.json();
      })
      .then(setSubmittedScores)
      .catch(() => setStatus("無法取得評分資料，請稍後再試"));
  }, [userInfo, isLoadingUser, navigate]);

  // 點選編輯
  const handleEdit = (scoreObj) => {
    setEditingScore(scoreObj);
    setEditScore(scoreObj.score);
    setEditComment(scoreObj.comment);
    setStatus("");
  };

  // 送出編輯
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editScore === "" || isNaN(editScore) || editScore < 0 || editScore > 100) {
      setStatus("請輸入 0~100 的有效分數");
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5000/api/judge/score/${editingScore.id}?ssn=${encodeURIComponent(userInfo.ssn)}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: Number(editScore),
        comment: editComment,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("更新失敗");
        return res.json();
      })
      .then(() => {
        setStatus("已更新！");
        setEditingScore(null);
        // 重新載入已送出評分
        return fetch(`http://localhost:5000/api/judge/submitted-scores?ssn=${encodeURIComponent(userInfo.ssn)}`, { credentials: "include" })
          .then(res => res.json())
          .then(setSubmittedScores);
      })
      .catch(() => setStatus("更新失敗，請稍後再試"))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white text-black rounded-2xl shadow-2xl border border-[#8ecae6]">
          <h2 className="text-2xl font-bold mb-8 text-center text-[#8ecae6] tracking-wider">
            已送出的評分與回饋
          </h2>
          {status && (
            <div className="mb-6 text-center text-red-600 font-semibold">
              {status}
            </div>
          )}

          {/* 已送出評分列表 */}
          <ul className="mb-8">
            {submittedScores.map(scoreObj => (
              <li key={scoreObj.id} className="mb-4 p-4 bg-[#e7f5ff] rounded">
                <div>
                  <span className="font-bold text-[#219ebc]">作品名稱：</span>
                  {scoreObj.pieceName}
                </div>
                <div>
                  <span className="font-bold text-[#219ebc]">分數：</span>
                  {scoreObj.score}
                </div>
                <div>
                  <span className="font-bold text-[#219ebc]">回饋：</span>
                  {scoreObj.comment}
                </div>
                <button
                  className="mt-2 px-4 py-1 bg-[#219ebc] text-white rounded hover:bg-[#126782]"
                  onClick={() => handleEdit(scoreObj)}
                >
                  編輯
                </button>
              </li>
            ))}
          </ul>

          {/* 編輯表單 */}
          {editingScore && (
            <form onSubmit={handleEditSubmit} className="mb-8">
              <div className="mb-4 font-bold text-[#219ebc]">
                編輯：{editingScore.pieceName}
              </div>
              <div className="mb-4">
                <label className="block mb-2">分數（0-100）</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editScore}
                  onChange={e => setEditScore(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">回饋留言</label>
                <textarea
                  value={editComment}
                  onChange={e => setEditComment(e.target.value)}
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
                {loading ? "儲存中..." : "儲存修改"}
              </button>
              <button
                type="button"
                className="ml-4 px-6 py-2 bg-gray-300 text-white rounded-lg font-bold hover:bg-gray-400 transition"
                onClick={() => setEditingScore(null)}
                disabled={loading}
              >
                取消
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default EditGradePage;
