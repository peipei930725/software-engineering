# app/piece/submit.py

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

piece_bp = Blueprint('piece_bp', __name__, url_prefix='/api/piece')

@piece_bp.route('/submit', methods=['POST', 'OPTIONS'])
def submit_piece():
    if request.method == 'OPTIONS':
        return '', 200

    # 1) 從 query 取得 ssn
    ssn = request.args.get('ssn')
    if not ssn:
        current_app.logger.info("提交作品失敗：缺少 ssn")
        return jsonify({'success': False, 'message': '缺少 ssn'}), 400

    # 2) 從 body 取得其他欄位
    data = request.get_json() or {}
    for f in ('name', 'demo', 'poster', 'code', 'document'):
        if not data.get(f):
            current_app.logger.info(f"提交作品失敗：{f} 為必填")
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    sb = current_app.supabase

    # 3) 查 student 表拿 tid
    try:
        stu_resp = (
            sb
            .from_('student')
            .select('tid')
            .eq('ssn', ssn)
            .maybe_single()
            .execute()
        )
        if stu_resp.data is None:
            return jsonify({'success': False, 'message': '找不到該學生'}), 404

        tid = stu_resp.data.get('tid')
        if tid is None:
            return jsonify({'success': False, 'message': '學生尚未加入任何隊伍'}), 400

    except Exception as e:
        current_app.logger.error(f"查 student 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤(查隊伍編號)'}), 500

    # 4) 檢查該隊伍 (或該學生) 是否已經上傳過作品
    try:
        existing = (
            sb
            .from_('piece')
            .select('pid')
            .eq('tid', tid)
            .limit(1)
            .execute()
        )
        if existing.data:
            print("已有上傳作品")
            return jsonify({'success': False, 'message': '已有上傳作品'}), 400
        
    except Exception as e:
        current_app.logger.error(f"檢查既有作品失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤(檢查既有作品)'}), 500
    try:
        dup = (
            sb
            .from_('piece')
            .select('pid')
            .eq('name', data['name'])
            .limit(1)
            .execute()
        )
        if dup.data:
            return jsonify({'success': False, 'message': '作品名稱已被使用'}), 400
    except Exception as e:
        current_app.logger.error(f"檢查作品名稱重複失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤(檢查名稱)'}), 500
    # 5) 查詢目前最大 pid，自行生成新 pid
    try:
        max_resp = (
            sb
            .from_('piece')
            .select('pid')
            .order('pid', desc=True)
            .limit(1)
            .maybe_single()
            .execute()
        )
        max_pid = max_resp.data.get('pid', 0) if max_resp.data else 0
        new_pid = max_pid + 1
    except Exception as e:
        current_app.logger.error(f"查最大 pid 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤(計算 pid)'}), 500

    # 6) 插入 piece
    year = datetime.now().year
    payload = {
        'pid':      new_pid,
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

    return jsonify({
        'success': True,
        'message': '作品繳交成功',
        'pid': new_pid
    }), 201
