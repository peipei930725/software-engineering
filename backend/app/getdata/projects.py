# app/getdata/projects.py

from flask import Blueprint, jsonify, request, current_app
from datetime import datetime

projects_bp = Blueprint('projects_bp', __name__)

@projects_bp.route('/projects', methods=['GET', 'OPTIONS'])
def get_projects():
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    try:
        sb = current_app.supabase
        current_year = datetime.now().year

        # 從 piece 表撈出所有非當前年份的作品，並帶出 year 欄位
        resp = (
            sb
            .from_('piece')
            .select('pid, tid, name, demo, poster, code, document, year')
            .neq('year', current_year)      # 排除當前年份
            .order('pid', desc=False)
            .execute()
        )
        rows = resp.data or []

        projects = []
        for r in rows:
            links = []
            if r.get('demo'):
                links.append({'label': '展示連結', 'url': r['demo']})
            if r.get('poster'):
                links.append({'label': '海報連結', 'url': r['poster']})
            if r.get('code'):
                links.append({'label': '程式碼連結', 'url': r['code']})
            if r.get('document'):
                links.append({'label': '文件連結', 'url': r['document']})

            projects.append({
                'title': r['name'],
                'team':  r['tid'],
                'year':  r['year'],
                'links': links
            })

        return jsonify(projects), 200

    except Exception as e:
        current_app.logger.error(f"GET /projects 失敗：{e}")

        # 發生錯誤時回傳預設靜態資料（也帶 year）
        static_projects = [
            {
                "title": "這是預設作品 A",
                "team": "A",
                "year": 2024,  # 範例：比當前年份還早
                "links": [
                    {"label": "展示連結", "url": "#"}
                ]
            },
            {
                "title": "這是預設作品 B",
                "team": "B",
                "year": 2023,
                "links": [
                    {"label": "展示連結", "url": "#"}
                ]
            }
        ]
        return jsonify(static_projects), 200
