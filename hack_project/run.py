#local server for debug
from app_main import app
if __name__ == '__main__':
    app.debug = True    
    app.run(host='0.0.0.0')
