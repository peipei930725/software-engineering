import React, { useEffect, useReducer } from "react";
import Navbar from "../components/Navbar.jsx";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

// 共用 API hooks
function useTeamApi() {
  // 查學生姓名
  const fetchStudentNameBySsn = async (ssn) => {
    if (!ssn) return "";
    const res = await fetch(
      `http://localhost:5000/api/isstd?ssn=${encodeURIComponent(ssn)}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("查無此身分證字號");
    const data = await res.json();
    return data.username;
  };
  // 查老師姓名
  const fetchTeacherNameBySsn = async (ssn) => {
    if (!ssn) return "";
    const res = await fetch(
      `http://localhost:5000/api/istc?ssn=${encodeURIComponent(ssn)}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("查無此身分證字號");
    const data = await res.json();
    return data.username;
  };
  return { fetchStudentNameBySsn, fetchTeacherNameBySsn };
}

// 初始狀態
const initialState = {
  teamInfo: null,
  loading: false,
  error: "",
  msg: "",
  studentErrors: {},
  teacherError: "",
  deleteChecked: [],
  submitting: false,
};

// reducer
function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        teamInfo: action.payload,
        deleteChecked: Array(action.payload.students.length).fill(false),
        error: "",
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload, teamInfo: null };
    case "SET_TEACHER":
      return {
        ...state,
        teamInfo: {
          ...state.teamInfo,
          teacher_ssn: action.ssn,
          teacher_name: action.name,
        },
        teacherError: action.error || "",
      };
    case "SET_STUDENT":
      const students = [...state.teamInfo.students];
      students[action.idx] = { ...students[action.idx], ...action.payload };
      return {
        ...state,
        teamInfo: { ...state.teamInfo, students },
        studentErrors: { ...state.studentErrors, [action.idx]: action.error || "" },
      };
    case "ADD_STUDENT":
      return {
        ...state,
        teamInfo: {
          ...state.teamInfo,
          students: [...state.teamInfo.students, { ssn: "", name: "" }],
        },
        deleteChecked: [...state.deleteChecked, false],
      };
    case "TOGGLE_DELETE":
      return {
        ...state,
        deleteChecked: state.deleteChecked.map((c, i) =>
          i === action.idx ? !c : c
        ),
      };
    case "SET_FIELD":
      return {
        ...state,
        teamInfo: { ...state.teamInfo, [action.field]: action.value },
      };
    case "SET_MSG":
      return { ...state, msg: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// TeacherEditor
function TeacherEditor({ ssn, name, error, onSsnChange }) {
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

function StudentEditor({ idx, ssn, name, error, checked, onSsnChange, onDeleteCheck }) {
  const isFirst = idx === 0;
  return (
    <div className="flex items-center gap-2">
      {/* 第一位學生不顯示刪除勾選 */}
      {!isFirst && (
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onDeleteCheck(idx)}
          className="mr-2"
          title="勾選刪除"
        />
      )}
      <input
        type="text"
        value={ssn}
        // 第一位學生 input 禁止修改
        onChange={isFirst ? undefined : e => onSsnChange(idx, e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded w-40"
        required
        placeholder="身分證字號"
        readOnly={isFirst}
        style={isFirst ? { backgroundColor: "#f3f4f6", color: "#888" } : {}}
      />
      <span className="ml-2 text-gray-700">{name || "查無"}</span>
      {error && <span className="ml-2 text-red-600 text-sm">{error}</span>}
    </div>
  );
}

export default function EditTeamInfoPage() {
  const { userInfo, isLoadingUser } = useUser();
  const navigate = useNavigate();
  const { fetchStudentNameBySsn, fetchTeacherNameBySsn } = useTeamApi();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { teamInfo, loading, error, msg, studentErrors, teacherError, deleteChecked, submitting } = state;

  // 載入隊伍資料
  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo?.isLoggedIn || userInfo?.role !== "student") {
      navigate("/login");
      return;
    }
    dispatch({ type: "FETCH_START" });
    fetch(`http://localhost:5000/api/team/info?ssn=${encodeURIComponent(userInfo.ssn)}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("無法取得隊伍資料");
        return res.json();
      })
      .then(data => {
        if (!data || !data.students) throw new Error("隊伍資料格式錯誤");
        // 讓自己的 ssn 在第一位
        const mySsn = userInfo.ssn;
        let students = data.students || [];
        const myIdx = students.findIndex(stu => stu.ssn === mySsn);
        if (myIdx !== 0 && myIdx !== -1) {
        // 把自己移到第一位
        const [myStu] = students.splice(myIdx, 1);
        students.unshift(myStu);
        }
      // 若找不到自己，則加在第一位
      if (myIdx === -1) {
        students.unshift({ ssn: mySsn, name: userInfo.name || "" });
      }
  data.students = students;
  dispatch({ type: "FETCH_SUCCESS", payload: data });
        if (!data || !data.students) throw new Error("隊伍資料格式錯誤");
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      })
      .catch(err => {
        dispatch({ type: "FETCH_ERROR", payload: err.message || "後端連線失敗，無法取得隊伍資料。" });
      });
  }, [userInfo, isLoadingUser, navigate]);

  // 教師身分證字號變更
  const handleTeacherSsnChange = async (newSsn) => {
    dispatch({ type: "SET_TEACHER", ssn: newSsn, name: "" });
    if (!newSsn) return;
    try {
      const name = await fetchTeacherNameBySsn(newSsn);
      dispatch({ type: "SET_TEACHER", ssn: newSsn, name, error: "" });
    } catch {
      dispatch({ type: "SET_TEACHER", ssn: newSsn, name: "", error: "查無此身分證字號" });
    }
  };

  // 學生身分證字號變更
  const handleStudentSsnChange = async (idx, newSsn) => {
    dispatch({ type: "SET_STUDENT", idx, payload: { ssn: newSsn, name: "" }, error: "" });
    if (!newSsn) return;
    try {
      const name = await fetchStudentNameBySsn(newSsn);
      dispatch({ type: "SET_STUDENT", idx, payload: { ssn: newSsn, name }, error: "" });
    } catch {
      dispatch({ type: "SET_STUDENT", idx, payload: { ssn: newSsn, name: "" }, error: "查無此身分證字號" });
    }
  };

  // 新增隊員
  const handleAddStudent = () => {
    dispatch({ type: "ADD_STUDENT" });
  };

  // 勾選刪除
  const handleDeleteCheck = (idx) => {
    dispatch({ type: "TOGGLE_DELETE", idx });
  };

  // 表單欄位
  const handleChange = (e) => {
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value });
  };

  // 送出
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "SET_MSG", payload: "" });
    dispatch({ type: "SET_ERROR", payload: "" });
    dispatch({ type: "SET_SUBMITTING", payload: true });
    const submitData = {
      ...teamInfo,
      students: teamInfo.students.filter((_, idx) => !deleteChecked[idx]),
    };
    try {
      const res = await fetch(`http://localhost:5000/api/team/edit?ssn=${encodeURIComponent(userInfo.ssn)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: "SET_ERROR", payload: data.message || "更新失敗" });
      } else {
        dispatch({ type: "SET_MSG", payload: "隊伍資訊更新成功！" });
        setTimeout(() => navigate("/teaminfo"), 1200);
      }
    } catch {
      dispatch({ type: "SET_ERROR", payload: "無法連接伺服器" });
    }
    dispatch({ type: "SET_SUBMITTING", payload: false });
  };

  if (loading || !teamInfo) {
    return (
      <>
        <Navbar />
        <div className="bg-[#023047] text-white min-h-screen flex items-center justify-center">
          {error ? error : "載入中..."}
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
              error={teacherError}
              onSsnChange={handleTeacherSsnChange}
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
              disabled={submitting}
              className="w-full py-3 bg-[#219ebc] text-white font-bold rounded hover:bg-[#126782] disabled:opacity-50"
            >
              {submitting ? "送出中..." : "確認修改"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
