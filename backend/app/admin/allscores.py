from flask import Blueprint, request, jsonify, current_app

allscores_bp = Blueprint('allscores_bp', __name__)

@allscores_bp.route('/table/pieces', methods=['POST', 'OPTIONS'])
def get_allscores():
    if request.method == 'OPTIONS':
        return '', 200

    sb = current_app.supabase

    try:
        response = (
            sb
            .table('team_view')
            .select('judgename, title, name, score, year')
            .not_.is_('score', 'null')
            .order('name', desc=False)
            .execute()
        )

        return jsonify(response.data), 200

    except Exception as e:
        current_app.logger.error(f"獲取所有團隊失敗：{e}")
        return jsonify({'success': False, 'message': f'伺服器錯誤：{e}'}), 500
