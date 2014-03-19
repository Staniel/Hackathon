AQ_device_host="10.16.44.83"
AQ_device_port=3000
AQ_device_request="000000000006010300000014"
sensorMap=[["CO","PPM",0,50],["H2S","PPM",0,2],["NH3","PPM",0,50],["VOC","PPM",0,5],["TEMPERATURE","¡æ",-40,85],["HUMIDITY","%RH",0,100],["PM2.5","mg/m^3",0,1],["SO2","PPB",0,2000],["NO2","PPB",0,2000],["O3","PPB",0,500]]
#sensorMap[sensorID]=[Name,Unit,Min_value,Max_value]
import socket
import datetime
from binascii import hexlify, unhexlify
from struct import unpack
def fetchAQdata():    
    try:
        sockConnection= socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sockConnection.connect((AQ_device_host, AQ_device_port))
        sockConnection.send(unhexlify(AQ_device_request))
        response=sockConnection.recv(1024)
    except Exception as err: 
        print(err)
        response=-1
    finally: 
       sockConnection.close()       
    return response;

def AQ():
    responseRaw=fetchAQdata();
    if(responseRaw==-1):
        return -1;  
    sensorRes=dict();   
    if(len(responseRaw)==49):
        if(cmp(hexlify(responseRaw[0:9]),'00000000002b010328')==0):
            print "[Info]: Response verified."
        else:
            print "[Error]: Response head illegal."           
            return
    else:
        print "[Error]: Response length illegal."        
        return   
    sensorValue=unpack("!10f",responseRaw[9:])   
    for sensor_id in range(len(sensorMap)):        
        if(sensorValue[sensor_id]>=sensorMap[sensor_id][2] and sensorValue[sensor_id]<=sensorMap[sensor_id][3]):
            sensorRes[sensorMap[sensor_id][0]]=sensorValue[sensor_id];         
    print "-- Sensor Result --"   
    for i in range(10):          
        print "Sensor[%d]: Raw Data: %s  Result: [%s] %0.6f %s"%(i,hexlify(responseRaw[9+i*4:13+i*4]),sensorMap[i][0],sensorValue[i],sensorMap[i][1])       
    return sensorRes;
##sensor0              CO	            0-50PPM	      50*£¨D1-400 £©/1600		
##sensor1	H2S	            0-2ppm	      2*£¨D2-400 £©/1600		
##sensor2	NH3	            0-50PPM          2*£¨D3-400 £©/1600		 
##sensor3	VOC	            0-5PPM           5*£¨D4-400 £©/1600		
##sensor4	TEMPERATURE    -40¡æ--85¡æ     -40+125*£¨D5-400£©/1600		
##sensor5	HUMIDITY          0-100%RH        100*(D6-400)/1600		
##sensor6	PM2.5	           0--1mg/m3       D7/1000		
##sensor7             SO2                    0-2000ppb        **
##sensor8             NO2                    0-2000ppb
##sensor9             O3                      0-5000ppb
