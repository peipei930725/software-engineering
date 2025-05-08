from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object('app.config.Config')
    db.init_app(app)

    # Register blueprint

    # sample
    from backend.app.sample.sample import sample_bp
    app.register_blueprint(sample_bp)
    from backend.app.sample.echo import echo_bp
    app.register_blueprint(echo_bp)

    # auth
    from backend.app.auth.login import auth_bp
    app.register_blueprint(auth_bp)
    from backend.app.auth.register import register_bp
    app.register_blueprint(register_bp)

    # report
    from backend.app.report.report import report_bp
    app.register_blueprint(report_bp)

    return app
