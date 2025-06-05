import { Link } from "react-router-dom";
function Navbar({ isLoggedIn, username }) {
	return (
		<nav className="fixed top-0 w-full z-50 bg-[#023047] text-white flex justify-between items-center px-8 py-4 shadow-md">
			{/* 左側: Logo + Menu */}
			<div className="flex items-center space-x-10">
				<Link to="/home">
					<div className="text-2xl font-semibold text-white">
						2025 ICCMS
					</div>
				</Link>
				<ul className="flex space-x-6 text-xl">
					<Link to="/info">
						<li className="hover:underline text-white">最新消息</li>
					</Link>
					<Link to="/teamreg">
						<li className="hover:underline text-white">報名參賽</li>
					</Link>
					<Link to="/projects">
						<li className="hover:underline text-white">歷屆作品</li>
					</Link>
				</ul>
			</div>

			{/* 右側: 登入或使用者 */}
			<div className="flex space-x-4 text-sm">
				{isLoggedIn ? (
					<>
						<span>{username}</span>
						<button className="hover:underline">登出</button>
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
