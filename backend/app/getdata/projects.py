# app/getdata/projects.py

from flask import Blueprint, jsonify, request, current_app
import json

projects_bp = Blueprint('projects_bp', __name__)

@projects_bp.route('/projects', methods=['GET', 'OPTIONS'])
def get_projects():
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return ('', 200)

    try:
        # 使用 Supabase client 取資料
        supabase = current_app.supabase
        resp = (
            supabase
            .from_('projects')
            .select('title, team, links_json')
            .execute()
        )

        if resp.error:
            raise Exception(resp.error.message)

        projects = []
        for row in resp.data:
            # links_json 存的是 JSON 字串，先解析
            links = json.loads(row['links_json'])
            projects.append({
                'title': row['title'],
                'team':  row['team'],
                'links': links
            })

        return jsonify(projects), 200

    except Exception as e:
        current_app.logger.error(f"Projects API 查詢失敗：{e}")
        # 回傳預設靜態資料作為備援
        static_projects = [
            {
                "title": "第3隊",
                "team": "3",
                "links": [
                    {"label": "展示連結", "url": "https://..."},
                    {"label": "海報連結", "url": "https://..."},
                    {"label": "程式碼連結", "url": "https://..."},
                    {"label": "文件連結", "url": "https://..."}
                ]
            },
            {
                "title": "第2件作品",
                "team": "2",
                "links": [
                    {"label": "展示連結", "url": "https://..."},
                    {"label": "海報連結", "url": "https://..."},
                    {"label": "文件連結", "url": "https://..."}
                ]
            }
        ]
        return jsonify(static_projects), 200
