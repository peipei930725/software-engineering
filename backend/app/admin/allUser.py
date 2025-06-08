# app/admin/alluser.py

from flask import Blueprint, request, jsonify, current_app

alluser_bp = Blueprint('alluser_bp', __name__, url_prefix='/api/admin')

@alluser_bp.route('/allusers', methods=['POST', 'OPTIONS'])
def all_users():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    identity = data.get('identity')
    if identity not in ('student', 'teacher', 'judge', 'admin'):
        return jsonify({'success': False, 'message': '身份參數錯誤'}), 400

    sb = current_app.supabase
    user_fields = 'ssn, name, email, phonenumber, address'

    try:
        # 先從對應的角色表撈出所有 ssn 以及角色專屬欄位
        if identity == 'student':
            role_resp = sb.from_('student').select('ssn, department, grade, sid').execute()
        elif identity == 'teacher':
            role_resp = sb.from_('teacher').select('ssn, degree').execute()
        elif identity == 'judge':
            role_resp = sb.from_('judge').select('ssn, title').execute()
        else:  # admin
            role_resp = sb.from_('admin').select('ssn').execute()

        role_rows = role_resp.data or []
        ssns = [r['ssn'] for r in role_rows]
        if not ssns:
            return jsonify([]), 200

        # 再批次從 user 表撈基本欄位
        user_resp = sb.from_('user').select(user_fields).in_('ssn', ssns).execute()
        users = {u['ssn']: u for u in (user_resp.data or [])}

        # 合併
        combined = []
        for r in role_rows:
            u = users.get(r['ssn'], {})
            base = {
                'ssn':         r['ssn'],
                'name':        u.get('name'),
                'email':       u.get('email'),
                'phonenumber': u.get('phonenumber'),
                'address':     u.get('address'),
            }
            if identity == 'student':
                base.update({
                    'department': r.get('department'),
                    'grade':      r.get('grade'),
                    'sid':        r.get('sid'),
                })
            elif identity == 'teacher':
                base.update({'degree': r.get('degree')})
            elif identity == 'judge':
                base.update({'title': r.get('title')})
            # admin 沒額外欄位

            combined.append(base)

        return jsonify(combined), 200

    except Exception as e:
        current_app.logger.error(f"查 allusers 失敗：{e}")
        # 前端收到空陣列就會顯示「目前沒有資料」
        return jsonify([]), 200
