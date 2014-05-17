#encoding: utf-8
from flask import g,Flask,request,render_template,session,abort,redirect
from functools import wraps
from hashlib import md5
from hack_project_libs.db_support import DBconnection,email_validator
from hack_project_libs.validate_code import create_validate_code
from random import randint
app = Flask(__name__)
app.secret_key="8E9852FD04BA946D51DE36DFB08E1DB6"
app.current_project_path="."

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('logged_in') is not True:
             return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html',heading_pic=randint(0,13),pagename_index=True)
@app.route('/test')
def test():
    return render_template('redir.html',message=u"注册成功!",tar_url=u"/login",tar_name=u"登录页面")
@app.route('/data')
def data():
    return render_template('data.html',pagename_data=True)

@app.route('/document')
def document():
    return render_template('document.html',pagename_document=True)

@app.route('/openapi')
def openapi():
    return render_template('openapi.html',pagename_openapi=True)

@app.route('/about')
def about():
    return render_template('about.html',pagename_about=True);

@app.route('/login')
def login_page():    
    if session.get('logged_in') is True:
        return render_template('redir.html',message=u"已经登陆",tar_url=u"/user_center",tar_name=u"用户中心")
    return render_template('login.html');  
@app.route('/login/submit',methods=['POST'])
def login_submit():
    try:
        email_add=request.form["email"].lower()
        query_res=DBconnection.UserModel.find_one({"Email":email_add})
        if(query_res==None):
            raise Exception("User Not Exist.")
        pass_md5=md5(email_add+request.form["password"]).hexdigest().upper()
        if(pass_md5!=query_res["Password"]):
            raise Exception("Wrong Password.")
        session['logged_in'] = True  
        session["user"]={}     
        session["user"]["id"]=str(query_res["_id"])
        session["user"]["Email"]=query_res["Email"]        
        session["user"]["Nickname"]=query_res["Nickname"]        
        return redirect('/user_center')

    except Exception, e:
        return render_template('redir.html',message=u"登录失败:"+str(e),tar_url=u"/login",tar_name=u"登录页面")
@app.route('/validate_code')
def rvalidate_code():
    import StringIO
    code_img,code_value = create_validate_code(font_type=app.current_project_path+"/hack_project_libs/vcode.ttf")  
    session["validate_code"]=code_value
    buf = StringIO.StringIO()  
    code_img.save(buf,'PNG') 
    buf_str = buf.getvalue()  
    response = app.make_response(buf_str)   
    response.headers['Content-Type'] = 'image/png'  
    return response   

@app.route('/reg')
def reg_page():
    return render_template('reg.html');

@app.route('/reg/checkemail',methods=['POST'])
def reg_check():   
    try:
        email_add=request.form["email"].lower()
        if(DBconnection.UserModel.find_one({"Email":email_add})==None and email_validator(email_add)):
            return '{"vaild":true}'
        else:
            return '{"vaild":false}'
    except Exception, e:
        return 'args missing.'
    
@app.route('/reg/submit',methods=['POST'])
def reg_submit():    
    try:
        v_code=session.get("validate_code")
        if(v_code==None or request.form["validate_code"].upper()!=v_code):
            raise Exception(u"Wrong Validate Code.")   
        if(DBconnection.UserModel.find_one({"Email":request.form["email"]})!=None):
            raise Exception("Invaild Email.");
        if(request.form["invitationcode"]!=u"Tyrande"):
            raise Exception("Invaild Invitation Code.")    
        
        session.pop('validate_code',None) 
        newUser=DBconnection.UserModel()
        newUser["Email"]=request.form["email"].lower()
        newUser["Password"]=md5(newUser["Email"]+request.form["password"]).hexdigest().upper()
        newUser["Nickname"]=request.form["nickname"]
        newUser["Invitation_Code"]=request.form["invitationcode"]
        newUser["API_Key"]=md5(newUser["Email"]+newUser["Reg_Time"]).hexdigest().upper()
        newUser.save();
        return render_template('redir.html',message=u"注册成功!",tar_url=u"/login",tar_name=u"登录页面")        
    except Exception, e:
        return render_template('redir.html',message=u"注册失败: "+str(e),tar_url=u"/reg",tar_name=u"注册页面")

@app.route('/logout')
def logout():
    session.pop('logged_in',None)  
    session.pop('user',None)   
    return render_template('redir.html',message=u"登出成功",tar_url=u"/login",tar_name=u"登录页面")

@app.route('/user_center/')
@login_required
def user_center():   
    return render_template('user_center/frame.html');
@app.route('/user_center/action',methods=['POST'])
def user_center_action():
    try:
        res=""
        for a in request.form:
            res+=(a+"="+request.form[a]+"  ")
        return(res)
    except Exception, e:
        return str(e)
@app.route('/user_center/page/<pagename>')
@login_required
def user_center_page(pagename):   
    if(pagename=="acc_settings"):    
        g.user=DBconnection.UserModel.find_one({"Email":session['user']['Email']})      
    return render_template('user_center/page/'+pagename+'.html')
