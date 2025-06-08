# app/team/register.py

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

team_bp = Blueprint('team_bp', __name__)

@team_bp.route('/team/register', methods=['POST', 'OPTIONS'])
def register_team():
    # CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    # 必填欄位驗證
    for f in ('name', 'student1_id', 'student2_id', 'professor_id'):
        if not data.get(f):
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    team_name     = data['name']
    professor_ssn = data['professor_id']
    # 學生陣列，過濾掉空字串
    student_ssns  = [
        data.get(f'student{i}_id')
        for i in range(1, 7)
        if data.get(f'student{i}_id')
    ]

    sb = current_app.supabase

    # 1. 檢查指導老師存在
    chk_teacher = sb.from_('teacher')\
        .select('ssn')\
        .eq('ssn', professor_ssn)\
        .execute()
    if not chk_teacher.data:
        return jsonify({'success': False, 'message': '找不到該指導老師'}), 400

    # 2. 建立新隊伍
    year = datetime.now().year
    payload = {
        'name':         team_name,
        'teacher_ssn':  professor_ssn,
        'year':         year
    }
    ins = sb.from_('team').insert([payload]).execute()
    if ins.error:
        current_app.logger.error(f"CREATE team 失敗：{ins.error.message}")
        return jsonify({'success': False, 'message': '伺服器錯誤，無法建立隊伍'}), 500

    # Supabase 回傳的資料包含新創建 row，取出 tid
    new_team = ins.data[0]
    tid = new_team.get('tid')
    if not tid:
        return jsonify({'success': False, 'message': '伺服器錯誤，無法取得隊伍編號'}), 500

    # 3. 將每位學生的 tid 欄位更新為新隊伍
    for ssn in student_ssns:
        upd = sb.from_('student')\
            .update({'tid': tid})\
            .eq('ssn', ssn)\
            .execute()
        if upd.error:
            current_app.logger.error(f"UPDATE student {ssn} 失敗：{upd.error.message}")
            # rollback not supported in Supabase; 回報但繼續
            return jsonify({'success': False, 'message': f'將學生 {ssn} 加入隊伍時失敗'}), 500

    return jsonify({'success': True, 'message': '隊伍註冊成功', 'tid': tid}), 201
