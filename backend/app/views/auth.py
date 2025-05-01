from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)  # ← 建立 Blueprint

@auth_bp.route('/api/login', methods=['POST'])
def login():
    return jsonify({"message": "Login success"})
