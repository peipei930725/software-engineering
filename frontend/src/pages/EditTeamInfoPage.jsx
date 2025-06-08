import React, { useEffect, useReducer, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

// 預設資料
const staticTeamInfo = {
  tid: 1,
  team_name: "AI創意隊",
  teacher_ssn: "T123456789",
  teacher_name: "張老師",
  year: 2025,
  students: [
    { ssn: "A123456789", name: "王小明" },
    { ssn: "B234567890", name: "李小華" },
    { ssn: "C345678901", name: "陳大仁" },
    { ssn: "D456789012", name: "林小美" },
  ],
};

// 共用 API 查詢
async function fetchUserNameBySsn(ssn) {
  if (!ssn) return "";
  const res = await fetch(
    `http://localhost:5000/api/user?ssn=${encodeURIComponent(ssn)}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("查無此身分證字號");
  const data = await res.json();
  return data.name;
}

// reducer 處理 team 狀態
function teamReducer(state, action) {
  switch (action.type) {
    case "SET_TEAM":
      return { ...state, ...action.payload };
    case "SET_TEACHER":
      return { ...state, teacher_ssn: action.ssn, teacher_name: action.name };
    case "SET_STUDENT":
      const students = [...state.students];
      students[action.idx] = { ...students[action.idx], ...action.payload };
      return { ...state, students };
    case "ADD_STUDENT":
      return { ...state, students: [...state.students, { ssn: "", name: "" }] };
    case "REMOVE_STUDENTS":
      return { ...state, students: state.students.filter((_, idx) => !action.checked[idx]) };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

// 教師欄位編輯
function TeacherEditor({ ssn, name, onSsnChange, error }) {
  return (
    <div>
      <label className="block font-bold mb-1">指導老師身分證字號</label>
      <input
        type="text"
        value={ssn}
        onChange={e => onSsnChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="mt-1 text-gray-600">老師姓名：{name || "查無"}</div>
    </div>
  );
}

// 學生欄位編輯
function StudentEditor({ idx, ssn, name, error, checked, onSsnChange, onDeleteCheck }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onDeleteCheck(idx)}
        className="mr-2"
        title="勾選刪除"
      />
      <input
        type="text"
        value={ssn}
        onChange={e => onSsnChange(idx, e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded w-40"
        required
        placeholder="身分證字號"
      />
      <span className="ml-2 text-gray-700">{name || "查無"}</span>
      {error && <span className="ml-2 text-red-600 text-sm">{error}</span>}
    </div>
  );
}

export default function EditTeamInfoPage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();

  const [teamInfo, dispatch] = useReducer(teamReducer, staticTeamInfo);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentErrors, setStudentErrors] = useState({});
  const [teacherError, setTeacherError] = useState("");
  const [deleteChecked, setDeleteChecked] = useState({});

  // 初始化
  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "student") {
      navigate("/login");
      return;
    }
    fetch("http://localhost:5000/api/team/info", { credentials: "include" })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        dispatch({ type: "SET_TEAM", payload: data });
        const checks = {};
        (data.students || []).forEach((_, idx) => (checks[idx] = false));
        setDeleteChecked(checks);
      })
      .catch(() => {
        setError("後端連線失敗，顯示預設資料。");
        dispatch({ type: "SET_TEAM", payload: staticTeamInfo });
        const checks = {};
        (staticTeamInfo.students || []).forEach((_, idx) => (checks[idx] = false));
        setDeleteChecked(checks);
      });
  }, [userInfo, isLoadingUser, navigate]);

  // 教授變更
  const handleTeacherSsnChange = useCallback(async (newSsn) => {
    setTeacherError("");
    dispatch({ type: "SET_TEACHER", ssn: newSsn, name: "" });
    if (!newSsn) return;
    try {
      const name = await fetchUserNameBySsn(newSsn);
      dispatch({ type: "SET_TEACHER", ssn: newSsn, name });
    } catch {
      setTeacherError("查無此身分證字號");
      dispatch({ type: "SET_TEACHER", ssn: newSsn, name: "" });
    }
  }, []);

  // 學生變更
  const handleStudentSsnChange = useCallback(async (idx, newSsn) => {
    setStudentErrors((prev) => ({ ...prev, [idx]: "" }));
    dispatch({ type: "SET_STUDENT", idx, payload: { ssn: newSsn, name: "" } });
    if (!newSsn) return;
    try {
      const name = await fetchUserNameBySsn(newSsn);
      dispatch({ type: "SET_STUDENT", idx, payload: { ssn: newSsn, name } });
    } catch {
      setStudentErrors((prev) => ({ ...prev, [idx]: "查無此身分證字號" }));
      dispatch({ type: "SET_STUDENT", idx, payload: { ssn: newSsn, name: "" } });
    }
  }, []);

  // 新增成員
  const handleAddStudent = useCallback(() => {
    dispatch({ type: "ADD_STUDENT" });
    setStudentErrors((prev) => ({ ...prev, [teamInfo.students.length]: "" }));
    setDeleteChecked((prev) => ({ ...prev, [teamInfo.students.length]: false }));
  }, [teamInfo.students.length]);

  // 勾選刪除
  const handleDeleteCheck = useCallback((idx) => {
    setDeleteChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  // 表單欄位
  const handleChange = (e) => {
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value });
  };

  // 送出
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setIsLoading(true);
    const submitData = {
      ...teamInfo,
      students: teamInfo.students.filter((_, idx) => !deleteChecked[idx]),
    };
    try {
      const res = await fetch("http://localhost:5000/api/team/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "更新失敗");
      } else {
        setMsg("隊伍資訊更新成功！");
        setTimeout(() => navigate("/teaminfo"), 1200);
      }
    } catch {
      setError("無法連接伺服器");
    }
    setIsLoading(false);
  };

  if (!teamInfo) {
    return (
      <>
        <Navbar />
        <div className="bg-[#023047] text-white min-h-screen flex items-center justify-center">
          載入中...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white text-black rounded-2xl shadow-2xl border border-[#8ecae6] p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">修改隊伍資訊</h2>
          {error && <div className="text-red-600 text-center font-semibold mb-4">{error}</div>}
          {msg && <div className="text-green-600 text-center font-semibold mb-4">{msg}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-1">隊伍名稱</label>
              <input
                type="text"
                name="team_name"
                value={teamInfo.team_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            <TeacherEditor
              ssn={teamInfo.teacher_ssn}
              name={teamInfo.teacher_name}
              onSsnChange={handleTeacherSsnChange}
              error={teacherError}
            />
            <div>
              <label className="block font-bold mb-1">年度</label>
              <input
                type="number"
                name="year"
                value={teamInfo.year}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">隊員資訊（僅可修改身分證字號，勾選刪除後送出）</label>
              <div className="space-y-4">
                {teamInfo.students.map((stu, idx) => (
                  <StudentEditor
                    key={idx}
                    idx={idx}
                    ssn={stu.ssn}
                    name={stu.name}
                    error={studentErrors[idx]}
                    checked={deleteChecked[idx]}
                    onSsnChange={handleStudentSsnChange}
                    onDeleteCheck={handleDeleteCheck}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                >
                  新增成員
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#219ebc] text-white font-bold rounded hover:bg-[#126782] disabled:opacity-50"
            >
              {isLoading ? "送出中..." : "確認修改"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
