// src/pages/admin/AdminBrowsePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import Navbar from "../../components/Navbar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const identities = ["team", "piece"];
const identityLabels = {
    team: "隊伍",
    piece: "作品評分",
};

const identityApiMap = {
    team: "http://localhost:5000/api/admin/table/teams",
    piece: "http://localhost:5000/api/admin/table/pieces",
};

export default function AdminBrowsePage() {
    const { userInfo, isLoadingUser } = useUser();
    const navigate = useNavigate();
    const [identity, setIdentity] = useState("team");
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isLoadingUser) return;
        if (!userInfo.isLoggedIn || userInfo.role !== "admin") {
            navigate("/login");
        }
    }, [userInfo, isLoadingUser]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const url = identityApiMap[identity];
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ identity }),
                });

                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) {
                    setData(json);
                    setColumns(Object.keys(json[0]));
                } else {
                    setData([]);
                    setColumns([]);
                }
            } catch (err) {
                console.error("資料讀取失敗", err);
                setData([]);
                setColumns([]);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [identity]);

    const filteredData = data.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <>
            <Navbar />
            <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen">
                <header className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        所有 {identityLabels[identity]} 資料
                    </h2>
                </header>

                <div className="flex justify-center flex-wrap gap-4 my-10">
                    {identities.map((id) => (
                        <button
                            key={id}
                            onClick={() => setIdentity(id)}
                            className={`px-5 py-2 rounded-xl font-semibold text-white transition-transform transform hover:scale-105 shadow ${identity === id ? "bg-blue-800" : "bg-blue-500 hover:bg-blue-700"}`}
                        >
                            {identityLabels[id]}
                        </button>
                    ))}
                </div>

                <div className="mx-auto w-11/12 md:w-4/5 bg-white text-black rounded-xl shadow-lg p-6 overflow-x-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜尋關鍵字..."
                        className="mb-4 w-full px-3 py-2 border border-gray-300 rounded"
                    />

                    {isLoading ? (
                        <>
                            <Skeleton height={40} width={200} className="mb-3" baseColor="#d9e3ec" highlightColor="#f0f4f8" />
                            <Skeleton count={6} height={40} className="mb-3" baseColor="#d9e3ec" highlightColor="#f0f4f8" />
                        </>
                    ) : filteredData.length > 0 ? (
                        <div className="min-w-max">
                            <table className="table-auto w-full border-collapse">
                                <thead>
                                    <tr>
                                        {columns.map((col) => (
                                            <th
                                                key={col}
                                                className="border px-3 py-2 bg-blue-600 text-white font-semibold"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className={idx % 2 === 0 ? "bg-gray-100" : "bg-white"}
                                        >
                                            {columns.map((col) => (
                                                <td key={col} className="border px-3 py-2">
                                                    {row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-10 text-gray-500">目前沒有資料</p>
                    )}
                </div>
            </div>
        </>
    );
}
