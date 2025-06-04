import React from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
	const navigate = useNavigate();

	const handleRoleSelect = (role) => {
		switch (role) {
			case "student":
				navigate("/register/student");
				break;
			case "teacher":
				navigate("/register/teacher");
				break;
			case "judge":
				navigate("/register/judge");
				break;
			default:
				break;
		}
	};

	return (
		<>
			<div className="bg-[#023047] h-screen w-screen m-0 flex flex-col items-center justify-center inset-0 overflow-y-auto">
				<div className="relative bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30 rounded-3xl p-10 md:p-12 max-w-4xl w-full text-center">
					<h2 className="text-2xl font-bold mb-10 text-black">
						選擇您的身分類別
					</h2>
					<div className="flex flex-col items-center pb-12 px-4">
						<div className="flex flex-wrap justify-center gap-10 w-full">
							<Card
								onClick={() => handleRoleSelect("student")}
								img="/student.png"
								label="學生"
							/>
							<Card
								onClick={() => handleRoleSelect("teacher")}
								img="/teacher.jpg"
								label="指導老師"
							/>
							<Card
								onClick={() => handleRoleSelect("judge")}
								img="/judge.png"
								label="評審"
							/>
						</div>
					</div>
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

function Card({ onClick, img, label }) {
	return (
		<div
			onClick={onClick}
			className="group relative bg-white/90 backdrop-blur-md border-2 border-transparent hover:border-pink-400 rounded-2xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-105 cursor-pointer w-[220px] min-h-[200px] flex flex-col items-center justify-center p-6"
		>
			<div className="absolute group-hover:left-full bg-gradient-to-r from-transparent via-pink-100 to-transparent transition-all duration-700 ease-in-out z-0" />
			<img
				src={img}
				alt={label}
				className="w-[90px] h-[90px] mb-4 rounded-full border-4 border-pink-100 object-cover shadow-md group-hover:scale-110"
			/>
			<p className="text-lg font-semibold text-gray-800 group-hover:text-pink-500 transition">
				{label}
			</p>
		</div>
	);
}

export default RegisterPage;
