# app/team/teacher.py
from flask import Blueprint, request, jsonify, current_app

teacher_bp = Blueprint('teacher_bp', __name__, url_prefix='/api/teacher')

def _get_teacher_ssn():
    return request.cookies.get('ssn') or request.args.get('teacher_ssn')

@teacher_bp.route('/teams', methods=['GET'])
def get_teams():
    sb = current_app.supabase
    teacher_ssn = _get_teacher_ssn()
    year = request.args.get('year', type=int)

    if not teacher_ssn:
        return jsonify({'success': False, 'message': '缺少教師身分(ssn)'}), 401
    if year is None:
        return jsonify({'success': False, 'message': '缺少 year 參數'}), 400

    try:
        # 1) 撈出該教師、該年度所有 team
        team_resp = (
            sb
            .from_('team')
            .select('tid, name, year')
            .eq('teacher_ssn', teacher_ssn)
            .eq('year', year)
            .execute()
        )
        teams = team_resp.data or []
        if not teams:
            return jsonify([]), 200

        # 2) 撈 student table: tid, ssn, sid, department, grade
        tids = [t['tid'] for t in teams]
        stu_resp = (
            sb
            .from_('student')
            .select('tid, ssn, sid, department, grade')
            .in_('tid', tids)
            .execute()
        )
        students = stu_resp.data or []

        # 3) 批次從 user table 撈出這些 ssn 的姓名
        ssns = list({s['ssn'] for s in students})
        user_resp = (
            sb
            .from_('user')
            .select('ssn, name')
            .in_('ssn', ssns)
            .execute()
        )
        users = user_resp.data or []
        name_map = {u['ssn']: u.get('name','') for u in users}

        # 4) 將學生分組到各自 tid，並附上姓名
        students_map = {}
        for s in students:
            students_map.setdefault(s['tid'], []).append({
                'name':       name_map.get(s['ssn'], ''),
                'sid':        s['sid'],
                'department': s['department'],
                'grade':      s['grade']
            })

        # 5) 取得所有隊伍排名(若需)
        rank_resp = sb.rpc('get_team_avg_scores').execute()
        rankings = rank_resp.data or []
        rank_map = { r.get('tid'): r.get('rank') for r in rankings }

        # 6) 組合最終回傳
        out = []
        for t in teams:
            out.append({
                'tid':      t['tid'],
                'name':     t['name'],
                'year':     t['year'],
                'rank':     rank_map.get(t['tid']),
                'students': students_map.get(t['tid'], [])
            })

        return jsonify(out), 200

    except Exception as e:
        current_app.logger.error(f"取得指導隊伍例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500
