import os
from flask import Flask
from flask_cors import CORS
from supabase import create_client

# 初始化 Supabase 客戶端
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'KEY123456789'

    # CORS 設定：僅允許前端 http://localhost:5173，並支援憑證
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True
    )

    # 載入其他設定
    app.config.from_object('app.config.Config')

    # 註冊各模組 Blueprint
    from .sample.sample import sample_bp
    app.register_blueprint(sample_bp)

    from .sample.echo import echo_bp
    app.register_blueprint(echo_bp)

    from .auth.auth import auth_api
    app.register_blueprint(auth_api, url_prefix='/api')
    from .auth.profile import profile_bp
    app.register_blueprint(profile_bp, url_prefix='/api')

    from .getdata.projects import projects_bp
    app.register_blueprint(projects_bp, url_prefix='/api')

    from .getdata.announcement import announcement_bp
    app.register_blueprint(announcement_bp, url_prefix='/api')
    
    from .team.register import team_bp
    app.register_blueprint(team_bp, url_prefix='/api')
    
    from .team.edit import edit_bp
    app.register_blueprint(edit_bp, url_prefix='/api/team')

    from .report.report import report_bp
    app.register_blueprint(report_bp, url_prefix='/api')
    
    from .admin.allUser import alluser_bp
    app.register_blueprint(alluser_bp, url_prefix='/api/admin')

    from .admin.allteams import allteams_bp
    app.register_blueprint(allteams_bp, url_prefix='/api/admin')

    from .admin.allscores import allscores_bp
    app.register_blueprint(allscores_bp, url_prefix='/api/admin')

    from .admin.editUser import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    from .admin.appeal import admin_appeal_bp
    app.register_blueprint(admin_appeal_bp)
    
    from .team.info import team_info_bp
    app.register_blueprint(team_info_bp, url_prefix='/api/team')

    from .team.feedback import feedback_bp
    app.register_blueprint(feedback_bp, url_prefix='/api/team')

    from .piece.submit import piece_bp
    app.register_blueprint(piece_bp, url_prefix='/api/piece')
    
    from app.getdata.piece import piece_bp
    app.register_blueprint(piece_bp)

    from app.piece.edit import edit_bp
    app.register_blueprint(edit_bp)

    from .judge.pieces import judge_piece_bp
    app.register_blueprint(judge_piece_bp, url_prefix='/api/judge')

    from .judge.score import score_bp
    app.register_blueprint(score_bp, url_prefix='/api/judge')
    
    # 將 supabase 客戶端掛載到 app（若需要 global 存取）
    app.supabase = supabase


    return app