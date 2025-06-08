# app/team/edit.py

from flask import Blueprint, request, jsonify, current_app

edit_bp = Blueprint('team_edit', __name__, url_prefix='/api/team')

@edit_bp.route('/edit', methods=['POST', 'OPTIONS'])
def edit_team():
    if request.method == 'OPTIONS':
        return '', 200

    ssn = request.args.get('ssn')
    if not ssn:
        print("缺少 ssn")
        return jsonify({'success': False, 'message': '缺少 ssn'}), 400

    data = request.get_json() or {}
    print("收到的資料：", data)
    for f in ('tid', 'team_name', 'teacher_ssn', 'students'):
        if f not in data:
            print("缺少欄位：", f)
            return jsonify({'success': False, 'message': f'{f} 為必填'}), 400

    sb = current_app.supabase
    tid           = data['tid']
    new_name      = data['team_name'].strip()
    teacher_ssn   = data['teacher_ssn']
    students      = data['students']

    # 1) 驗證 teacher_ssn 存在
    try:
        # 不使用 maybe_single()，直接撈 list，然後檢查長度
        resp = (
            sb
            .from_('teacher')
            .select('ssn')
            .eq('ssn', teacher_ssn)
            .limit(1)
            .execute()
        )
        rows = getattr(resp, 'data', None)
        if not rows:
            # 找不到這個老師
            return jsonify({'success': False, 'message': '資料有錯或者不存在'}), 400
    except Exception as e:
        print(f"查 teacher 例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 2) 驗證 students 中所有 ssn 都存在，並且沒有在其他隊伍
    for stu in students:
        stu_ssn = stu.get('ssn')
        print(f"正在處理學生 ssn: {stu_ssn}")
        if not stu_ssn:
            print("學生資料有誤，缺少 ssn")
            return jsonify({'success': False, 'message': '資料有錯或者不存在'}), 400
        try:
            resp = sb.from_('student') \
                     .select('ssn, tid') \
                     .eq('ssn', stu_ssn) \
                     .maybe_single() \
                     .execute()
            if not resp.data:
                print("學生不存在或資料有誤")
                return jsonify({'success': False, 'message': '資料有錯或者不存在'}), 400

            existing_tid = resp.data.get('tid')
            # 如果已經有隊伍，且不是本隊，就拒絕
            if existing_tid is not None and existing_tid != tid:
                print()
                return jsonify({'success': False, 'message': '該人已有隊伍'}), 400

        except Exception as e:
            print(f"查 student {stu_ssn} 例外：{e}")
            return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 3) 檢查隊伍名稱衝突
    try:
        cur = sb.from_('team').select('name').eq('tid', tid).maybe_single().execute()
        old_name = cur.data.get('name') if cur.data else ''
        if new_name != old_name:
            dup = sb.from_('team') \
                    .select('tid') \
                    .eq('name', new_name) \
                    .neq('tid', tid) \
                    .limit(1) \
                    .execute()
            if dup.data:
                print("已有隊伍名稱")
                return jsonify({'success': False, 'message': '已有隊伍名稱'}), 400
    except Exception as e:
        print(f"檢查隊伍名稱例外：{e}")
        print()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 4) 清空原本所有舊成員的 tid
    try:
        sb.from_('student').update({'tid': None}).eq('tid', tid).execute()
    except Exception as e:
        print(f"清空學生 tid 例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    # 5) 將新列表的學生設定到本隊
    for stu in students:
        try:
            sb.from_('student').update({'tid': tid}).eq('ssn', stu['ssn']).execute()
        except Exception as e:
            print(f"更新學生 {stu['ssn']} 例外：{e}")
            print("將學生加入隊伍失敗")
            return jsonify({'success': False, 'message': f'將學生 {stu["ssn"]} 加入隊伍時失敗'}), 500

    # 6) 更新 team 資料
    try:
        sb.from_('team').update({
            'name':         new_name,
            'teacher_ssn':  teacher_ssn
        }).eq('tid', tid).execute()
    except Exception as e:
        print(f"更新 team 例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True, 'message': '隊伍資訊更新成功'}), 200
