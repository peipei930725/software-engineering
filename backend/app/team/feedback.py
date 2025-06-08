# app/team/feedback.py

from flask import Blueprint, request, jsonify, current_app

feedback_bp = Blueprint('team_feedback', __name__, url_prefix='/api/team')

@feedback_bp.route('/feedback', methods=['GET', 'OPTIONS'])
def get_feedback():
    if request.method == 'OPTIONS':
        return '', 200

    # 1) 取得並驗證 tid
    tid = request.args.get('tid')
    if not tid:
        return jsonify({'success': False, 'message': '缺少 tid'}), 400
    try:
        tid = int(tid)
    except ValueError:
        return jsonify({'success': False, 'message': 'tid 必須是整數'}), 400

    sb = current_app.supabase

    # 2) 從 score 表抓出所有該隊的評分
    try:
        score_resp = (
            sb
            .from_('score')       # 確認你的表名是 score
            .select('ssn, score, comment')
            .eq('tid', tid)
            .execute()
        )
        records = score_resp.data or []
    except Exception as e:
        current_app.logger.error(f"查 score 例外：{e}")
        return jsonify({'success': False, 'message': '伺服器錯誤（讀取評分）'}), 500

    feedbacks = []
    for r in records:
        jid     = r.get('ssn')
        score   = r.get('score')
        comment = r.get('comment')

        # 3a) 從 user 表取出評審的真實姓名
        try:
            u_resp = (
                sb
                .from_('user')
                .select('name')
                .eq('ssn', jid)
                .maybe_single()
                .execute()
            )
            judge_name = u_resp.data.get('name') if u_resp.data else jid
        except Exception as e:
            current_app.logger.error(f"查 user {jid} 例外：{e}")
            judge_name = jid

        # 3b) 從 judge 表取出評審的頭銜
        try:
            j_resp = (
                sb
                .from_('judge')
                .select('title')
                .eq('ssn', jid)
                .maybe_single()
                .execute()
            )
            judge_title = j_resp.data.get('title') if j_resp.data else ''
        except Exception as e:
            current_app.logger.error(f"查 judge {jid} 例外：{e}")
            judge_title = ''

        feedbacks.append({
            'jid':         jid,
            'judge_name':  judge_name,
            'judge_title': judge_title,
            'score':       score,
            'comment':     comment
        })

    return jsonify(feedbacks), 200
