from flask import Blueprint, jsonify, request, current_app
import json
from datetime import datetime

auth_api = Blueprint('auth_api', __name__)

# 模擬持久化存儲（可以替換為真正的資料庫 table）
TOKENS_FILE = "valid_tokens.json"

def load_tokens():
    try:
        with open(TOKENS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_tokens(tokens):
    with open(TOKENS_FILE, "w", encoding="utf-8") as f:
        json.dump(tokens, f, ensure_ascii=False, indent=2)

valid_tokens = load_tokens()

@auth_api.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # CORS 預檢
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    ID_num  = data.get("idNumber") or data.get("ID_num")
    password = data.get("password")

    if not ID_num or not password:
        return jsonify({"message": "學號或密碼缺失", "error": True}), 400

    try:
        supabase = current_app.supabase
        # 假設你的 users table 名為 "user"，欄位 ID_num、password
        resp = (
            supabase
            .from_("user")
            .select("u_id, ID_num, name, phone, email, password, address, is_admin, admin_type, is_rater, rater_title, is_student, is_teacher")
            .eq("ID_num", ID_num)
            .eq("password", password)
            .execute()
        )
        if resp.error:
            raise Exception(resp.error.message)

        users = resp.data  # list of matching users
    except Exception as e:
        current_app.logger.error(f"Supabase 查詢失敗: {e}")
        return jsonify({"message": "伺服器錯誤", "error": True}), 500

    if not users:
        return jsonify({"message": "學號或密碼錯誤", "error": True}), 401

    account = users[0]
    # 判斷角色
    code = account.get("is_admin", 0)
    role = ""
    if code == 1: role = "student"
    elif code == 2: role = "teacher"
    elif code == 3: role = "rater"
    elif code == 99: role = "admin"

    # 生成令牌並儲存
    token = f"token-{ID_num}-{role}-{int(datetime.utcnow().timestamp())}"
    valid_tokens[token] = {
        "ID_num": ID_num,
        "role": role,
        "u_id": account.get("u_id")
    }
    save_tokens(valid_tokens)

    return jsonify({
        "message": "登入成功",
        "data": {
            "name": account.get("name"),
            "role": role,
            "token": token,
            "u_id": account.get("u_id")
        }
    }), 200

@auth_api.route('/protected', methods=['GET', 'OPTIONS'])
def protected_route():
    if request.method == "OPTIONS":
        return "", 200

    token_header = request.headers.get("Authorization", "")
    if not token_header.startswith("Bearer "):
        return jsonify({"message": "未提供令牌", "error": True}), 401

    token = token_header.split(" ", 1)[1]
    valid_tokens.update(load_tokens())
    if token not in valid_tokens:
        return jsonify({"message": "令牌無效", "error": True}), 403

    return jsonify({"message": "授權成功", "data": valid_tokens[token]}), 200
