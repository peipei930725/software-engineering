// src/pages/AdminEditProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useUser } from "../../contexts/UserContext";

function AdminEditProfilePage() {
	const { ssn } = useParams();
	const navigate = useNavigate();
	const { userInfo, isLoadingUser } = useUser();
	const role = new URLSearchParams(useLocation().search).get("role");

	const [profile, setProfile] = useState(null);
	const [error, setError] = useState("");
	const [msg, setMsg] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isLoadingUser) return;
		if (!userInfo.isLoggedIn || userInfo.role !== "admin") {
			navigate("/login");
		}
	}, [userInfo, isLoadingUser, navigate]);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch(
					`http://localhost:5000/api/profile?ssn=${ssn}`,
					{
						credentials: "include",
					}
				);
				const data = await res.json();
				console.log(data);
				setProfile({ ...data, role });
			} catch (err) {
				console.error(err);
				setError("無法載入使用者資料");
			}
		};
		fetchProfile();
	}, [ssn, role]);

	const handleChange = (e) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setMsg("");

		try {
			const body = {
				...profile,
				role,
				ssn,
			};
			console.log(body);
			const res = await fetch("http://localhost:5000/api/admin/user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(body),
			});
			const result = await res.json();
			if (!res.ok) {
				setError(result.msg || "更新失敗");
			} else {
				setMsg("更新成功");
				setTimeout(() => navigate("/allusers"), 2000);
			}
		} catch (err) {
			setError(`伺服器錯誤。${err.message}`);
		}
		setIsLoading(false);
	};

	if (error && !profile) {
		return (
			<>
				<Navbar />
				<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen flex items-center justify-center">
					{error}
				</div>
			</>
		);
	}

	if (!profile) {
		return (
			<>
				<Navbar />
				<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen flex items-center justify-center">
					載入中...
				</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen flex flex-col items-center pb-4">
				<div className="bg-white text-black rounded-3xl shadow-xl p-10 md:p-12 max-w-4xl w-full">
					<h2 className="text-2xl font-bold mb-8 text-center">
						修改使用者資料
					</h2>
					<form onSubmit={handleSubmit}>
						<InputColumn
							label="姓名"
							name="name"
							value={profile.name}
							onChange={handleChange}
						/>
						<InputColumn
							label="Email"
							name="email"
							value={profile.email}
							onChange={handleChange}
						/>
						<InputColumn
							label="手機號碼"
							name="phonenumber"
							value={profile.phonenumber}
							onChange={handleChange}
						/>
						<InputColumn
							label="聯絡地址"
							name="address"
							value={profile.address}
							onChange={handleChange}
						/>

						{role === "student" && (
							<>
								<InputColumn
									label="系所"
									name="department"
									value={profile.department}
									onChange={handleChange}
								/>
								<InputColumn
									label="年級"
									name="grade"
									value={profile.grade}
									onChange={handleChange}
								/>
								<InputColumn
									label="學號"
									name="sid"
									value={profile.sid}
									onChange={handleChange}
								/>
							</>
						)}
						{role === "teacher" && (
							<InputColumn
								label="學歷"
								name="degree"
								value={profile.degree}
								onChange={handleChange}
							/>
						)}
						{role === "judge" && (
							<InputColumn
								label="頭銜"
								name="title"
								value={profile.title}
								onChange={handleChange}
							/>
						)}
						<InputColumn
							label="密碼"
							name="password"
							value={profile.password}
							onChange={handleChange}
						/>

						<button
							type="submit"
							className="w-full mt-8 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-600"
							disabled={isLoading}
						>
							{isLoading ? "儲存中..." : "確認修改"}
						</button>
						{msg && (
							<p className="mt-4 text-green-600 font-semibold text-center">
								{msg}
							</p>
						)}
						{error && profile && (
							<p className="mt-4 text-red-500 font-semibold text-center">
								{error}
							</p>
						)}
					</form>
				</div>
			</div>
		</>
	);
}

function InputColumn({ label, name, value, onChange }) {
	return (
		<div className="mb-4">
			<label className="block mb-1 font-medium">{label}</label>
			<input
				type="text"
				name={name}
				value={value || ""}
				onChange={onChange}
				className="w-full px-3 py-2 border border-gray-300 rounded"
				required
			/>
		</div>
	);
}

export default AdminEditProfilePage;
