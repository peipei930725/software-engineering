import "tailwindcss";

function Announcement() {
	const announcements = [
		"📢 歡迎參加 2025 高雄大學創新創意競賽！",
		"📅 報名截止日期為 2025/08/15，請及早完成報名。",
		"🎓 競賽主題為『智慧永續．創新未來』，鼓勵跨領域合作。",
		"🏆 獲獎團隊將獲得高額獎金與實習機會！",
	];

	return (
		<div className="p-8 text-left space-y-4">
			{announcements.map((item, index) => (
				<div
					key={index}
					className="bg-white text-black p-4 rounded shadow-md text-lg font-normal"
				>
					{item}
				</div>
			))}
		</div>
	);
}

export default Announcement;
