# app/piece/submit.py

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

piece_bp = Blueprint('piece_bp', __name__, url_prefix='/piece')

@piece_bp.route('/submit', methods=['POST', 'OPTIONS'])
def submit_piece():
    # CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    # 必填欄位檢查
    for field in ('tid', 'name', 'demo', 'poster', 'code', 'document'):
        if not data.get(field):
            print(f"POST /piece/submit: 缺少必填欄位 {field}")
            return jsonify({'success': False, 'msg': f'{field} 為必填'}), 400

    sb = current_app.supabase

    # 組 payload，year 自動填當前年份
    payload = {
        'tid':      int(data['tid']),
        'name':     data['name'],
        'demo':     data['demo'],
        'poster':   data['poster'],
        'code':     data['code'],
        'document': data['document'],
        'year':     datetime.now().year
    }

    try:
        resp = sb.from_('piece').insert([payload]).execute()
        # Supabase Python client 回傳的 .data 包含新插入的記錄
        if not getattr(resp, 'data', None):
            raise Exception('Insert failed or no data returned')
        return jsonify({'success': True, 'msg': '作品繳交成功'}), 201

    except Exception as e:
        current_app.logger.error(f"POST /piece/submit 失敗：{e}")
        return jsonify({'success': False, 'msg': '伺服器錯誤，無法繳交作品'}), 500
