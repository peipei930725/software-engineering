# app/judge/score_manage.py
from flask import Blueprint, request, jsonify, current_app

judge_bp = Blueprint('judge_bp', __name__, url_prefix='/api/judge')

def _get_ssn():
    # 優先從 cookie，再從 query string 拿 ssn
    ssn = request.cookies.get("ssn") or request.args.get("ssn")
    return ssn

@judge_bp.route('/submitted-scores', methods=['GET'])
def get_submitted_scores():
    """
    回傳目前登入評審所有已送出評分，
    並帶上對應作品名稱 (piece.name)。
    """
    sb = current_app.supabase
    ssn = _get_ssn()
    if not ssn:
        return jsonify({"success": False, "message": "缺少評審身分(ssn)"}), 401

    try:
        # 以 foreign key tid，join 取得 piece.name
        resp = (
            sb
            .from_('score')
            .select('id, score, comment, piece(name)')
            .eq('ssn', ssn)
            .execute()
        )
    except Exception as e:
        current_app.logger.error(f"取得已送出評分例外：{e}")
        return jsonify({"success": False, "message": "伺服器錯誤"}), 500

    if not resp or resp.data is None:
        return jsonify([]), 200

    # 把 piece.name 改成 pieceName，攤平到頂層
    out = []
    for row in resp.data:
        piece = row.pop('piece', {}) or {}
        row['pieceName'] = piece.get('name', '')
        out.append(row)

    return jsonify(out), 200


@judge_bp.route('/score/<int:id>', methods=['PUT'])
def edit_submitted_score(id):
    """
    PUT /api/judge/score/<id>
    更新指定 id 的評分與回饋，只能修改自己的評分
    """
    sb = current_app.supabase
    ssn = _get_ssn()
    if not ssn:
        return jsonify({"success": False, "message": "缺少評審身分(ssn)"}), 401

    data = request.get_json() or {}
    new_score   = data.get('score')
    new_comment = data.get('comment', '')

    # 驗證分數格式
    if new_score is None or not isinstance(new_score, (int, float)):
        return jsonify({"success": False, "message": "請提供有效的 score"}), 400

    try:
        # 1) 確認這筆評分屬於自己
        check = (
            sb.from_('score')
              .select('id')
              .eq('id', id)
              .eq('ssn', ssn)
              .maybe_single()
              .execute()
        )
        if not check.data:
            return jsonify({"success": False, "message": "找不到該評分或沒有權限"}), 404

        # 2) 執行更新
        upd = (
            sb.from_('score')
              .update({
                  'score':   new_score,
                  'comment': new_comment
              })
              .eq('id', id)
              .execute()
        )
    except Exception as e:
        current_app.logger.error(f"更新評分例外 (id={id})：{e}")
        return jsonify({"success": False, "message": "伺服器錯誤"}), 500

    # 判斷更新結果：data 為空 list => 沒更新到任何列
    if not upd.data:
        return jsonify({"success": False, "message": "無法更新，請稍後重試"}), 500

    return jsonify({"success": True, "message": "評分已更新！"}), 200
