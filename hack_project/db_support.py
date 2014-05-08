from mongokit import Connection,Document,ObjectId
import datetime
import re
DBconnection = Connection('10.50.6.75',27017)
def length_validator(mi,ma):
    def validate(value):
        vlen=len(value)
        if(vlen <= ma and vlen >=mi):
            return True;
        else:
            return False;
    return validate;
def email_validator(value):
    email = re.compile(r'(?:^|\s)[-a-z0-9_.]+@(?:[-a-z0-9]+\.)+[a-z]{2,6}(?:\s|$)',re.IGNORECASE)
    return bool(email.match(value))
    
class UserModel(Document):
    __collection__ = 'User'
    __database__ = 'Hackathon-config'
    structure = {
        'Email':unicode,
        'Password':str,
        'Nickname':unicode,
        'API_Key':str,
        'Reg_Time':str,
        'Invitation_Code':unicode,
        'User_Status':int
    }
    validators = {
        'Nickname': length_validator(3,50),
        'Email': email_validator,
        'Invitation_Code':length_validator(3,50)
    }
    required_fields = ['Email', 'Password', 'Nickname','Invitation_Code','API_Key']
    default_values = {       
        'Reg_Time':str(datetime.datetime.utcnow()),
        'User_Status':0
    }
DBconnection.register([UserModel])

if __name__ == '__main__':
    for user_ in DBconnection.UserModel.find():
        print ""
        for p in user_:
            print "%s : %s"%(p.ljust(15),user_[p])
        
