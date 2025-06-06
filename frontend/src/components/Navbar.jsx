import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

function getRoleDisplayName(role) {
	const roleNames = {
		student: "學生",
		admin: "管理員",
		judge: "評審",
		teacher: "老師",
	};
	return roleNames[role] || "role";
}

function Navbar() {
	const { userInfo, handleLogout } = useUser();
	const { isLoggedIn, username, role } = userInfo;

	const getMenuItems = () => {
		const commonItems = [{ to: "/info", label: "最新消息" }];

		const roleMenus = {
			student: [
				...commonItems,
				{ to: "/teamreg", label: "報名參賽" },
				{ to: "/projects", label: "歷屆作品" },
				{ to: "/appeal", label: "申訴系統" },
			],
			admin: [
				{ to: "", label: "申訴接收" },
				{ to: "/editann", label: "公告編輯" },
				{ to: "", label: "查詢資料" },
				{ to: "", label: "編輯成員" },
			],
			judge: [
				...commonItems,
				{ to: "/projects", label: "歷屆作品" },
				{ to: "", label: "評審作品" },
				{ to: "", label: "評分編輯" },
			],
			teacher: [
				...commonItems,
				{ to: "/projects", label: "歷屆作品" },
				{ to: "/appeal", label: "申訴系統" },
			],
		};

		if (isLoggedIn && role && roleMenus) {
			return roleMenus[role];
		}

		return [
			...commonItems,
			{ to: "/competition/info", label: "報名參賽" },
			{ to: "/projects", label: "歷屆作品" },
		];
	};

	const menuItems = getMenuItems();

	return (
		<nav className="fixed top-0 w-full z-50 bg-[#023047] text-white flex justify-between items-center px-8 py-4 shadow-md">
			{/* 左側: Logo + Menu */}
			<div className="flex items-center space-x-10">
				<Link to="/">
					<div className="text-2xl font-semibold text-white">
						2025 ICCMS
					</div>
				</Link>
				<ul className="flex space-x-6 text-xl">
					{menuItems.map((item, index) => (
						<>
							<Link key={index} to={item.to}>
								<li className="hover:underline text-white">
									{item.label}
								</li>
							</Link>
						</>
					))}
				</ul>
			</div>

			{/* 右側: 登入或使用者 */}
			<div className="flex space-x-4 text-sm">
				{isLoggedIn ? (
					<>
						{role === "student" && (
							<Link to="/subpiece" className="flex items-center">
								<p className="text-xl hover:underline cursor-pointer text-white flex items-center">
									我的隊伍
								</p>
							</Link>
						)}
						<span className="flex items-center space-x-2 text-base">
							<span>{username}</span>
							{role && <span>{getRoleDisplayName(role)}</span>}
						</span>
						<Link to="/editpro">
							<button className="text-white">修改資料</button>
						</Link>
						<button
							className="hover:underline"
							onClick={handleLogout}
						>
							登出
						</button>
					</>
				) : (
					<>
						<Link to="/login">
							<button className="text-white">登入</button>
						</Link>
						<Link to="/register">
							<button className="text-white">註冊</button>
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}

export default Navbar;
