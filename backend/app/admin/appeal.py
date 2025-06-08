# app/admin/appeal.py

from flask import Blueprint, jsonify, request, current_app

admin_appeal_bp = Blueprint('admin_appeal_bp', __name__, url_prefix='/api/admin')

@admin_appeal_bp.route('/appeals', methods=['GET', 'OPTIONS'])
def get_appeals():
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    try:
        sb = current_app.supabase
        # 從 appeal table 撈 aid, user_ssn, content
        resp = (
            sb
            .from_('appeal')
            .select('aid, user_ssn, content')
            .order('aid', desc=False)
            .execute()
        )
        # Supabase Python 客戶端回傳結果放在 .data
        appeals = resp.data or []

        # 直接把 list of dict 傳給前端
        return jsonify(appeals), 200

    except Exception as e:
        current_app.logger.error(f"GET /api/admin/appeals 失敗：{e}")
        return jsonify({'message': '伺服器錯誤，無法取得申訴資料'}), 500
