# app/piece/score.py
from flask import Blueprint, request, jsonify, current_app

score_bp = Blueprint("score_bp", __name__, url_prefix="/api/judge")

@score_bp.route("/score", methods=["POST"])
def submit_score():
    sb = current_app.supabase
    data = request.get_json() or {}

    # 1) 取評審 ssn
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
        if not insert_resp or not insert_resp.data:
            raise RuntimeError("Insert failed")

        # 🌟 6) 插入成功 → 重新計算 rank
        try:
            # 呼叫 function 取得 avg scores
            avg_resp = (
                sb.rpc("get_team_avg_scores")
                  .execute()
            )
            avg_data = avg_resp.data or []

            # 排序（最高分第一名）
            sorted_teams = sorted(avg_data, key=lambda x: -x["avg_score"])

            # 更新 rank
            for rank, team in enumerate(sorted_teams, start=1):
                team_tid = team["tid"]
                sb.from_("team") \
                  .update({"rank": str(rank)}) \
                  .eq("tid", team_tid) \
                  .execute()

            print("Rank 更新成功")

        except Exception as e:
            print(f"更新 Rank 失敗：{e}")
            # 不影響評分流程，主流程還是成功

        return jsonify({"success": True, "message": "評分成功"}), 200

    except Exception as e:
        print(f"評分失敗：{e}")
        return jsonify({"success": False, "message": "伺服器錯誤"}), 500

