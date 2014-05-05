#encoding: utf-8
from flask import Flask
from flask import render_template
from flask import request
from db_support import DBconnection,email_validator
from flask import abort, redirect, url_for
from hashlib import md5
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/test')
def test():
    return render_template('redir.html',message=u"注册成功!",tar_url=u"/login",tar_name=u"登录页面")
@app.route('/data')
def data():
    return render_template('data.html')

@app.route('/document')
def document():
    return render_template('document.html')

@app.route('/openapi')
def openapi():
    return render_template('openapi.html')

@app.route('/about')
def about():
    return render_template('about.html');

@app.route('/login')
def login_page():
	return render_template('login.html');  
@app.route('/login/submit',methods=['POST'])
def login_submit():
    try:
        email_add=request.form["email"].lower()
        query_res=DBconnection.UserModel.find_one({"Email":email_add})
        if(query_res==None):
            raise Exception("User not exist.")
        pass_md5=md5(email_add+request.form["password"]).hexdigest().upper()
        if(pass_md5!=query_res["Password"]):
            raise Exception("Password not match.")
        return redirect(url_for('user_center'))

    except Exception, e:
        return render_template('redir.html',message=u"登录失败:"+str(e),tar_url=u"/login",tar_name=u"登录页面")

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
        if(DBconnection.UserModel.find_one({"Email":request.form["email"]})!=None):
            raise Exception("Invaild Email.");
        if(request.form["invitationcode"]!=u"Tyrande"):
            raise Exception("Invaild invitation code.")       
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

@app.route('/user_center/')
def user_center():   
    return render_template('user_center/frame.html');

@app.route('/user_center/page/<pagename>')
def user_center_page(pagename):
    return render_template('user_center/page/'+pagename+'.html');


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
