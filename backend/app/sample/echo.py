# echo.py
from flask import Blueprint, request, jsonify

echo_bp = Blueprint('echo', __name__)

@echo_bp.route('/api/echo', methods=['POST'])
def echo():
    # 從請求中解析 JSON
    data = request.get_json(force=True)
    # 原樣回傳
    return jsonify(data)

