# app/getdata/projects.py

from flask import Blueprint, jsonify, request, current_app

projects_bp = Blueprint('projects_bp', __name__)

@projects_bp.route('/projects', methods=['GET', 'OPTIONS'])
def get_projects():
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    try:
        sb = current_app.supabase

        # 1. 從 piece 表撈出所有作品資料
        resp = (
            sb
            .from_('piece')
            .select('pid, tid, name, demo, poster, code, document')
            .order('pid', desc=False)  # 如果需要排序的話
            .execute()
        )

        # Supabase Python SDK 回傳的物件可能沒有 .error 屬性，直接取 data
        rows = resp.data or []

        # 2. 轉成前端要的格式
        projects = []
        for r in rows:
            links = []
            # demo
            if r.get('demo'):
                links.append({'label': '展示連結', 'url': r['demo']})
            # poster
            if r.get('poster'):
                links.append({'label': '海報連結', 'url': r['poster']})
            # code
            if r.get('code'):
                links.append({'label': '程式碼連結', 'url': r['code']})
            # document
            if r.get('document'):
                links.append({'label': '文件連結', 'url': r['document']})

            projects.append({
                'title': r.get('name'),
                'team':  r.get('tid'),
                'links': links
            })

        return jsonify(projects), 200

    except Exception as e:
        current_app.logger.error(f"GET /projects 失敗：{e}")

        # 發生錯誤時回傳預設靜態資料
        static_projects = [
            {
                "title": "這是預設作品 A",
                "team": "A",
                "links": [
                    {"label": "展示連結", "url": "#"}
                ]
            },
            {
                "title": "這是預設作品 B",
                "team": "B",
                "links": [
                    {"label": "展示連結", "url": "#"}
                ]
            }
        ]
        return jsonify(static_projects), 200
