# app/getdata/piece.py
from flask import Blueprint, request, jsonify, current_app

piece_bp = Blueprint('get_piece_bp', __name__, url_prefix='/api/piece')

@piece_bp.route('/<int:tid>', methods=['GET'])
def get_piece_by_tid(tid):
    """
    GET /api/piece/<tid>
    根據 tid 查單一作品
    """
    sb = current_app.supabase

    try:
        resp = (
            sb
            .from_('piece')
            .select('pid, tid, name, demo, poster, code, document, year')
            .eq('tid', tid)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        print(f"查 piece 例外 (tid={tid})：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 1) 確認 resp 本身不是 None
    if resp is None:
        print(f"查 piece 返回 None (tid={tid})")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 2) 如果 resp.data 是 None，表示沒找到
    if resp.data is None:
        return jsonify({'success': False, 'message': '找不到該作品'}), 404

    # 3) 回傳作品資料
    print(f"查 piece 成功 (tid={tid})，資料：{resp.data}")
    return jsonify({'success': True, 'data': resp.data}), 200
