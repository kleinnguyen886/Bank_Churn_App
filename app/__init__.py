from flask import Flask

from config import Config
from app.routes.api import api_bp
from app.routes.campaigns import campaigns_bp
from app.routes.customer import customer_bp
from app.routes.dashboard import dashboard_bp
from app.routes.governance import governance_bp
from app.routes.workspace import workspace_bp


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="../static")
    app.config.from_object(Config)

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(workspace_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(governance_bp)
    app.register_blueprint(campaigns_bp)
    app.register_blueprint(api_bp)

    return app
