from flask import Blueprint, request, jsonify, current_app

allteams_bp = Blueprint('allteams_bp', __name__)

@allteams_bp.route('/table/teams', methods=['POST', 'OPTIONS'])
def get_allteams():
    if request.method == 'OPTIONS':
        return '', 200

    sb = current_app.supabase

    try:
        
        response = sb.table('piece_with_scores').select('*').execute()

        data = request.get_json() or {}


        return jsonify({'success': False, 'message': 'Hello World'}), 200

    except Exception as e:
        current_app.logger.error(f"獲取所有團隊失敗：{e}")
        return jsonify({'success': False, 'message': f'伺服器錯誤：{e}'}), 500
