import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProjectGallery() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/projects", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("無法取得作品資料");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(`後端連線失敗，顯示預設資料。${err}`);
        // 可選：設定一組靜態資料作為 fallback
        setProjects([
          {
            title: "這是預設作品 A",
            team: "A",
            links: [{ label: "展示連結", url: "#" }],
          },
          {
            title: "這是預設作品 B",
            team: "B",
            links: [{ label: "展示連結", url: "#" }],
          },
        ]);
        setLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen">
        <header className="text-center mt-12">
          <h1 className="text-3xl md:text-4xl font-semibold">
            歷屆學生作品展示
          </h1>
        </header>

        <section className="mt-24 mx-auto w-11/12 md:w-4/5">
          <div className="flex justify-center mb-8">
            <input
              type="text"
              placeholder="搜尋作品名稱"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 w-72 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-white bg-transparent placeholder-gray-300"
            />
          </div>

          {error && (
            <div className="text-center text-yellow-300 mb-8">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
                  >
                    <Skeleton height={24} width={`60%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
                    <Skeleton height={20} width={`40%`} className="mt-2" baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
                    <div className="mt-4 space-y-2">
                      <Skeleton height={16} width={`80%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
                      <Skeleton height={16} width={`70%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
                      <Skeleton height={16} width={`60%`} baseColor="#d9e3ec" highlightColor="#f0f4f8"/>
                    </div>
                  </div>
                ))
              : filteredProjects.map((project, idx) => (
                  <div
                    className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
                    key={idx}
                  >
                    <h3 className="text-xl font-semibold text-[#007BFF] mb-2">
                      {project.title}
                    </h3>
                    <p className="mb-2 text-gray-700">
                      隊伍編號：{project.team}
                    </p>
                    <div className="flex flex-col space-y-1">
                      {project.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#007BFF] hover:underline"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </>
  );
}
