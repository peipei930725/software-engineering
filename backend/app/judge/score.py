from flask import Blueprint, request, jsonify, current_app

score_bp = Blueprint("score_bp", __name__, url_prefix="/api/judge")

@score_bp.route("/score", methods=["POST"])
def submit_score():
    sb = current_app.supabase
    data = request.get_json() or {}

    ssn = request.cookies.get("ssn") or request.args.get("ssn")
    if not ssn:
        return jsonify({"success": False, "message": "缺少評審身分"}), 401

    pid = data.get("pid")
    score = data.get("score")
    comment = data.get("comment", "")

    if pid is None or score is None:
        return jsonify({"success": False, "message": "缺少 pid 或 score"}), 400

    try:
        # 先用 pid 找 tid
        piece_resp = (
            sb.from_("piece")
            .select("tid")
            .eq("pid", pid)
            .maybe_single()
            .execute()
        )
        if not piece_resp.data:
            return jsonify({"success": False, "message": "查無此作品"}), 404

        tid = piece_resp.data["tid"]

        # 檢查是否已經評過該隊伍
        exists = (
            sb.from_("score")
            .select("*")
            .eq("tid", tid)
            .eq("ssn", ssn)
            .maybe_single()
            .execute()
        )
        if exists.data:
            return jsonify({"success": False, "message": "已評過該隊伍"}), 400

        # 寫入評分
        resp = (
            sb.from_("score")
            .insert([{
                "tid": tid,
                "ssn": ssn,
                "score": score,
                "comment": comment
            }])
            .execute()
        )

        if not resp.data:
            raise Exception("Insert failed")

        return jsonify({"success": True, "message": "評分成功"})
    
    except Exception as e:
        current_app.logger.error(f"評分失敗：{e}")
        return jsonify({"success": False, "message": "伺服器錯誤"}), 500
        print("Request JSON:", data)
        print("SSN:", ssn)
    
    

