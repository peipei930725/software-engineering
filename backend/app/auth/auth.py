from flask import Blueprint, jsonify, request, current_app
from app import db             # 從 app/__init__.py 匯入已初始化的 SQLAlchemy 實例
import json

auth_api = Blueprint('auth_api', __name__)

# 模擬持久化存儲（可以替換為真正的資料庫 table）
TOKENS_FILE = "valid_tokens.json"

# 加載令牌
def load_tokens():
    try:
        with open(TOKENS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# 保存令牌
def save_tokens(tokens):
    with open(TOKENS_FILE, "w") as f:
        json.dump(tokens, f)

# 初始化令牌存儲
valid_tokens = load_tokens()

@auth_api.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # 處理預檢請求（CORS）
    if request.method == "OPTIONS":
        return ("", 200)

    data = request.get_json() or {}
    ID_num = data.get("idNumber") or data.get("ID_num")  # 前端傳 idNumber 或 ID_num 都嘗試讀取
    password = data.get("password")

    print("登入資料:", data)
    if not ID_num or not password:
        return jsonify({"message": "學號或密碼缺失", "error": True}), 400

    # 使用 raw SQL 查詢所有使用者
    try:
        # 假設你的資料庫中有一張叫做 "user" 的 table，且該 table 有以下欄位：
        # u_id, ID_num, name, phone, email, password, address, is_admin, admin_type, is_rater, rater_title, is_student, is_teacher
        sql = "SELECT u_id, ID_num, name, phone, email, password, address, is_admin, admin_type, is_rater, rater_title, is_student, is_teacher FROM \"user\""
        result_proxy = db.session.execute(sql)
        rows = result_proxy.fetchall()
        print("讀取到的資料筆數:", len(rows))
    except Exception as e:
        current_app.logger.error(f"資料庫查詢失敗: {str(e)}")
        return jsonify({"message": "伺服器錯誤", "error": True}), 500

    # 把每一列轉換成 dict
    columns = [
        "u_id", "ID_num", "name", "phone", "email", "password", "address",
        "is_admin", "admin_type", "is_rater", "rater_title", "is_student", "is_teacher"
    ]
    accounts = [dict(zip(columns, row)) for row in rows]
    print("轉換後的帳戶資料:", accounts)

    # 找出符合 ID_num & password 的帳戶
    account = next(
        (acc for acc in accounts if str(acc.get("ID_num")) == str(ID_num) and str(acc.get("password")) == str(password)),
        None
    )

    if account:
        print("匹配的帳戶:", account)
        role = role_type(account)
        print("角色:", role)

        # 生成新的 token
        token = f"token-{ID_num}-{role}"
        valid_tokens[token] = {"ID_num": ID_num, "role": role, "u_id": account["u_id"]}
        save_tokens(valid_tokens)
        print("存儲的令牌:", valid_tokens)

        return jsonify({
            "message": "登入成功",
            "data": {
                "name": account["name"],
                "role": role,
                "token": token,
                "u_id": account["u_id"]
            }
        }), 200

    print("找不到匹配的帳戶")
    return jsonify({"message": "學號或密碼錯誤", "error": True}), 401

@auth_api.route('/protected', methods=['GET', 'OPTIONS'])
def protected_route():
    # 處理預檢請求（CORS）
    if request.method == "OPTIONS":
        return ("", 200)

    token_header = request.headers.get("Authorization")
    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"message": "未提供令牌", "error": True}), 401

    token = token_header.split(" ")[1]
    valid_tokens.update(load_tokens())  # 每次驗證時加載最新令牌
    if token not in valid_tokens:
        return jsonify({"message": "令牌無效", "error": True}), 403

    return jsonify({"message": "授權成功", "data": valid_tokens[token]}), 200

def role_type(account: dict) -> str:
    """
    依照 account["is_admin"] 的值，判斷使用者角色
    is_admin 的欄位值：
      1 → student
      2 → teacher
      3 → rater
      99 → admin
    其他 → ""
    """
    code = account.get("is_admin", 0)
    if code == 1:
        return "student"
    elif code == 2:
        return "teacher"
    elif code == 3:
        return "rater"
    elif code == 99:
        return "admin"
    return ""
