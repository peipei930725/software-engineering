# app/admin/edituser.py

from flask import Blueprint, request, jsonify, current_app

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

@admin_bp.route('/user', methods=['POST', 'OPTIONS'])
def edit_user():
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}

    # 必填檢查
    for f in ('ssn', 'name', 'email', 'phonenumber', 'address', 'role', 'password'):
        if not data.get(f):
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    ssn     = data['ssn']
    new_pwd = data.get('new-password')

    sb = current_app.supabase

    # 1) 更新 user 基本資料
    upd_user = {
        'name':        data['name'],
        'email':       data['email'],
        'phonenumber': data['phonenumber'],
        'address':     data['address'],
        'password':    data['password'],
    }

    try:
        resp = sb.from_('user').update(upd_user).eq('ssn', ssn).execute()
        if not resp.data:
            return jsonify({'success': False, 'message': '更新基本資料失敗'}), 500
    except Exception as e:
        current_app.logger.error(f"更新 user 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤（user）'}), 500

    # 2) 更新角色專屬欄位
    try:
        role = data['role']
        if role == 'student':
            for f in ('department','grade','sid'):
                if not data.get(f):
                    return jsonify({'success': False, 'message': f'{f} 為必填(學生)'}), 400
            stu_upd = {
                'department': data['department'],
                'grade':      int(data['grade']),
                'sid':        data['sid']
            }
            r = sb.from_('student').update(stu_upd).eq('ssn', ssn).execute()
            if not r.data:
                raise Exception('student table update failed')

        elif role == 'teacher':
            if not data.get('degree'):
                return jsonify({'success': False, 'message': 'degree 為必填(老師)'}), 400
            tea_upd = {'degree': data['degree']}
            r = sb.from_('teacher').update(tea_upd).eq('ssn', ssn).execute()
            if not r.data:
                raise Exception('teacher table update failed')

        elif role == 'judge':
            if not data.get('title'):
                return jsonify({'success': False, 'message': 'title 為必填(評審)'}), 400
            jdg_upd = {'title': data['title']}
            r = sb.from_('judge').update(jdg_upd).eq('ssn', ssn).execute()
            if not r.data:
                raise Exception('judge table update failed')

        # admin 或其他角色暫不含專屬欄位
    except Exception as e:
        current_app.logger.error(f"更新 {role} table 失敗：{e}")
        return jsonify({'success': False, 'message': f'伺服器錯誤（{role}）'}), 500
    
    # 回傳結果，包含最新的密碼（若使用者有更新密碼則為新密碼，否則仍回傳原密碼）
    return jsonify({
        'success':  True,
        'message':  '使用者資料更新成功',
        'password': new_pwd or resp.data[0].get('password')
    }), 200
