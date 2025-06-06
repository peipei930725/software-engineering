import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useUser } from "../contexts/UserContext.jsx";

function AppealPage() {
	const [form, setForm] = useState({
		id: "",
		content: "",
	});
	const [message, setMessage] = useState("");

	const { userInfo } = useUser();
	const navigate = useNavigate();

	// 檢查使用者是否已登入且角色為學生或老師
	// 如果沒有登入或不是學生或老師，則重定向到登入頁面
	useEffect(() => {
		if (!userInfo.isLoggedIn || !(userInfo.role === "student" || userInfo.role === "teacher")) {
			// 有登入 而且 是老師或學生  => 沒登入 或 不是(老師或學生)
			navigate("/login");
		}  
	}, [userInfo, navigate]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		try {
			const res = await fetch("http://localhost:5000/api/report", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage("申訴已送出，謝謝您的填寫！");
				setForm({ id: "", content: "" });
			} else {
				setMessage(data.message || "送出失敗，請稍後再試。");
			}
		} catch (err) {
			setMessage(`伺服器連線失敗，請稍後再試。${err}`);
		}
	};

	return (
		<>
			<Navbar />
			<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
				<header className="text-center mt-12">
					<h1 className="text-3xl md:text-4xl font-semibold">
						申訴專區
					</h1>
				</header>
				<section className="mt-8 mx-auto w-11/12 h-7/12 md:w-4/5 bg-gray-300 text-black text-center text-2xl font-bold rounded-lg p-8">
					<p>
						如有任何比賽相關問題、異議或申訴事項，請填寫下方表單我們將儘快處理您的申訴。
					</p>
					<p className="text-base font-normal mt-4 text-gray-700">
						請詳細描述您的問題，並留下聯絡方式以便我們與您聯繫。
					</p>
				</section>
				<section className="mt-16 mx-auto w-11/12 md:w-4/5 max-w-2xl bg-white rounded-lg shadow-lg p-8 text-black">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label className="block font-semibold mb-2">
								身分證字號{" "}
								<span className="text-red-600">*</span>
							</label>
							<input
								type="text"
								name="id"
								value={form.id}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
								placeholder="請輸入您的身分證字號"
							/>
						</div>
						<div>
							<label className="block font-semibold mb-2">
								申訴內容 <span className="text-red-600">*</span>
							</label>
							<textarea
								name="content"
								value={form.content}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-200"
								placeholder="請詳細描述您的申訴內容"
							/>
						</div>
						<button
							type="submit"
							className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
						>
							送出申訴
						</button>
						{message && (
							<div className="mt-4 text-center text-green-600 font-semibold">
								{message}
							</div>
						)}
					</form>
				</section>
			</div>
		</>
	);
}

export default AppealPage;
