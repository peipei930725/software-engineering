import { Link } from "react-router-dom";

function Register() {
	return (
		<>
			<div className="bg-[#023047] text-white h-screen w-screen flex flex-col items-center justify-center">
				<div className="bg-white text-black rounded-lg p-12 w-110 shadow-lg">
					<p className="text-2xl font-semibold mb-6 text-center">
						註冊
					</p>
					<p className="text-lg font-base mb-6 text-center text-orange-500">
						選擇您的
                        <span className="text-red-600 font-bold">身分別</span>
					</p>
					<form className="space-y-4">
						<div>
                            <button>

                            </button>
                        </div>
						<div></div>
						<button
							type="submit"
							className="w-full bg-[#023047] text-white py-2 rounded hover:bg-[#03537d]"
						>
							<span>註冊</span>
						</button>
					</form>
				</div>
				<div>
					<p className="mt-4 text-center text-white">
						已經有帳號了嗎 ?{" "}
						<Link to="/login">
							<span className="text-blue-500 hover:underline hover:text-blue-200">
								登入
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

export default Register;
