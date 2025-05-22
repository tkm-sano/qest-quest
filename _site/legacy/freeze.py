from app import app
from flask_frozen import Freezer
Freezer(app, with_static_files=True).freeze()