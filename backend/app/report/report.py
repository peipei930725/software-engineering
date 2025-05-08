from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from .. import mysql

report_bp = Blueprint('report', __name__)

@report_bp.route('/api/report', methods=['POST'])
def report():
    
    return jsonify({"message": "Hello from Flask!"})