# app/team/info.py

from flask import Blueprint, request, jsonify, current_app

team_info_bp = Blueprint('team_info_bp', __name__, url_prefix='/team')

@team_info_bp.route('/info', methods=['GET', 'OPTIONS'])
def team_info():
    print("GET /team/info: 處理隊伍資訊請求")
    # 處理 CORS 預檢
    if request.method == 'OPTIONS':
        return '', 200

    # 1. 從 query string 讀取 ssn
    ssn = request.args.get('ssn')
    if not ssn:
        print("GET /team/info: 缺少 ssn")
        return jsonify({'message': '缺少 ssn'}), 400

    sb = current_app.supabase

    try:
        # 2. 透過 student 表找 tid
        stu_resp = (
            sb
            .from_('student')
            .select('tid')
            .eq('ssn', ssn)
            .maybe_single()
            .execute()
        )
        if not getattr(stu_resp, 'data', None):
            print(f"GET /team/info: 找不到學生 {ssn} 的資料")
            return jsonify({'message': '找不到學生資料或未分配隊伍'}), 404
        tid = stu_resp.data['tid']

        # 3. 透過 team 表撈隊伍主檔
        team_resp = (
            sb
            .from_('team')
            .select('tid, name, teacher_ssn, year, rank')
            .eq('tid', tid)
            .maybe_single()
            .execute()
        )
        if not getattr(team_resp, 'data', None):
            print(f"GET /team/info: 找不到隊伍 {tid} 的資料")
            return jsonify({'message': '找不到隊伍資料'}), 404
        team = team_resp.data

        # 4. 取老師姓名（從 user 表）
        teacher_ssn = team.get('teacher_ssn')
        tea_resp = (
            sb
            .from_('user')
            .select('name')
            .eq('ssn', teacher_ssn)
            .maybe_single()
            .execute()
        )
        teacher_name = tea_resp.data.get('name') if getattr(tea_resp, 'data', None) else ''

        # 5. 取同一隊伍的所有學生
        studs_resp = (
            sb
            .from_('student')
            .select('ssn, sid, department, grade')
            .eq('tid', tid)
            .execute()
        )
        students = []
        for s in getattr(studs_resp, 'data', []) or []:
            # 5a. 取每位學生的姓名
            u_resp = (
                sb
                .from_('user')
                .select('name')
                .eq('ssn', s['ssn'])
                .maybe_single()
                .execute()
            )
            name = u_resp.data.get('name') if getattr(u_resp, 'data', None) else ''
            students.append({
                'ssn':        s.get('ssn'),         # <<== 加入這一行
                'name':       name,
                'sid':        s.get('sid'),
                'department': s.get('department'),
                'grade':      s.get('grade')
            })

        # 6. 組裝回傳格式
        payload = {
            'tid':          team.get('tid'),
            'team_name':    team.get('name'),
             'teacher_ssn':  teacher_ssn,  # <== 新增這一行
            'teacher_name': teacher_name,
            'year':         team.get('year'),
            'rank':         team.get('rank'),
            'students':     students
        }
        return jsonify(payload), 200

    except Exception as e:
        print(f"GET /team/info 失敗：{e}")
        return jsonify({'message': '伺服器錯誤'}), 500
