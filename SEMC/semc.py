# -*- coding: utf-8 -*-
# Python 2.7
import httplib,urllib,urllib2
from binascii import hexlify, unhexlify
import time,datetime
import json
##data_table_head=unhexlify("706D32350B706D3235310B706D313031")
##data_table_end=unhexlify("44534964")
data_flag=unhexlify("06")
requst_file="requ.b"
station_map={"201":"普陀监测站","209":"杨浦四漂","185":"卢湾师专附小","203":"*青浦淀山湖","215":"虹口凉城","183":"静安监测站","207":"徐汇上师大","193":"浦东川沙","195":"浦东张江","228":"浦东监测站","0":"全市平均"}
poll_map=("SO2","NO2","PM10_24","CO","O3","O3_8","PM25_24","PM2_5","PM10")
rm_poll_map=("O3_8","PM25_24","PM10_24")
update_time=""
data_to_dump="DUMP"

class MyException(Exception):
    __data = ""
    def __init__(self,data):
        self.__data = data
    def __str__(self):
        return "MyException:"+self.__data

def parse(resp):
    global data_to_dump
    data_to_dump=resp
    tokens=[]
    entity=[]
    idx=0
    while (idx<len(resp)):        
        if(resp[idx]==data_flag):
            t_value=ord(resp[idx+1])
            if(t_value<128 and t_value%2==1):
                tokens.append(resp[idx+2:idx+2+t_value/2])
                entity.append(resp[idx+2:idx+2+t_value/2])
                idx+=(2+t_value/2)
            else:                
                r_value=t_value%128
##                m_str="Ref:"+hexlify(resp[idx+1])
                idx+=1
                while(t_value>127):
                    idx+=1
##                    m_str+=hexlify(resp[idx])
                    t_value=ord(resp[idx])
                    r_value=r_value*128+t_value%128
                r_value/=2
                tokens.append(entity[r_value-22])
                idx+=1
        else:
            idx+=1
##    for tk in tokens:
##        print tk.decode("utf8")
    global update_time
    update_time=tokens[-2]
    station_index=[]
    parse_result=dict()   
    for i in range(len(tokens)):
        if(station_map.has_key(tokens[i]) and station_map[tokens[i]]==tokens[i+1]):       
            station_index.append(i+1)
   
    station_found=len(station_index)
    if(station_found==len(station_map)):
        for i in range(station_found):
            if((i<station_found-1 and station_index[i]+len(poll_map)+2==station_index[i+1]) or i==station_found-1):
                parse_result[tokens[station_index[i]]]=dict()
                for k in range(len(poll_map)):                
                    parse_result[tokens[station_index[i]]][poll_map[k]]=tokens[station_index[i]+1+k]
            else:
                raise MyException,"Data Length Not Match.station_index="+str(i)
                
        return parse_result;
    else:
        raise MyException,"Station Num Not Match.station_found="+str(station_found)
    
def request():
    rfile=open(requst_file, 'rb')
    req_con=rfile.read()
    rfile.close()    
    conn = httplib.HTTPConnection("www.semc.gov.cn")    
    conn.request('POST',url = '/aqi/Gateway.aspx', body = req_con, headers={"Content-Type":"application/x-amf"})     
    response = conn.getresponse()
    resp=response.read()
    if(response.status==200 and len(resp)>100):        
##        wfile=open("out.b", 'wb')          
##        wfile.write(resp)
##        wfile.close()
        return parse(resp)
    else:
        raise MyException,"Data Request Failed.HTTP Code:"+str(response.status)
        
   
def test():
    rfile=open("out.b", 'rb')
    resp=rfile.read()
    rfile.close()
    return parse(resp)

if __name__ == '__main__':    
    try:
        time.sleep(30)
        dumpFileName=datetime.datetime.fromtimestamp(time.time()).strftime("%Y_%m_%d_%H_%M_%S.dump")
        logFile = open("semc.log", 'a')
        logFile.write(datetime.datetime.fromtimestamp(time.time()).strftime("\n----%Y-%m-%d %H:%M:%S----\n"))
        try:
            res=request()
        except Exception as err:
            print "(SEMC_1st request)"+str(err)
            logFile.write("(SEMC_1st request)"+str(err)+"\n")
            time.sleep(30)
            res=request()
        for i in res:
            for rmp in rm_poll_map:
                del(res[i][rmp])
        print update_time.decode('utf8')
##        for i in res:
##            print i.decode('utf8')
##            print res[i]
        json_coded=json.dumps(res)
        
        postDict = {"content":json_coded,"key":"BAZHE"}
        postData = urllib.urlencode(postDict)
        req = urllib2.Request("http://10.50.6.70:8080/data/write",postData)
        req.add_header('Content-Type', "application/x-www-form-urlencoded")
        resp = urllib2.urlopen(req,timeout=10)
        respcon=resp.read()
        logFile.write("Response:"+respcon+"\n")
        print "Response:"+respcon
        
    except Exception as err:
        print str(err)
        logFile.write(str(err)+"\n")
        dumpFile = open("dumps/"+"dumpFileName", 'wb')
        dumpFile.write(data_to_dump)
        dumpFile.close()
    finally:
        logFile.close()
    
    
