from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash


report_bp = Blueprint('report', __name__)

@report_bp.route('/report', methods=['POST'])
def report():
    print("收到申述請求")
    data = request.get_json() or {}
    if not data:
        return jsonify({"message": "No data provided"}), 400
    Id = data.get("id")
    content = data.get("content")
    if not Id or not content:
        return jsonify({"message": "請填寫完整"}), 400
    

    print(f"申述人: {Id}\n內容: {content}")
    return jsonify({"message": "成功提交"}),200