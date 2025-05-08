# app/auth.py
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash
from .. import mysql

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    # 1. 解析 JSON
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')

    # 2. 欄位檢查：使用者名稱或密碼缺漏
    if not username or not password:
        return jsonify({"message": "請填入帳號或密碼"}), 400

    # 3. 從資料庫查詢密碼雜湊
    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "SELECT password_hash FROM users WHERE username = %s",
            (username,)
        )
        row = cur.fetchone()
    except Exception as e:
        current_app.logger.error(f"DB error: {e}")
        return jsonify({"message": "伺服器資料庫錯誤"}), 500
    finally:
        cur.close()

    # 4. 認證：查無使用者或密碼比對失敗 → 統一視為「帳號或密碼錯誤」
    if row is None or not check_password_hash(row['password_hash'], password):
        return jsonify({"message": "帳號或密碼錯誤"}), 401

    # 5. 認證成功
    return jsonify({"message": "登入成功"}), 200
