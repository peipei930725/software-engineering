import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import { useUser } from "../../contexts/UserContext.jsx";
import { useNavigate } from "react-router-dom";

function AdminAppealPage() {
  const { userInfo, isLoadingUser } = useUser();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 僅限管理員進入
  useEffect(() => {
    if (isLoadingUser) return;
    if (!userInfo.isLoggedIn || userInfo.role !== "admin") {
      navigate("/login");
    }
  }, [userInfo, isLoadingUser, navigate]);

  // 取得所有申訴資料
  useEffect(() => {
    if (!userInfo.isLoggedIn || userInfo.role !== "admin") return;
    setLoading(true);
    fetch("http://localhost:5000/api/appeals", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("載入失敗");
        return res.json();
      })
      .then((data) => {
        setAppeals(data);
        setLoading(false);
      })
      .catch(() => {
        setError("無法取得申訴資料，請稍後再試。");
        setLoading(false);
      });
  }, [userInfo]);

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">申訴接收</h1>
        <div className="w-11/12 md:w-4/5 max-w-4xl bg-white rounded-lg shadow-lg p-8 text-black">
          {loading ? (
            <div className="text-center text-lg">載入中...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : appeals.length === 0 ? (
            <div className="text-center text-gray-600">目前沒有申訴紀錄</div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">申訴編號</th>
                  <th className="p-2 border">申訴人身分證字號</th>
                  <th className="p-2 border">申訴內容</th>
                </tr>
              </thead>
              <tbody>
                {appeals.map((appeal) => (
                  <tr key={appeal.aid} className="hover:bg-gray-100">
                    <td className="p-2 border text-center">{appeal.aid}</td>
                    <td className="p-2 border text-center">{appeal.user_ssn}</td>
                    <td className="p-2 border">{appeal.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminAppealPage;
