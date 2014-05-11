import sys
sys.path.insert(0, '/var/www/hack_project')
from app_main import app as application
application.current_project_path="/var/www/hack_project"