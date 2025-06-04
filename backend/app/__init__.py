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
    from .sample.sample import sample_bp
    app.register_blueprint(sample_bp)
    from .sample.echo import echo_bp
    app.register_blueprint(echo_bp)

    # auth
    from .auth.auth import auth_api
    app.register_blueprint(auth_api)

    # report
    from .report.report import report_bp
    app.register_blueprint(report_bp)

    return app
