import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function TeamInfoPage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const staticTeamInfo = {
    tid: 1,
    team_name: "AI創意隊",
    teacher_name: "張老師",
    year: 2025,
    rank: "A",
    students: [
      { name: "王小明", sid: "A1115500", department: "資訊工程學系", grade: 3 },
      { name: "李小華", sid: "A1115501", department: "資訊工程學系", grade: 3 },
      { name: "陳大仁", sid: "A1115502", department: "資訊工程學系", grade: 2 },
      { name: "林小美", sid: "A1115503", department: "資訊工程學系", grade: 4 },
    ],
  };

  const [teamInfo, setTeamInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "student") {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:5000/api/team/info?ssn=${encodeURIComponent(userInfo.ssn)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("未找到相關隊伍資料");
        return res.json();
      })
      .then(setTeamInfo)
      .catch((err) => {
        setError(`後端連線失敗，顯示預設資料。${err}`);
        setTeamInfo(staticTeamInfo);
      });
  }, [userInfo, isLoadingUser, navigate]);

  const loading = !teamInfo;

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
        <div className="max-w-3xl mx-auto my-12 p-8 bg-white text-black rounded-2xl shadow-2xl border border-[#8ecae6]">
          <h2 className="text-2xl font-bold mb-8 text-center text-[black] tracking-wider">
            隊伍資訊
          </h2>

          {error && (
            <div className="text-yellow-600 text-center font-semibold mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
            <div className="mb-3">
              <span className="font-bold text-[black]">隊伍編號：</span>
              {loading ? <Skeleton width={100} baseColor="#d9e3ec" highlightColor="#f0f4f8"/> : teamInfo.tid}
            </div>
            <div className="mb-3">
              <span className="font-bold text-[black]">隊伍名稱：</span>
              {loading ? <Skeleton width={120} baseColor="#d9e3ec" highlightColor="#f0f4f8"/> : teamInfo.team_name}
            </div>
            <div className="mb-3">
              <span className="font-bold text-[black]">指導教授：</span>
              {loading ? <Skeleton width={100} baseColor="#d9e3ec" highlightColor="#f0f4f8"/> : teamInfo.teacher_name}
            </div>
            <div className="mb-3">
              <span className="font-bold text-[black]">年度：</span>
              {loading ? <Skeleton width={80} baseColor="#d9e3ec" highlightColor="#f0f4f8"/> : teamInfo.year}
            </div>
            <div className="mb-3 ">
              <span className="font-bold text-[black]">排名：</span>
              {loading ? <Skeleton width={40} baseColor="#d9e3ec" highlightColor="#f0f4f8"/> : teamInfo.rank}
            </div>
          </div>
            
          <div>
            {(loading ? Array(4).fill(null) : teamInfo.students).map((stu, i) => (
              <div key={i} className="col-span-1">
                <span className="font-bold text-[black]">學生{i + 1}：</span>
                {loading ? (
                  <Skeleton width={`80%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
                ) : (
                  <>
                    <br />
                    {stu.name}（{stu.sid}） / {stu.department} / {stu.grade}年級
                  </>
                )}
              </div>
            ))}
            </div>
          </div>

          {!loading && (
            <div className="mb-8 border-t border-[black] pt-6">
              <h3 className="text-xl font-bold mb-4 text-[black]">功能選單</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/editteaminfo")}
                  className="px-6 py-2 bg-[black] text-white rounded-lg font-bold hover:bg-[#126782] transition"
                >
                  修改隊伍資料
                </button>
                <button
                  onClick={() => navigate("/subpiece")}
                  className="px-6 py-2 bg-[black] text-white rounded-lg font-bold hover:bg-[#126782] transition"
                >
                  上傳作品
                </button>
                <button
                  onClick={() => navigate("/editpiece")}
                  className="px-6 py-2 bg-[black] text-white rounded-lg font-bold hover:bg-[#126782] transition"
                >
                  修改作品
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TeamInfoPage;
