# app/judge/pieces.py

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

judge_piece_bp = Blueprint("judge_piece_bp", __name__, url_prefix="/api/judge")

@judge_piece_bp.route("/pieces", methods=["GET"])
def get_all_pieces_for_judge():
    sb = current_app.supabase
    current_year = datetime.now().year

    try:
        resp = (
            sb
            .from_("piece")
            .select("*")
            .eq("year", current_year)
            .order("pid")
            .execute()
        )
        return jsonify({"success": True, "pieces": resp.data})
    except Exception as e:
        current_app.logger.error(f"[JUDGE] 查詢作品失敗：{e}")
        return jsonify({"success": False, "message": "伺服器錯誤"}), 500
