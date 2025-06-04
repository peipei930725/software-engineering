import { Link } from "react-router-dom";

function LoginPage() {
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
							/>
						</div>
						<div>
							<label className="block mb-1">密碼</label>
							<input
								type="password"
								className="w-full px-3 py-2 border border-gray-300 rounded"
								placeholder="請輸入密碼"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-[#023047] text-white py-2 rounded hover:bg-[#03537d]"
						>
							<span>登入</span>
						</button>
					</form>
				</div>
				<div>
					<p className="mt-4 text-center text-white">
						還沒有帳號嗎 ?{" "}
						<Link to="/register">
							<span className="text-blue-500 hover:underline hover:text-blue-200">
								註冊
							</span>
						</Link>
						<Link to="/home">
							<p className="text-blue-300 hover:underline mt-2">
								回首頁
							</p>
						</Link>
					</p>
				</div>
			</div>
		</>
	);
}

export default LoginPage;
