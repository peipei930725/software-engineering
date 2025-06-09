# app/team/register.py

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

team_bp = Blueprint('team_bp', __name__)

@team_bp.route('/team/register', methods=['POST', 'OPTIONS'])
def register_team():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    # 驗證必填欄位
    for f in ('name', 'student1_id', 'student2_id', 'professor_id'):
        if not data.get(f):
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    sb = current_app.supabase
    prof_ssn = data['professor_id']

    # 1) 檢查指導老師是否存在
    try:
        chk = sb.from_('teacher').select('ssn').eq('ssn', prof_ssn).execute()
        if not chk.data:
            return jsonify({'success': False, 'message': '找不到該指導老師'}), 400
    except Exception as e:
        print(f"查 teacher 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 2) 收集所有學生 ssn
    student_ssns = [
        data.get(f'student{i}_id')
        for i in range(1, 7)
        if data.get(f'student{i}_id')
    ]

    # 3) 撈出這些學生目前的 tid（可能為 None）
    try:
        stu_resp = (
            sb.from_('student')
              .select('ssn, tid')
              .in_('ssn', student_ssns)
              .execute()
        )
        students = stu_resp.data or []
        # 4) 找出已有 tid 的 ssn
        taken = [s['ssn'] for s in students if s.get('tid') is not None]
        if taken:
            return jsonify({
                'success': False,
                'message': f'以下學生已在其他隊伍：{", ".join(taken)}'
            }), 400
    except Exception as e:
        print(f"檢查學生隊伍衝突失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 5) 建立新隊伍
    year = datetime.now().year
    team_payload = {
        'name':        data['name'],
        'teacher_ssn': prof_ssn,
        'year':        year,
        'rank':        None
    }
    try:
        ins = sb.from_('team').insert([team_payload]).execute()
        if not ins.data:
            raise Exception('新增隊伍失敗')
        new_tid = ins.data[0].get('tid')
        if new_tid is None:
            raise Exception('無法取得自動生成的 tid')
    except Exception as e:
        print(f"CREATE team 失敗：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤，無法建立隊伍'}), 500

    # 6) 更新每位學生的 tid
    for ssn in student_ssns:
        try:
            upd = sb.from_('student').update({'tid': new_tid}).eq('ssn', ssn).execute()
            if not upd.data:
                raise Exception(f'更新學生 {ssn} 失敗')
        except Exception as e:
            print(f"UPDATE student {ssn} 失敗：{e}")
            return jsonify({
                'success': False,
                'message': f'將學生 {ssn} 加入隊伍時失敗'
            }), 500

    return jsonify({'success': True, 'message': '隊伍註冊成功', 'tid': new_tid}), 201
