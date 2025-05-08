from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from .. import mysql

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin', methods=['POST'])
def admin():

    return jsonify({"message": "Hello from Flask!"})