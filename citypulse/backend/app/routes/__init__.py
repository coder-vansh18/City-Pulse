from app.routes.rest import router as rest_router
from app.routes.ws import router as ws_router
from app.routes.auth import auth_router

__all__ = ["rest_router", "ws_router", "auth_router"]
