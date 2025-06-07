// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext.jsx";
import TestBack from "./TestBack.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import BrowseProjectPage from "./pages/BrowseProjectPage.jsx";
import TeamRegisterPage from "./pages/TeamRegisterPage.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import AppealPage from "./pages/AppealPage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import SubmitPiecePage from "./pages/SubmitPiecePage.jsx";
import EditAnnouncementPage from "./pages/EditAnnouncementPage.jsx";
import UsersProfilePage from "./pages/admin/UsersProfilePage.jsx";
import AdminEditProfilePage from "./pages/admin/AdminEditProfilePage.jsx";
import EditPiecePage from "./pages/EditPiecePage.jsx";
import TeamInfoPage from "./pages/TeamInfoPage.jsx";
import GradePage from "./pages/judge/GradePage.jsx";
import EditGradePage from "./pages/judge/EditGradePage.jsx";

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
				<Route path="/projects" element={<BrowseProjectPage />} />
				<Route path="/teamreg" element={<TeamRegisterPage />} />
				<Route path="/info" element={<InfoPage />} />
				<Route path="/appeal" element={<AppealPage />} />
				<Route path="/editpro" element={<EditProfilePage />} />
				<Route path="/subpiece" element={<SubmitPiecePage />} />
				<Route path="/editann" element={<EditAnnouncementPage />} />
				<Route path="/admin/editprofile/:ssn" element={<AdminEditProfilePage />} />
				<Route path="/allusers" element={<UsersProfilePage/>}/>
				<Route path="/editpiece" element={<EditPiecePage/>}/>
				<Route path="/teaminfo" element={<TeamInfoPage/>}/>
				<Route path="/grade" element={<GradePage/>}/>
				<Route path="/editgrade" element={<EditGradePage/>}/>

				{/* 其他路由(不存在的路由:顯示404 not found) */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</UserProvider>
	);
}