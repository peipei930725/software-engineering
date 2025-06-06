import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

function LoginPage() {
	const [idNumber, setIdNumber] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { userInfo, setUserInfo, fetchUserInfo } = useUser(); // 添加 fetchUserInfo
	const navigate = useNavigate();

	useEffect(() => {
		if (userInfo.isLoggedIn) {
			// 如果用戶已經登入，重定向到首頁
			navigate("/home");
		}
	}, [userInfo.isLoggedIn, navigate]);

	const handleSubmit = async (e) => { // 修正函數名稱拼寫
		e.preventDefault();
		setError("");
		setIsLoading(true); // 添加載入狀態

		try {
			const response = await fetch("http://localhost:5000/api/login", { // 修正 URL (缺少冒號)
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include', // 添加這行以支援 cookies/sessions
				body: JSON.stringify({
					idNumber: idNumber,
					password: password,
				}),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// 登入成功後更新用戶狀態
				if (fetchUserInfo) {
					// 如果有 fetchUserInfo 函數，使用它來獲取完整的用戶資訊
					await fetchUserInfo();
				} else {
					// 或者直接設置從登入 API 返回的用戶資訊
					setUserInfo({
						isLoggedIn: true,
						username: data.username || data.user?.username,
						role: data.role || data.user?.role
					});
				}
				
				navigate("/home");
			} else {
				setError(data.message || "登入失敗");
			}
		} catch (err) {
			console.error("登入錯誤:", err); // 添加錯誤日誌
			setError("無法連接至伺服器。");
		} finally {
			setIsLoading(false); // 結束載入狀態
		}
	};

	return (
		<>
			<div className="bg-[#023047] text-white min-h-screen w-screen flex flex-col items-center justify-center">
				<div className="bg-white text-black rounded-lg p-12 w-110 shadow-lg">
					<h2 className="text-2xl font-semibold mb-6 text-center">
						登入
					</h2>
					<form className="space-y-4" onSubmit={handleSubmit}> {/* 添加 onSubmit 到 form */}
						<div>
							<label className="block mb-1">身分證字號</label>
							<input
								type="text"
								value={idNumber} // 添加 value 屬性
								className="w-full px-3 py-2 border border-gray-300 rounded"
								placeholder="請輸入身分證字號"
								onChange={(e) => setIdNumber(e.target.value)}
								required // 添加必填驗證
							/>
						</div>
						<div>
							<label className="block mb-1">密碼</label>
							<input
								type="password"
								value={password} // 添加 value 屬性
								className="w-full px-3 py-2 border border-gray-300 rounded"
								placeholder="請輸入密碼"
								onChange={(e) => setPassword(e.target.value)}
								required // 添加必填驗證
							/>
						</div>
						{error && (
							<p className="text-red-500 text-sm text-center">{error}</p>
						)}
						<button
							type="submit"
							className="w-full bg-[#023047] text-white py-2 rounded hover:bg-[#03537d] disabled:opacity-50 disabled:cursor-not-allowed" // 添加禁用狀態樣式
							disabled={isLoading} // 載入時禁用按鈕
						>
							<span>{isLoading ? "登入中..." : "登入"}</span> {/* 動態顯示按鈕文字 */}
						</button>
					</form>
				</div>
				<div>
					<p className="mt-4 text-center text-white"> {/* 修正 JSX 語法 */}
						還沒有帳號嗎 ?{" "}
						<Link to="/register">
							<span className="text-blue-500 hover:underline hover:text-blue-200">
								註冊
							</span>
						</Link>
					</p> {/* 修正標籤結構 */}
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