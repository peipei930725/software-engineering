# app/auth/auth.py

from flask import Blueprint, jsonify, request, current_app
import json
from datetime import datetime

auth_api = Blueprint('auth_api', __name__)

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
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    ssn = data.get("idNumber") or data.get("ID_num") or data.get("ssn")
    password = data.get("password")

    if not ssn or not password:
        return jsonify({"message": "學號或密碼缺失", "error": True}), 400

    supabase = current_app.supabase

    # 1) 先從 user table 撈該 SSN
    try:
        resp = (
            supabase
            .from_("user")
            .select("ssn, name, password, email, phonenumber, address")
            .eq("ssn", ssn)
            .execute()
        )
        user_rows = resp.data or []
    except Exception as e:
        current_app.logger.error(f"查 user 表失敗: {e}")
        return jsonify({"message": "伺服器錯誤", "error": True}), 500

    if not user_rows or user_rows[0]["password"] != password:
        return jsonify({"message": "學號或密碼錯誤", "error": True}), 401

    user = user_rows[0]
    name = user.get("name")

    # 2) 根據 SSN 在 admin/teacher/student/judge 表裡查找，決定角色
    role = "guest"
    for table, r in (("admin", "admin"), ("teacher", "teacher"), ("student", "student"), ("judge", "judge")):
        try:
            chk = (
                supabase
                .from_(table)
                .select("ssn")
                .eq("ssn", ssn)
                .execute()
            )
            if chk.data:
                role = r
                break
        except Exception as e:
            current_app.logger.error(f"查 {table} 表失敗: {e}")

    # 3) 生成 token 並保存
    token = f"token-{ssn}-{role}-{int(datetime.utcnow().timestamp())}"
    valid_tokens[token] = {
        "ssn": ssn,
        "role": role,
        "name": name
    }
    save_tokens(valid_tokens)

    return jsonify({
        "message": "登入成功",
        "data": {
            "name": name,
            "role": role,
            "token": token,
            "ssn": ssn
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
    valid = load_tokens()
    if token not in valid:
        return jsonify({"message": "令牌無效", "error": True}), 403

    return jsonify({"message": "授權成功", "data": valid[token]}), 200

@auth_api.route('/register', methods=['POST', 'OPTIONS'])
def register():
    # CORS 預檢
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    # 1. 印出收到的所有資料
    current_app.logger.info(f"Register payload: {data}")
    print("Register payload:", data)

    # 2. 通用欄位檢查
    required = ('role','name','password','phone','address','idNumber','email')
    for f in required:
        if not data.get(f):
            return jsonify({'success':False,'message':f'{f} 為必填'}),400

    ssn     = data['idNumber']
    role    = data['role']
    name    = data['name']
    pwd     = data['password']
    phone   = data['phone']
    addr    = data['address']
    email   = data['email']

    supabase = current_app.supabase

    # 3. 檢查 user.ssn 是否重複
    chk = supabase.from_('user').select('ssn').eq('ssn', ssn).execute()
    if chk.data:
        return jsonify({'success':False,'message':'此 SSN 已註冊'}),409

    try:
        # 4. 插入 user table
        user_payload = {
            'ssn':        ssn,
            'name':       name,
            'password':   pwd,
            'phonenumber':phone,
            'address':    addr,
            'email':      email
        }
        ins_user = supabase.from_('user').insert([user_payload]).execute()
        if not ins_user.data:
            raise Exception('Insert user failed')

        # 5. 根據 role 插入對應 table
        if role == 'student':
            # studentId, department, grade
            for f in ('studentId','department','grade'):
                if not data.get(f):
                    return jsonify({'success':False,'message':f'{f} 為必填(學生)'}),400
            stu_payload = {
                'ssn':       ssn,
                'sid':       data['studentId'],
                'department':data['department'],
                'grade':     int(data['grade'])
            }
            ins = supabase.from_('student').insert([stu_payload]).execute()
        elif role == 'teacher':
            if not data.get('degree'):
                return jsonify({'success':False,'message':'degree 為必填(老師)'}),400
            tea_payload = {
                'ssn':   ssn,
                'degree':data['degree']
            }
            ins = supabase.from_('teacher').insert([tea_payload]).execute()
        elif role == 'judge':
            if not data.get('title'):
                return jsonify({'success':False,'message':'title 為必填(評審)'}),400
            jdg_payload = {
                'ssn':  ssn,
                'title':data['title']
            }
            ins = supabase.from_('judge').insert([jdg_payload]).execute()
        elif role == 'admin':
            # 若 admin table 也有資料結構，可類似插入
            ins = supabase.from_('admin').insert([{'ssn':ssn}]).execute()
        else:
            return jsonify({'success':False,'message':'未知的 role'}),400

        if not ins.data:
            raise Exception(f'Insert {role} failed')

        return jsonify({'success':True,'message':'註冊成功'}),201

    except Exception as e:
        current_app.logger.error(f"Register failed: {e}")
        return jsonify({'success':False,'message':'伺服器錯誤'}),500