import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Announcement() {
	const [announcements, setAnnouncements] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchAnnouncements();
	}, []);

	const fetchAnnouncements = async () => {
		try {
			const response = await fetch(
				"http://localhost:5000/api/announcement",
				{
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch announcements");
			}
			const data = await response.json();
			setAnnouncements(data);
		} catch (err) {
			setError(`發生錯誤。 ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-8 text-left space-y-4">
			{error && (
				<div className="text-red-600 bg-white p-4 rounded shadow">
					{error}
				</div>
			)}

			{loading
				? [...Array(3)].map((_, idx) => (
						<div
							key={idx}
							className="bg-white p-4 rounded shadow-md text-black space-y-2"
						>
							<Skeleton height={24} width={`20%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
							<Skeleton count={3} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
							<div className="flex justify-between text-sm text-gray-500">
								<Skeleton width={`30%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
								<Skeleton width={`40%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
							</div>
						</div>
				  ))
				: announcements.map((item) => (
						<AnnouncementComponent
							key={item.aid}
							adminSSN={item.admin_name}
							aid={item.aid}
							context={item.context}
							datetime={item.datetime}
							title={item.title}
						/>
				  ))}
		</div>
	);
}

function AnnouncementComponent({ adminSSN, context, datetime, title }) {
	return (
		<div className="bg-white text-black p-4 rounded shadow-md text-lg font-normal">
			<h2 className="text-xl font-bold mb-1">{title}</h2>
			<p className="mb-1 whitespace-pre-line">{context}</p>
			<p className="text-gray-500 text-sm">發布者: {adminSSN}</p>
			<p className="text-gray-500 text-sm">
				發布時間: {new Date(datetime).toLocaleString()}
			</p>
		</div>
	);
}

export default Announcement;
