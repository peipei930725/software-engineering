# app/report/report.py

from flask import Blueprint, request, jsonify, current_app

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/appeal', methods=['POST', 'OPTIONS'])
def report():
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    Id = data.get("id")
    content = data.get("content")

    # 必填檢查
    if not Id or not content:
        return jsonify({"message": "請填寫完整"}), 400

    sb = current_app.supabase

    # 插入申訴
    try:
        payload = {
            "user_ssn": Id,
            "content": content
            # aid 由資料庫自動產生
        }
        ins = sb.from_("appeal").insert([payload]).execute()
    except Exception as e:
        current_app.logger.error(f"POST /appeal 失敗：{e}")
        return jsonify({"message": "伺服器錯誤，無法提交申訴"}), 500

    # Supabase 若 insert 成功會回 data 列表
    if not ins.data:
        current_app.logger.error(f"POST /appeal 無回傳 data：{ins}")
        return jsonify({"message": "提交失敗"}), 500

    return jsonify({"message": "成功提交"}), 200
