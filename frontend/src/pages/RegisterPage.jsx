import { React, useState } from "react";
import { Link } from "react-router-dom";

function RegisterPage() {
	const [selectedRole, setSelectedRole] = useState(null);
	const handleRoleSelect = (role) => {
		setSelectedRole(role);
	};

	const renderForm = () => {
		return (
			<form className="text-black">
				<InputColumn
					columnName="姓名"
					placeHolder="請輸入姓名，例：王小明"
				/>
				<InputColumn
					columnName="E-mail（電子郵件）"
					placeHolder="請輸入E-mail，例：example@gmail.com"
				/>
				<InputColumn columnName="密碼" placeHolder="請輸入密碼" />
				<InputColumn
					columnName="手機號碼"
					placeHolder="請輸入手機號碼，例：0912345678"
				/>
				<InputColumn
					columnName="聯絡地址"
					placeHolder="請輸入聯絡地址，例：高雄市楠梓區高雄大學路700號"
				/>
				<InputColumn
					columnName="身分證字號（帳號）"
					placeHolder="請輸入身分證字號，例：A123456789"
				/>
				{selectedRole === "judge" && (
					<InputColumn
						columnName="頭銜"
						placeHolder="請輸入您的頭銜，例：國立高雄大學校長"
					/>
				)}
				{selectedRole === "teacher" && (
					<InputColumn
						columnName="最高學歷"
						placeHolder="例：國立高雄大學電機工程學系博士"
					/>
				)}
				{selectedRole === "student" && (
					<>
						<InputColumn
							columnName={"系所"}
							placeHolder="請輸入系所，例：國立高雄大學資訊工程學系"
						/>
						<div>
							<label className="">年級</label><br/>
							<select name="grade" id="" className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1">
								<option value="" disabled selected>請選擇年級</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
							</select>
						</div>
						<InputColumn
							columnName={"學號"}
							placeHolder="請輸入學號，例：A1115500"
						/>
					</>
				)}
			</form>
		);
	};

	return (
		<>
			<div className="bg-[#023047] min-h-screen w-screen m-0 flex flex-col items-center justify-center inset-0 overflow-y-auto pb-4 pt-10">
				{!selectedRole ? (
					<>
						<div className="relative bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30 rounded-3xl p-10 md:p-12 max-w-4xl w-full text-center">
							<h2 className="text-2xl font-bold mb-10 text-black">
								選擇您的身分類別
							</h2>
							<div className="flex flex-col items-center pb-12 px-4">
								<div className="flex flex-wrap justify-center gap-10 w-full">
									<Card
										onClick={() =>
											handleRoleSelect("student")
										}
										img="/student.png"
										label="學生"
									/>
									<Card
										onClick={() =>
											handleRoleSelect("teacher")
										}
										img="/teacher.jpg"
										label="指導老師"
									/>
									<Card
										onClick={() =>
											handleRoleSelect("judge")
										}
										img="/judge.png"
										label="評審"
									/>
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="bg-white text-black rounded-lg p-12 w-120 shadow-lg">
							<h2 className="text-2xl font-bold mb-4 text-black text-center">
								{selectedRole === "student"
									? "學生註冊"
									: selectedRole === "teacher"
									? "指導老師註冊"
									: "評審註冊"}
							</h2>

							{renderForm()}
							<button
								className="mt-6 text-sm text-white hover:underline"
								onClick={() => setSelectedRole(null)}
							>
								← 返回身分選擇
							</button>
							<button
								className="!bg-green-500 mt-6 text-sm text-white hover:underline float-right px-6 py-2 rounded-md hover:!bg-green-600"
								onClick={() => setSelectedRole(null)}
							>
								確認註冊
							</button>
						</div>
					</>
				)}
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

function InputColumn({ columnName, placeHolder }) {
	return (
		<div>
			<label className="">{columnName}</label>
			<input
				type="text"
				placeholder={placeHolder}
				className="w-full px-3 py-2 border border-gray-300 rounded mb-4 mt-1"
			/>
		</div>
	);
}

export default RegisterPage;
