# app/piece/edit.py
from flask import Blueprint, request, jsonify, current_app

edit_bp = Blueprint('edit_piece_bp', __name__, url_prefix='/api/edit_piece')

@edit_bp.route('/tid=<int:tid>', methods=['PATCH'])
def edit_piece(tid):
    sb = current_app.supabase

    # 1) 驗證 JSON Body 必填欄位
    data = request.get_json() or {}
    required = ['name', 'demo', 'poster', 'code', 'document']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({
            'success': False,
            'message': f'缺少欄位：{", ".join(missing)}'
        }), 400

    # 2) 執行更新
    try:
        resp = (
            sb
            .from_('piece')
            .update({
                'name':     data['name'],
                'demo':     data['demo'],
                'poster':   data['poster'],
                'code':     data['code'],
                'document': data['document']
            })
            .eq('tid', tid)
            .execute()
        )
    except Exception as e:
        print(f"更新作品例外（tid={tid}）：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 3) 判斷是否有更新到資料
    # Supabase-py 返回的 resp.data 是 list，若更新不到任何列則為空 list
    if not resp.data:
        return jsonify({'success': False, 'message': '找不到該作品或無欄位變更'}), 404

    # 4) 回傳成功
    return jsonify({'success': True, 'message': '作品已更新！'}), 200
