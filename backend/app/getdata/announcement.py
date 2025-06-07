# app/getdata/announcement.py

from flask import Blueprint, jsonify, request, current_app
from datetime import datetime

announcement_bp = Blueprint('announcement_bp', __name__)

@announcement_bp.route('/announcement', methods=['GET', 'OPTIONS'])
def get_announcements():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        sb = current_app.supabase
        resp = (
            sb
            .from_('announcement')
            .select('aid, ssn, title, content, "TIMESTAMP"')
            .order('"TIMESTAMP"', desc=True)
            .execute()
        )
        rows = resp.data or []

        result = []
        for r in rows:
            raw = r.get('TIMESTAMP')
            try:
                dt = datetime.fromisoformat(raw.rstrip('Z'))
                dtstr = dt.isoformat(sep='T')[:16]
            except:
                dtstr = raw or ''
            result.append({
                'aid':        r.get('aid'),
                'admin_ssn':  r.get('ssn'),
                'title':      r.get('title'),
                'context':    r.get('content'),
                'datetime':   dtstr
            })
        return jsonify(result), 200

    except Exception as e:
        current_app.logger.error(f"GET /announcement 失敗：{e}")
        return jsonify({'message': '伺服器錯誤'}), 500


@announcement_bp.route('/announcement', methods=['POST', 'OPTIONS'])
def create_announcement():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    for field in ('aid', 'admin_ssn', 'title', 'context', 'datetime'):
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} 為必填'}), 400

    try:
        sb = current_app.supabase

        # 1. 檢查 admin_ssn 必須存在於 admin table
        check_admin = (
            sb
            .from_('admin')
            .select('ssn')
            .eq('ssn', data['admin_ssn'])
            .execute()
        )
        if not check_admin.data:
            return jsonify({'success': False, 'message': '管理員 SSN 不存在'}), 400

        # 2. 檢查 aid 是否重複
        chk = (
            sb
            .from_('announcement')
            .select('aid')
            .eq('aid', int(data['aid']))
            .execute()
        )
        if chk.data:
            return jsonify({'success': False, 'message': '公告編號已存在'}), 409

        # 3. 組 payload，包含 TIMESTAMP 欄位
        payload = {
            'aid':       int(data['aid']),
            'ssn':       data['admin_ssn'],
            'title':     data['title'],
            'content':   data['context'],
            'TIMESTAMP': data['datetime']
        }
        ins = sb.from_('announcement').insert([payload]).execute()
        if not ins.data:
            raise Exception('Insert failed')

        return jsonify({'success': True, 'message': '公告新增成功'}), 201

    except Exception as e:
        current_app.logger.error(f"POST /announcement 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500


@announcement_bp.route('/announcement/<int:aid>', methods=['PATCH', 'OPTIONS'])
def update_announcement(aid):
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    updates = {}
    if 'title' in data:
        updates['title'] = data['title']
    if 'context' in data:
        updates['content'] = data['context']
    if 'datetime' in data:
        updates['TIMESTAMP'] = data['datetime']

    if not updates:
        return jsonify({'success': False, 'message': '沒有要更新的欄位'}), 400

    try:
        sb = current_app.supabase
        upd = (
            sb
            .from_('announcement')
            .update(updates)
            .eq('aid', aid)
            .execute()
        )
        if not upd.data:
            return jsonify({'success': False, 'message': '找不到該公告'}), 404

        return jsonify({'success': True, 'message': '公告修改成功'}), 200

    except Exception as e:
        current_app.logger.error(f"PATCH /announcement/{aid} 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500
