import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import Navbar from "../components/Navbar.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// 常量配置
const API_BASE_URL = "http://localhost:5000/api";
const REDIRECT_DELAY = 1200;
const GRADE_OPTIONS = [1, 2, 3, 4];

const STATIC_PROFILE = {
	name: "王小明",
	email: "test@example.com",
	phonenumber: "0912345678",
	address: "高雄市楠梓區高雄大學路700號",
	department: "資訊工程學系",
	grade: "3",
	sid: "A1115500",
	degree: "國立高雄大學電機工程學系博士",
	title: "國立高雄大學校長",
	identity: "guest",
};

// 輸入字段組件
const InputField = ({
	label,
	name,
	value,
	onChange,
	type = "text",
	required = true,
	isLoading = false,
}) => (
	<div>
		{isLoading ? (
			<Skeleton
				height={20}
				width={80}
				baseColor="#d9e3ec"
				highlightColor="#f0f4f8"
			/>
		) : (
			<label className="block mb-1 font-medium">{label}</label>
		)}

		{isLoading ? (
			<Skeleton
				height={35}
				baseColor="#d9e3ec"
				highlightColor="#f0f4f8"
			/>
		) : (
			<input
				type={type}
				name={name}
				value={value || ""}
				onChange={onChange}
				className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				required={required}
			/>
		)}
	</div>
);

// 選擇字段組件
const SelectField = ({
	label,
	name,
	value,
	onChange,
	options,
	placeholder,
	required = true,
}) => (
	<div>
		<label className="block mb-1 font-medium">{label}</label>
		<select
			name={name}
			value={value || ""}
			onChange={onChange}
			className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			required={required}
		>
			<option value="" disabled>
				{placeholder}
			</option>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	</div>
);

// 消息顯示組件
const Message = ({ message, type = "info" }) => {
	const colorClasses = {
		success: "text-green-600",
		error: "text-red-500",
		info: "text-blue-600",
	};

	return (
		<div className={`text-center font-semibold ${colorClasses[type]}`}>
			{message}
		</div>
	);
};

// 身份相關字段組件
const IdentitySpecificFields = ({ identity, form, handleChange }) => {
	switch (identity) {
		case "student":
			return (
				<>
					<InputField
						label="系所"
						name="department"
						value={form.department}
						onChange={handleChange}
					/>
					<SelectField
						label="年級"
						name="grade"
						value={form.grade}
						onChange={handleChange}
						options={GRADE_OPTIONS}
						placeholder="請選擇年級"
					/>
					<InputField
						label="學號"
						name="sid"
						value={form.sid}
						onChange={handleChange}
					/>
				</>
			);
		case "teacher":
			return (
				<InputField
					label="學歷"
					name="degree"
					value={form.degree}
					onChange={handleChange}
				/>
			);
		case "judge":
			return (
				<InputField
					label="頭銜"
					name="title"
					value={form.title}
					onChange={handleChange}
				/>
			);
		default:
			return null;
	}
};

// 主組件
export default function EditProfilePage() {
	const { userInfo, isLoadingUser } = useUser();
	const navigate = useNavigate();

	// 狀態管理
	const [profile, setProfile] = useState(null);
	const [form, setForm] = useState({});
	const [passwords, setPasswords] = useState({
		current: "",
		new: "",
	});
	const [feedback, setFeedback] = useState({
		message: "",
		type: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);

	// 清除反饋消息
	const clearFeedback = useCallback(() => {
		setFeedback({ message: "", type: "" });
	}, []);

	// 設置反饋消息
	const setFeedbackMessage = useCallback((message, type = "info") => {
		setFeedback({ message, type });
	}, []);

	// 檢查用戶認證
	useEffect(() => {
		if (isLoadingUser) return;

		if (!userInfo.isLoggedIn || !userInfo.ssn) {
			navigate("/login");
		}
	}, [userInfo, isLoadingUser, navigate]);

	// 載入用戶資料
	useEffect(() => {
		if (!userInfo.ssn) return;

		const loadProfile = async () => {
			setIsLoadingProfile(true);
			try {
				const response = await fetch(
					`${API_BASE_URL}/profile?ssn=${encodeURIComponent(
						userInfo.ssn
					)}`,
					{ credentials: "include" }
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				setProfile(data);
				setForm(data);
				setFeedbackMessage("", "");
			} catch (error) {
				console.error("Profile loading error:", error);
				setFeedbackMessage("後端連線失敗，顯示預設資料", "error");
				setProfile(STATIC_PROFILE);
				setForm(STATIC_PROFILE);
			} finally {
				setIsLoadingProfile(false);
			}
		};

		loadProfile();
	}, [userInfo.ssn, setFeedbackMessage]);

	// 處理表單字段變更
	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setForm((prevForm) => ({ ...prevForm, [name]: value }));
	}, []);

	// 處理密碼字段變更
	const handlePasswordChange = useCallback(
		(field) => (e) => {
			setPasswords((prevPasswords) => ({
				...prevPasswords,
				[field]: e.target.value,
			}));
		},
		[]
	);

	// 驗證表單
	const validateForm = () => {
		if (!passwords.current.trim()) {
			setFeedbackMessage("請輸入當前密碼才能修改資料！", "error");
			return false;
		}
		return true;
	};

	// 處理表單提交
	const handleSubmit = async (e) => {
		e.preventDefault();
		clearFeedback();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const requestBody = {
				...form,
				ssn: userInfo.ssn,
				current_password: passwords.current,
				...(passwords.new && { new_password: passwords.new }),
			};

			const response = await fetch(`${API_BASE_URL}/edit_profile`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(requestBody),
			});

			const data = await response.json();

			if (!response.ok) {
				setFeedbackMessage(data.message || "更新失敗", "error");
			} else {
				setFeedbackMessage(data.message || "更新成功", "success");
				setPasswords({ current: "", new: "" });

				// 延遲導航
				setTimeout(() => navigate("/home"), REDIRECT_DELAY);
			}
		} catch (error) {
			console.error("Submit error:", error);
			setFeedbackMessage("無法連接伺服器", "error");
		} finally {
			setIsLoading(false);
		}
	};

	// 載入錯誤時的顯示
	if (feedback.type === "error" && !profile) {
		return (
			<>
				<Navbar />
				<div className="bg-[#023047] text-white min-h-screen flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-xl font-bold mb-4">載入失敗</h2>
						<p>{feedback.message}</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							重新載入
						</button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0 flex items-center justify-center">
				<div className="bg-white text-black rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12 w-full max-w-4xl">
					<h2 className="text-2xl font-bold mb-6 text-center">
						修改個人資料
					</h2>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* 基本資料字段 */}
						<InputField
							label="姓名"
							name="name"
							value={form.name}
							onChange={handleChange}
							isLoading={isLoadingProfile}
						/>

						<InputField
							label="E-mail"
							name="email"
							value={form.email}
							onChange={handleChange}
							type="email"
							isLoading={isLoadingProfile}
						/>

						<InputField
							label="手機號碼"
							name="phonenumber"
							value={form.phonenumber}
							onChange={handleChange}
							type="tel"
							isLoading={isLoadingProfile}
						/>

						<InputField
							label="聯絡地址"
							name="address"
							value={form.address}
							onChange={handleChange}
							isLoading={isLoadingProfile}
						/>

						{/* 身份相關字段 */}
						{!isLoadingProfile && (
							<IdentitySpecificFields
								identity={form.identity}
								form={form}
								handleChange={handleChange}
							/>
						)}

						<hr className="my-6 border-gray-200" />

						{/* 密碼字段 */}
						<InputField
							label="當前密碼（必填）"
							name="current_password"
							value={passwords.current}
							onChange={handlePasswordChange("current")}
							type="password"
						/>

						<InputField
							label="新密碼（選填）"
							name="new_password"
							value={passwords.new}
							onChange={handlePasswordChange("new")}
							type="password"
							required={false}
						/>

						{/* 反饋消息 */}
						{feedback.message && (
							<Message
								message={feedback.message}
								type={feedback.type}
							/>
						)}

						{/* 提交按鈕 */}
						<button
							type="submit"
							disabled={isLoading || isLoadingProfile}
							className="w-full py-3 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isLoading ? "送出中..." : "確認修改"}
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
