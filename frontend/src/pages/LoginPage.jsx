import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
	const [idNumber, setIdNumber] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSumbit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch("http://127.0.0.1:5000/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					idNumber: idNumber,
					password: password,
				}),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// 登入成功，可儲存資料後導向首頁
				// e.g. localStorage.setItem("username", data.username);
				navigate("/home");
			} else {
				setError(data.message || "登入失敗");
			}
		} catch (err) {
			setError("無法連接至伺服器。");
		}
	}

	return (
		<>
			<div className="bg-[#023047] text-white min-h-screen w-screen flex flex-col items-center justify-center">
				<div className="bg-white text-black rounded-lg p-12 w-110 shadow-lg">
					<h2 className="text-2xl font-semibold mb-6 text-center">
						登入
					</h2>
					<form className="space-y-4">
						<div>
							<label className="block mb-1">身分證字號</label>
							<input
								type="text"
								className="w-full px-3 py-2 border border-gray-300 rounded"
								placeholder="請輸入身分證字號"
								onChange={(e) => setIdNumber(e.target.value)}
							/>
						</div>
						<div>
							<label className="block mb-1">密碼</label>
							<input
								type="password"
								className="w-full px-3 py-2 border border-gray-300 rounded"
								placeholder="請輸入密碼"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						{error && (
							<p className="text-red-500 text-sm text-center">{error}</p>
						)}
						<button
							type="submit"
							className="w-full bg-[#023047] text-white py-2 rounded hover:bg-[#03537d]"
							onClick={handleSumbit}
						>
							<span>登入</span>
						</button>
					</form>
				</div>
				<div>
					<p className="mt-4 text-center text-white" />
						還沒有帳號嗎 ?{" "}
						<Link to="/register">
							<span className="text-blue-500 hover:underline hover:text-blue-200">
								註冊
							</span>
						</Link>
						<Link to="/home">
							<p className="text-blue-300 hover:underline mt-2 text-center">
								回首頁
							</p>
						</Link>
				</div>
			</div>
		</>
	);
}

export default LoginPage;
