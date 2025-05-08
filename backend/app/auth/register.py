from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from .. import mysql

register_bp = Blueprint('register', __name__)

@register_bp.route('/api/register', methods=['POST'])
def register():
    # 1. 取得前端傳入的 JSON 資料
    data = request.get_json() or {}
    first_name   = data.get('first_name', '').strip()
    last_name    = data.get('last_name', '').strip()
    user_id      = data.get('user_id', '').strip()
    username     = data.get('username', '').strip()
    email        = data.get('email', '').strip()
    school_name  = data.get('school_name', '').strip()
    password     = data.get('password', '')

    # 2. 基本欄位檢查
    if not all([first_name, last_name, user_id, username, email, school_name, password]):
        return jsonify({"error": "請完整填寫所有欄位（含密碼）"}), 400

    conn = mysql.connect()
    cursor = conn.cursor()
    try:
        # 3. 唯一性檢查：user_id / username / email
        chk_sql = """
        SELECT id 
        FROM users 
        WHERE user_id=%s OR username=%s OR email=%s
        """
        cursor.execute(chk_sql, (user_id, username, email))
        if cursor.fetchone():
            return jsonify({"error": "學號、使用者名稱或電子郵件已被使用"}), 409

        # 4. 密碼雜湊
        pwd_hash = generate_password_hash(password)

        # 5. 插入新使用者
        ins_sql = """
        INSERT INTO users 
            (first_name, last_name, user_id, username, email, school_name, password_hash)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(ins_sql, (
            first_name, last_name, user_id,
            username, email, school_name,
            pwd_hash
        ))
        conn.commit()

        return jsonify({"message": "註冊成功"}), 200

    except Exception as e:
        current_app.logger.error(f"註冊失敗：{e}")
        conn.rollback()
        return jsonify({"error": "伺服器內部錯誤"}), 500

    finally:
        cursor.close()
        conn.close()
