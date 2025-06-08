# app/getdata/piece_detail.py
from flask import Blueprint, request, jsonify, current_app

# 路由前綴不加 /submit，就跟 submit、projects 分開
detail_bp = Blueprint('piece_detail_bp', __name__, url_prefix='/api/piece')

@detail_bp.route('', methods=['GET'])
def get_piece_detail():
    # 1) 取 pid
    pid = request.args.get('pid', type=int)
    if not pid:
        return jsonify({'success': False, 'message': '缺少 pid'}), 400

    sb = current_app.supabase
    try:
        resp = (
            sb
            .from_('piece')
            .select('pid, tid, name, demo, poster, code, document, year')
            .eq('pid', pid)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        current_app.logger.error(f"查 piece 例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 2) 找不到
    if not resp.data:
        return jsonify({'success': False, 'message': '找不到該作品'}), 404

    # 3) 回傳單筆作品資料
    return jsonify(resp.data), 200
