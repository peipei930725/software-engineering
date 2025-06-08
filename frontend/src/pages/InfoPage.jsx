import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";

function InfoPage() {
	return (
		<>
			<Navbar />
			<div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
				<header className="text-center mt-12">
					<h1 className="text-3xl md:text-4xl font-semibold">
						最新消息
					</h1>
				</header>
				{/* 公告區塊 */}
				<section className="mt-8 mx-auto w-11/12 h-7/12 md:w-4/5 bg-gray-300 text-black text-center text-4xl font-bold rounded-lg ">
					<Announcement />
				</section>
				<div className="pt-10 flex justify-center space-x-8">
					<button
						className="text-white"
						onClick={() => window.history.back()}
					>
						← 回到上一頁
					</button>
					<Link to="/home">
						<button className="text-white">回到首頁</button>
					</Link>
				</div>
			</div>
		</>
	);
}

export default InfoPage;
