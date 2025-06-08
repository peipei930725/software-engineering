# app/piece/submit.py

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

piece_bp = Blueprint('piece_bp', __name__, url_prefix='/api/piece')

@piece_bp.route('/submit', methods=['POST', 'OPTIONS'])
def submit_piece():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    # 基本欄位檢查
    for f in ('name', 'demo', 'poster', 'code', 'document'):
        if not data.get(f):
            print(f"提交作品失敗：{f} 為必填")
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    sb = current_app.supabase

    # 1) 先從 student 表查出這位學生的 tid
    ssn = data.get('ssn')  # 前端需帶入 ssn 或從 token 解析
    if not ssn:
        print("提交作品失敗：缺少 ssn")
        return jsonify({'success': False, 'message': '缺少 ssn'}), 400

    try:
        stu_resp = (
            sb
            .from_('student')
            .select('tid')
            .eq('ssn', ssn)
            .maybe_single()
            .execute()
        )
        if not stu_resp.data:
            return jsonify({'success': False, 'message': '找不到學生隊伍'}), 404

        tid = stu_resp.data.get('tid')
        if tid is None:
            return jsonify({'success': False, 'message': '學生尚未加入任何隊伍'}), 400

    except Exception as e:
        current_app.logger.error(f"查 student 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤(查隊伍編號)'}), 500

    # 2) 組 payload 並插入 piece 表
    year = datetime.now().year
    payload = {
        'tid':      tid,
        'name':     data['name'],
        'demo':     data['demo'],
        'poster':   data['poster'],
        'code':     data['code'],
        'document': data['document'],
        'year':     year
    }

    try:
        ins_resp = sb.from_('piece').insert([payload]).execute()
        if not ins_resp.data:
            raise Exception('Insert piece 失敗')
    except Exception as e:
        current_app.logger.error(f"INSERT piece 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤(新增作品)'}), 500

    return jsonify({'success': True, 'message': '作品繳交成功'}), 201
