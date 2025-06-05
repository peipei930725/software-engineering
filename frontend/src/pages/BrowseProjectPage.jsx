import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";

export default function ProjectGallery() {
  const [search, setSearch] = useState("");

  // 靜態作品資料
  const projects = [
    {
      title: "第3隊",
      team: "3",
      links: [
        { label: "展示連結", url: "https://www.nuk.edu.tw/p/412-1000-654.php?Lang=zh-tw" },
        { label: "海報連結", url: "https://www.nuk.edu.tw/p/412-1000-654.php?Lang=zh-tw" },
        { label: "程式碼連結", url: "https://www.nuk.edu.tw/p/412-1000-654.php?Lang=zh-tw" },
        { label: "文件連結", url: "https://www.nuk.edu.tw/p/412-1000-654.php?Lang=zh-tw" }
      ]
    },
    {
      title: "第2件作品",
      team: "2",
      links: [
        { label: "展示連結", url: "https://www.youtube.com/watch?v=IRiNKS8XDpI" },
        { label: "海報連結", url: "https://www.youtube.com/watch?v=IRiNKS8XDpI" },
        { label: "文件連結", url: "https://www.youtube.com/watch?v=IRiNKS8XDpI" }
      ]
    },
    {
      title: "這一件作品",
      team: "1",
      links: [
        { label: "展示連結", url: "https://www.youtube.com" },
        { label: "海報連結", url: "https://www.youtube.com" },
        { label: "文件連結", url: "https://www.youtube.com" }
      ]
    }
  ];

  // 過濾搜尋
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="bg-[#023047] text-white pt-32 min-h-screen w-screen m-0">
        {/* 主標題 */}
        <header className="text-center mt-12">
          <h1 className="text-3xl md:text-4xl font-semibold">
            歷屆學生作品展示
          </h1>
        </header>

        {/* 搜尋與作品列表 */}
        <section className="mt-24 mx-auto w-11/12 md:w-4/5">
          {/* 搜尋區塊 */}
          <div className="flex justify-center mb-8">
            <input
              type="text"
              placeholder="搜尋作品名稱"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 w-72 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-white"
            />
          </div>
          {/* 作品列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <div
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
                key={idx}
              >
                <h3 className="text-xl font-semibold text-[#007BFF] mb-2">
                  {project.title}
                </h3>
                <p className="mb-2 text-gray-700">隊伍編號：{project.team}</p>
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
