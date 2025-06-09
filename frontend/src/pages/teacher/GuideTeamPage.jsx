import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";

// 靜態隊伍資料
const staticTeamsByYear = {
  2023: [
    {
      tid: "T2023",
      name: "未來之星",
      year: 2023,
      rank: 2,
      students: [
        { name: "張偉", sid: "S1001", department: "資訊工程", grade: 3 },
        { name: "林芳", sid: "S1002", department: "資訊工程", grade: 2 },
      ],
    },
  ],
  2024: [
    {
      tid: "T2024",
      name: "創新夢想隊",
      year: 2024,
      rank: 1,
      students: [
        { name: "陳志明", sid: "S2001", department: "電機工程", grade: 4 },
        { name: "李玉", sid: "S2002", department: "資訊管理", grade: 2 },
      ],
    },
  ],
  2025: [
    {
      tid: "T2025",
      name: "資工之星",
      year: 2025,
      rank: null,
      students: [
        { name: "王小明", sid: "S3001", department: "資訊工程", grade: 3 },
        { name: "李小美", sid: "S3002", department: "資訊工程", grade: 2 },
      ],
    },
  ],
};

// 靜態作品資料
const staticPiecesByTid = {
  T2023: [
    {
      pid: 101,
      tid: "T2023",
      name: "智慧農業監控系統",
      demo: "https://demo.example.com/agri2023",
      poster: "https://poster.example.com/agri2023.jpg",
      code: "https://github.com/team2023/agri",
      document: "https://docs.example.com/agri2023.pdf",
    },
  ],
  T2024: [
    {
      pid: 201,
      tid: "T2024",
      name: "AI 語音助理",
      demo: "https://demo.example.com/ai2024",
      poster: "https://poster.example.com/ai2024.jpg",
      code: "https://github.com/team2024/ai",
      document: "https://docs.example.com/ai2024.pdf",
    },
  ],
  T2025: [
    {
      pid: 301,
      tid: "T2025",
      name: "自駕車模擬系統",
      demo: "https://demo.example.com/car2025",
      poster: "https://poster.example.com/car2025.jpg",
      code: "https://github.com/team2025/car",
      document: "https://docs.example.com/car2025.pdf",
    },
  ],
};

const availableYears = [2023, 2024, 2025];

function GudieTeamPage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const [teams, setTeams] = useState(staticTeamsByYear[2025]);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [piecesMap, setPiecesMap] = useState({}); // { [tid]: [piece, ...] }

  // 權限與隊伍資料
  useEffect(() => {
    if (isLoadingUser) return; // 等待用戶資訊載入完成
    if (!userInfo.isLoggedIn || userInfo.role !== "teacher") {
      navigate("/login");
      return;
    }
    fetch(
      `http://localhost:5000/api/teacher/teams?teacher_ssn=${userInfo.ssn}&year=${selectedYear}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("查無指導隊伍或未授權");
        return res.json();
      })
      .then((data) => {
        setTeams(Array.isArray(data) && data.length > 0 ? data : []);
        setError("");
      })
      .catch((err) => {
        setError(err.message + "，已載入靜態資料。");
        setTeams(staticTeamsByYear[selectedYear] || []);
      });
  }, [userInfo, isLoadingUser, navigate, selectedYear]);

  // 取得每個隊伍的作品
  useEffect(() => {
    setPiecesMap({});
    if (!teams || teams.length === 0) return;
    teams.forEach((team) => {
      fetch(`http://localhost:5000/api/piece/${team.tid}`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("查無作品");
          return res.json();
        })
        .then((data) => {
          setPiecesMap((prev) => ({
            ...prev,
            [team.tid]: Array.isArray(data) ? data : [],
          }));
        })
        .catch(() => {
          // fetch 失敗時載入靜態資料
          setPiecesMap((prev) => ({
            ...prev,
            [team.tid]: staticPiecesByTid[team.tid] || [],
          }));
        });
    });
  }, [teams]);

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
        <div className="max-w-4xl mx-auto my-12 p-8 bg-white text-black rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-8 text-center text-[#007BFF] tracking-wider">
            指導的隊伍
          </h2>
          {/* 年份選擇 */}
          <div className="flex justify-center mb-8">
            <label className="mr-2 font-semibold text-[#007BFF]">選擇年份：</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="text-red-500 text-center font-semibold mb-6">
              {error}
            </div>
          )}
          {teams.length === 0 && !error && (
            <div className="text-gray-500 text-center">目前沒有指導的隊伍。</div>
          )}
          {teams.map((team) => (
            <div key={team.tid} className="mb-10 border-b border-gray-200 pb-6">
              <div className="mb-2">
                <span className="font-bold text-gray-700">隊伍名稱：</span>
                <span className="text-gray-900">{team.name}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">年度：</span>
                <span className="text-gray-900">{team.year}</span>
                <span className="ml-6 font-bold text-gray-700">排名：</span>
                <span className="text-gray-900">
                  {team.rank !== null && team.rank !== undefined
                    ? team.rank
                    : "尚未排名"}
                </span>
              </div>
              <div className="mt-2 font-bold text-[#007BFF]">隊員：</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {team.students.map((stu, i) => (
                  <div key={i}>
                    <span className="text-gray-900">
                      {stu.name}（{stu.sid}，{stu.department}，{stu.grade}年級）
                    </span>
                  </div>
                ))}
              </div>
              {/* 作品資訊 */}
              <div className="mt-6">
                <div className="font-bold text-[#007BFF] mb-2">作品資訊：</div>
                {piecesMap[team.tid] && piecesMap[team.tid].length > 0 ? (
                  piecesMap[team.tid].map((piece) => (
                    <div
                      key={piece.pid}
                      className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div>
                        <span className="font-bold text-gray-700">作品名稱：</span>
                        <span className="text-gray-900">{piece.name}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">Demo：</span>
                        <a
                          href={piece.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {piece.demo}
                        </a>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">海報：</span>
                        <a
                          href={piece.poster}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {piece.poster}
                        </a>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">程式碼：</span>
                        <a
                          href={piece.code}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {piece.code}
                        </a>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">文件：</span>
                        <a
                          href={piece.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {piece.document}
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">尚無作品資料。</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default GudieTeamPage;
