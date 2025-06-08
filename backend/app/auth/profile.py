# app/auth/profile.py

from flask import Blueprint, request, jsonify, current_app

profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    ssn = request.args.get('ssn')
    if not ssn:
        return jsonify({'success': False, 'message': '缺少 ssn'}), 400

    sb = current_app.supabase

    # 1) 撈 user
    try:
        user_resp = (
            sb
            .from_('user')
            .select('name, email, phonenumber, address')
            .eq('ssn', ssn)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        current_app.logger.error(f"查 user 例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 找不到
    if user_resp.data is None:
        return jsonify({'success': False, 'message': '找不到該使用者'}), 404

    # 組基本資料
    profile = {
        'name':        user_resp.data['name'],
        'email':       user_resp.data['email'],
        'phonenumber': user_resp.data['phonenumber'],
        'address':     user_resp.data['address'],
    }
   
    # 2) 依序查角色表
    # 學生
    try:
        stu = sb.from_('student') \
                .select('department, grade, sid') \
                .eq('ssn', ssn) \
                .maybe_single() \
                .execute()
        if stu.data:
            profile.update({
                'department': stu.data['department'],
                'grade':      stu.data['grade'],
                'sid':        stu.data['sid'],
                'identity':   'student'
            })
            print(profile)
            return jsonify(profile), 200
    except Exception as e:
        current_app.logger.error(f"查 student 例外：{e}")

    # 老師
    try:
        tea = sb.from_('teacher') \
                .select('degree') \
                .eq('ssn', ssn) \
                .maybe_single() \
                .execute()
        if tea.data:
            profile.update({
                'degree':   tea.data['degree'],
                'identity': 'teacher'
            })
            print(profile)
            return jsonify(profile), 200
    except Exception as e:
        current_app.logger.error(f"查 teacher 例外：{e}")

    # 評審
    try:
        jdg = sb.from_('judge') \
                .select('title') \
                .eq('ssn', ssn) \
                .maybe_single() \
                .execute()
        if jdg.data:
            profile.update({
                'title':    jdg.data['title'],
                'identity': 'judge'
            })
            print(profile)
            return jsonify(profile), 200
    except Exception as e:
        current_app.logger.error(f"查 judge 例外：{e}")

    # 管理員
    try:
        adm = sb.from_('admin') \
                .select('ssn') \
                .eq('ssn', ssn) \
                .maybe_single() \
                .execute()
        if adm.data:
            profile['identity'] = 'admin'
            print(profile)
            return jsonify(profile), 200
    except Exception as e:
        current_app.logger.error(f"查 admin 例外：{e}")

    # 其他
    profile['identity'] = 'guest'
    print(profile)
    return jsonify(profile), 200


@profile_bp.route('/edit_profile', methods=['POST', 'OPTIONS'])
def edit_profile():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    # 必填檢查
    for f in ('name', 'email', 'phonenumber', 'address', 'current_password'):
        if not data.get(f):
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    ssn      = data.get('ssn') or data.get('idNumber')
    curr_pwd = data['current_password']
    new_pwd  = data.get('new_password')
    sb       = current_app.supabase

    # 1) 驗證 current_password
    try:
        pw_resp = (
            sb.from_('user')
              .select('password')
              .eq('ssn', ssn)
              .maybe_single()
              .execute()
        )
    except Exception as e:
        current_app.logger.error(f"驗證密碼例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    if pw_resp.data is None:
        return jsonify({'success': False, 'message': '使用者不存在'}), 404

    if pw_resp.data.get('password') != curr_pwd:
        return jsonify({'success': False, 'message': '當前密碼錯誤'}), 401

    # 2) 更新 user table
    upd_user = {
        'name':        data['name'],
        'email':       data['email'],
        'phonenumber': data['phonenumber'],
        'address':     data['address'],
    }
    if new_pwd:
        upd_user['password'] = new_pwd

    try:
        sb.from_('user').update(upd_user).eq('ssn', ssn).execute()
    except Exception as e:
        current_app.logger.error(f"更新 user 例外：{e}")
        return jsonify({'success': False, 'message': '更新基本資料失敗'}), 500

    # 3) 根據身份更新專屬 table
    identity = data.get('identity')
    try:
        if identity == 'student':
            stu_upd = {
                'department': data.get('department'),
                'grade':      int(data.get('grade', 0)),
                'sid':        data.get('sid')
            }
            sb.from_('student').update(stu_upd).eq('ssn', ssn).execute()

        elif identity == 'teacher':
            sb.from_('teacher').update({'degree': data.get('degree')}).eq('ssn', ssn).execute()

        elif identity == 'judge':
            sb.from_('judge').update({'title': data.get('title')}).eq('ssn', ssn).execute()
        # admin & guest 無專屬
    except Exception as e:
        current_app.logger.error(f"更新 {identity} 表例外：{e}")
        return jsonify({'success': False, 'message': '更新角色資料失敗'}), 500

    return jsonify({'success': True, 'message': '個人資料更新成功'}), 200
