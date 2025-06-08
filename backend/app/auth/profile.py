# app/auth/profile.py

from flask import Blueprint, request, jsonify, current_app

profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    """
    GET /api/profile?ssn=<ssn>
    回傳使用者基本資料 + 不同角色的專屬欄位
    """
    ssn = request.args.get('ssn')
    if not ssn:
        return jsonify({'success': False, 'message': '缺少 ssn'}), 400

    sb = current_app.supabase

    # 1) 撈基本 user 資料
    try:
        user_resp = (
            sb
            .from_('user')
            .select('name, email, phonenumber, address')
            .eq('ssn', ssn)
            .maybe_single()
            .execute()
        )
        # 若 error 不是找不到資料的 PGRST116，則視為伺服器錯誤
        if user_resp.error and user_resp.error.code != 'PGRST116':
            raise Exception(user_resp.error.message)
        # 無資料或 PGRST116 回傳 404
        if not user_resp.data:
            return jsonify({'success': False, 'message': '找不到該使用者'}), 404
        user = user_resp.data
    except Exception as e:
        current_app.logger.error(f"查 user 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    profile = {
        'name':        user.get('name'),
        'email':       user.get('email'),
        'phonenumber': user.get('phonenumber'),
        'address':     user.get('address'),
    }

    # 2) 判斷角色並撈角色專屬欄位
    try:
        role = None
        # 學生
        stu = sb.from_('student').select('department, grade, sid').eq('ssn', ssn).maybe_single().execute()
        if not (stu.error and stu.error.code != 'PGRST116') and stu.data:
            profile.update({
                'department': stu.data.get('department'),
                'grade':      stu.data.get('grade'),
                'sid':        stu.data.get('sid'),
                'identity':  'student'
            })
            role = 'student'
        else:
            # 老師
            tea = sb.from_('teacher').select('degree').eq('ssn', ssn).maybe_single().execute()
            if not (tea.error and tea.error.code != 'PGRST116') and tea.data:
                profile.update({
                    'degree':   tea.data.get('degree'),
                    'identity': 'teacher'
                })
                role = 'teacher'
            else:
                # 評審
                jdg = sb.from_('judge').select('title').eq('ssn', ssn).maybe_single().execute()
                if not (jdg.error and jdg.error.code != 'PGRST116') and jdg.data:
                    profile.update({
                        'title':    jdg.data.get('title'),
                        'identity': 'judge'
                    })
                    role = 'judge'
                else:
                    # 管理員
                    adm = sb.from_('admin').select('ssn').eq('ssn', ssn).maybe_single().execute()
                    if not (adm.error and adm.error.code != 'PGRST116') and adm.data:
                        profile.update({'identity': 'admin'})
                        role = 'admin'
        # 若無任何角色則標示 guest
        if not role:
            profile['identity'] = 'guest'

    except Exception as e:
        current_app.logger.error(f"查角色表失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify(profile), 200
