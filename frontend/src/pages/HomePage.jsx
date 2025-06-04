import Navbar from "../components/Navbar.jsx";
import Announcement from "../components/Announcement.jsx";

function HomePage() {
	return (
		<>
			<Navbar />
			<div className="bg-[#023047] text-white pt-32 h-screen w-screen m-0">
				{/* 主標題 */}
				<header className="text-center mt-12">
					<h1 className="text-3xl md:text-4xl font-semibold">
						2025 高雄大學創新創意競賽
					</h1>
				</header>

				{/* 公告區塊 */}
				<section className="mt-24 mx-auto w-11/12 h-7/12 md:w-4/5 bg-gray-300 text-black text-center text-4xl font-bold rounded-lg ">
					<Announcement />
				</section>
			</div>
		</>
	);
}

export default HomePage;
