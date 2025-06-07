// src/pages/UsersProfilePage.jsx
import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

const identities = ["student", "teacher", "judge", "admin"];
const fieldNameToLabel = {
	student: "學生",
	teacher: "老師",
	judge: "評審",
	admin: "管理員",
};

function UsersProfilePage() {
	const { userInfo } = useUser();
	const navigate = useNavigate();
	const [identity, setIdentity] = useState("student");
	const [data, setData] = useState([]);
	const [columns, setColumns] = useState([]);

	useEffect(() => {
		if (!userInfo.isLoggedIn || userInfo.role !== "admin") {
			navigate("/login");
		}
	}, [userInfo]);

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch(`http://localhost:5000/api/admin/allusers`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ identity }),
			});
			if (res.ok) {
				const json = await res.json();
				setData(json);
				if (Array.isArray(json) && json.length > 0) {
					setColumns(Object.keys(json[0]));
				} else {
					setColumns([]);
				}
			} else {
				setData([]);
				setColumns([]);
			}
		};
		fetchData();
	}, [identity]);

	// // 假資料 模擬用 請註解掉 !
	// useEffect(() => {
	// 	const mock = {
	// 		student: [
	// 			{
	// 				ssn: "A123456789",
	// 				username: "王小明",
	// 				email: "student1@example.com",
	// 				department: "資訊工程學系",
	// 				grade: "大三",
	// 				phone: "0912345678",
	// 			},
	// 		],
	// 		teacher: [
	// 			{
	// 				ssn: "T111222333",
	// 				username: "陳老師",
	// 				email: "teacher1@example.com",
	// 				department: "數學系",
	// 				title: "副教授",
	// 			},
	// 		],
	// 		// 其他角色...
	// 	};

	// 	console.log("API 回傳結果：", mock[identity]);
	// 	setData(mock[identity]);
	// 	if (mock[identity].length > 0) {
	// 		setColumns(Object.keys(mock[identity][0]));
	// 	} else {
	// 		setColumns([]);
	// 	}	
	// }, [identity]);

	return (
		<>
			<Navbar />
			<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen">
				<header className="text-center">
					<h2 className="text-3xl md:text-4xl font-bold">
						所有 {fieldNameToLabel[identity]} 使用者資料
						<span className="text-2xl">&nbsp;&nbsp;(請善用 </span>
						<span className="text-2xl text-red-600">Ctrl + F</span> 
						<span className="text-2xl">)</span>
					</h2>
				</header>

				<div className="flex justify-center flex-wrap gap-4 my-10">
					{identities.map((role) => (
						<button
							key={role}
							onClick={() => setIdentity(role)}
							className={`px-5 py-2 rounded-xl font-semibold text-white transition-transform transform hover:scale-105 shadow ${
								identity === role
									? "bg-blue-800"
									: "bg-blue-500 hover:bg-blue-700"
							}`}
						>
							{role === "student"
								? "學生"
								: role === "teacher"
								? "老師"
								: role === "judge"
								? "評審"
								: "管理員"}
						</button>
					))}
				</div>

				<div className="mx-auto w-11/12 md:w-4/5 bg-white text-black rounded-xl shadow-lg p-6 overflow-x-auto">
					{data.length > 0 ? (
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
									<th className="border px-3 py-2 bg-blue-600 text-white font-semibold">
										修改
									</th>
								</tr>
							</thead>
							<tbody>
								{data.map((row, idx) => (
									<tr
										key={idx}
										className={
											idx % 2 === 0
												? "bg-gray-100"
												: "bg-white"
										}
									>
										{columns.map((col) => (
											<td
												key={col}
												className="border px-3 py-2"
											>
												{row[col]}
											</td>
										))}
										<td className="border px-3 py-2">
											<Link
												to={`/admin/editprofile/${row.ssn}`}
												className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
												align="center"
											>
												修改
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<p className="text-center py-10 text-gray-500">
							目前沒有資料
						</p>
					)}
				</div>
			</div>
		</>
	);
}

export default UsersProfilePage;
