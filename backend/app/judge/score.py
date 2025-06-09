# app/piece/score.py
from flask import Blueprint, request, jsonify, current_app

score_bp = Blueprint("score_bp", __name__, url_prefix="/api/judge")

@score_bp.route("/score", methods=["POST"])
def submit_score():
    sb = current_app.supabase
    data = request.get_json() or {}

    # 1) 取評審 ssn（優先從 Cookie，其次 query string）
    ssn = request.cookies.get("ssn") or request.args.get("ssn")
    if not ssn:
        print("缺少評審身分(ssn)")
        return jsonify({"success": False, "message": "缺少評審身分(ssn)"}), 401

    # 2) 必填檢查
    pid     = data.get("pid")
    score_v = data.get("score")
    comment = data.get("comment", "")
    if pid is None or score_v is None:
        print("缺少 pid 或 score")
        return jsonify({"success": False, "message": "缺少 pid 或 score"}), 400

    try:
        # 3) 查作品所屬 tid
        piece_resp = (
            sb.from_("piece")
              .select("tid")
              .eq("pid", pid)
              .maybe_single()
              .execute()
        )
        if piece_resp is None or piece_resp.data is None:
            print(f"查無 pid={pid} 的作品")
            return jsonify({"success": False, "message": f"查無 pid={pid} 的作品"}), 404
        tid = piece_resp.data["tid"]

        # 4) 檢查是否已評過該隊伍
        exists_resp = (
            sb.from_("score")
              .select("id")
              .eq("tid", tid)
              .eq("ssn", ssn)
              .maybe_single()
              .execute()
        )
        # maybe_single() 回傳 .data == None 代表查無
        if exists_resp and exists_resp.data is not None:
            print(f"評審 {ssn} 已評分過隊伍 {tid}")
            return jsonify({"success": False, "message": "已評過該隊伍"}), 400

        # 5) 插入評分
        insert_resp = (
            sb.from_("score")
              .insert({
                  "tid": tid,
                  "ssn": ssn,
                  "score": score_v,
                  "comment": comment
              })
              .execute()
        )
        # insert_resp.data 如果是 list 而且長度>0 表示成功
        if not insert_resp or not insert_resp.data:
            raise RuntimeError("Insert failed")

        return jsonify({"success": True, "message": "評分成功"}), 200

    except Exception as e:
        print(f"評分失敗：{e}")
        return jsonify({"success": False, "message": "伺服器錯誤"}), 500
