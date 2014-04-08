POST_URL="http://10.50.6.70:8080/data/write"
POST_NAME="TANGTOU"

my_device_host=("10.16.44.83",3000)
my_device_request="000000000006010300000014"
my_device_response_head="00000000002b010328"
my_device_sensorMap=[["CO","mg/m^3",0,50],["H2S","PPM",0,2],["NH3","ug/m^3",0,50],["VOC","PPM",0,5],["TEMPERATURE","C",-40,85],["HUMIDITY","%RH",0,   100],["PM2.5","ug/m^3",0,1],["SO2","ug/m^3",0,2000],["NO2","ug/m^3",0,2000],["O3","ug/m^3",0,500]]
#sensorMap[sensorID]=[Name,Unit,Min_value,Max_value]
import time,datetime
import device_module
import json
import urllib,urllib2

try:
    logFile = open("/home/ubuntu/cron/aq.log", 'a')
    logFile.write(datetime.datetime.fromtimestamp(time.time()).strftime("\n----%Y-%m-%d %H:%M:%S----\n"))
    dev=device_module.AQdevice(my_device_host,my_device_request,my_device_response_head,my_device_sensorMap)
         
    dev.connect()
    dev.fetch()
    res=dev.parse(False)
        
    newRes=dict()
    newRes["PM2_5"]=round(res["PM2.5"],3)
    newRes["CO"]=round(res["CO"],3)
    newRes["O3"]=round(res["O3"],3)
    newRes["PM10"]=0
    newRes["SO2"]=round(res["SO2"],3)
    newRes["NO2"]=round(res["NO2"],3)        
    jsonCoded=json.dumps(newRes)

    postDict = {"content":jsonCoded,"key":POST_NAME}
    postData = urllib.urlencode(postDict);
    req = urllib2.Request(POST_URL, postData);
    req.add_header('Content-Type', "application/x-www-form-urlencoded")
    resp = urllib2.urlopen(req,timeout=10)    
    logFile.write("Response:"+resp.read()+"\n")
    print resp.read()
    
    
except Exception as err:
    print err
    logFile.write(str(err)+"\n")
finally:
    dev.disconnect()
    logFile.close()
    resp.close()
    
        
##sensor0       CO	            0-50PPM	      50*(D1-400 )/1600		
##sensor1	H2S	            0-2ppm	      2*(D2-400 )/1600		
##sensor2	NH3	            0-50PPM           2*(D3-400 )/1600		 
##sensor3	VOC	            0-5PPM            5*(D4-400 )/1600		
##sensor4	TEMPERATURE         -40C--85C         -40+125*(D5-400)/1600		
##sensor5	HUMIDITY            0-100%RH          100*(D6-400)/1600		
##sensor6	PM2.5	            0--1mg/m3         D7/1000	   *1000	
##sensor7       SO2                 0-2000ppb         **
##sensor8       NO2                 0-2000ppb         **
##sensor9       O3                  0-5000ppb         **

