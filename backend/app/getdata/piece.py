# app/getdata/piece.py
from flask import Blueprint, request, jsonify, current_app

piece_bp = Blueprint('get_piece_bp', __name__, url_prefix='/api/piece')

@piece_bp.route('/<int:tid>', methods=['GET'])
def get_piece_by_tid(tid):
    """
    GET /api/piece/<tid>
    根據 tid 查詢該隊伍的所有作品
    """
    sb = current_app.supabase

    try:
        resp = (
            sb
            .from_('piece')
            .select('pid, tid, name, demo, poster, code, document')
            .eq('tid', tid)
            .execute()  # 移除 maybe_single()，改用 execute()
        )
    except Exception as e:
        print(f"查 piece 例外 (tid={tid})：{e}")
        return jsonify({'success': False, 'message': '伺服器�誤'}), 500

    # 檢查回應
    if resp is None or resp.data is None:
        print(f"查 piece 返回 None (tid={tid})")
        return jsonify([]), 200  # 直接回傳空陣列

    # 直接回傳作品陣列，不包裝在 success/data 結構中
    print(f"查 piece 成功 (tid={tid})，資料：{resp.data}")
    return jsonify(resp.data), 200
