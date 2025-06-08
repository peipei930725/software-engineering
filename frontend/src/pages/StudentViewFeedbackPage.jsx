import { useEffect, useState, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "react-loading-skeleton/dist/skeleton.css";

function StudentViewFeedbackPage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 取得隊伍與回饋資料
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. 取得學生所屬隊伍
      const teamRes = await fetch(`http://localhost:5000/api/team/info?ssn=${encodeURIComponent(userInfo.ssn)}`, {
        credentials: "include",
      });
      if (!teamRes.ok) throw new Error("查無隊伍資料");
      const teamData = await teamRes.json();
      setTeamName(teamData.name || "");

      // 2. 取得該隊伍所有評分與回饋
      const fbRes = await fetch(
        `http://localhost:5000/api/team/feedback?tid=${teamData.tid}&ssn=${encodeURIComponent(userInfo.ssn)}`,
        { credentials: "include" }
      );
      if (!fbRes.ok) throw new Error("查無評分資料");
      const fbData = await fbRes.json();
      setFeedbacks(Array.isArray(fbData) ? fbData : []);
    } catch (err) {
      setError(err.message);
      setFeedbacks([]); // 清空資料
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "student") {
      navigate("/login");
      return;
    }
    fetchFeedbacks();
  }, [userInfo, isLoadingUser, navigate, fetchFeedbacks]);

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen flex flex-col items-center pb-4">
        <div className="bg-white text-black rounded-3xl shadow-xl p-10 md:p-12 max-w-3xl w-full">
          <h2 className="text-2xl font-bold mb-8 text-center text-[#007BFF]">
            評審評分與回饋
          </h2>
          {teamName && (
            <div className="mb-6 text-center text-lg font-semibold text-[#007BFF]">
              隊伍名稱：{teamName}
            </div>
          )}
          {error && (
            <div className="mb-4 text-center text-red-600 font-semibold">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center text-gray-500">載入中...</div>
          ) : feedbacks.length === 0 && !error ? (
            <div className="text-gray-500 text-center">目前尚無評分與回饋。</div>
          ) : (
            feedbacks.map((fb, idx) => (
              <div
                key={fb.jid + idx}
                className="mb-8 p-5 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div>
                  <span className="font-bold text-gray-700">評審：</span>
                  <span className="text-gray-900">
                    {fb.judge_name || fb.jid}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">分數：</span>
                  <span className="text-gray-900">{fb.score}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">回饋：</span>
                  <span className="text-gray-900">{fb.comment}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default StudentViewFeedbackPage;
