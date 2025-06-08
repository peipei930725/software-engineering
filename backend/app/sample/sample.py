from flask import Blueprint, jsonify

sample_bp = Blueprint('sample', __name__)

@sample_bp.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})
