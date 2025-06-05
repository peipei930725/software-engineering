// src/App.jsx
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext.jsx";
import TestBack from "./TestBack.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import InfoPage from "./pages/InfoPage.jsx";

// App 主元件
export default function App() {
	return (
		<UserProvider>
			<Routes>
				<Route path="/" element={<Navigate to="/home" replace />} />
				<Route path="/testback" element={<TestBack />} />
				<Route path="/home" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/info" element={<InfoPage />} />

				{/* 其他路由(不存在的路由:顯示404 not found) */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</UserProvider>
	);
}
