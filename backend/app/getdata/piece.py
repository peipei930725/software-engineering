# app/getdata/piece.py
from flask import Blueprint, request, jsonify, current_app

piece_bp = Blueprint('get_piece_bp', __name__, url_prefix='/api/piece')

@piece_bp.route('/<int:pid>', methods=['GET'])
def get_piece_by_pid(pid):
    """
    GET /api/piece/<pid>
    根據 pid 查單一作品
    """
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
        print(f"查 piece 例外 (pid={pid})：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 如果 resp.data 是 None，表示沒找到
    if resp.data is None:
        print(f"找不到 pid={pid} 的作品")
        return jsonify({'success': False, 'message': '找不到該作品'}), 404

    # 正常回傳
    print(f"成功查到 pid={resp.data} 的作品")
    return jsonify({'success': True, 'data': resp.data}), 200
