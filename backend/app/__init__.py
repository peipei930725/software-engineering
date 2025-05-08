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
    from app.views.sample import sample_bp
    app.register_blueprint(sample_bp)
    from app.views.auth import auth_bp
    app.register_blueprint(auth_bp)
    from app.views.echo import echo_bp
    app.register_blueprint(echo_bp)


    return app
