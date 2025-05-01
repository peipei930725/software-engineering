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

    return app
