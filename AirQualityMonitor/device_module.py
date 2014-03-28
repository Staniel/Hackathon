# Filename: device_module.py
import socket
import datetime
import time
from binascii import hexlify, unhexlify
from struct import unpack

class AQdevice:    

    def __init__(self,host,request_code,response_head,sensor_map):
        self.host=host
        self.request_code=request_code
        self.response_head=response_head
        self.sensor_map=sensor_map

    def connect(self):
        try:        
            self.sockConnection= socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sockConnection.connect(self.host)
        except Exception as err:
            print err
            self.sockConnection=-1
        return self.sockConnection      

    def disconnect(self):
        try:
            self.sockConnection.close()
        except Exception as err:
            print err      

    def fetch(self):
        self.fetchTimestamp=time.time()
        self.fetchTime=datetime.datetime.fromtimestamp(self.fetchTimestamp).strftime("%Y-%m-%d %H:%M:%S")
        try:
            self.sockConnection.send(unhexlify(self.request_code))
            self.responseRaw=self.sockConnection.recv(1024)
        except Exception as err: 
            print(err)
            self.responseRaw=-1
        return self.responseRaw

    def parse(self,detail_enable=True):
        print "\n"+self.fetchTime
        if(self.responseRaw==-1):
            return -1
        self.sensorRes=dict()
        if(len(self.responseRaw)==(len(self.response_head)/2+4*len(self.sensor_map))): 
            if(cmp(hexlify(self.responseRaw[0:len(self.response_head)/2]),self.response_head)==0):
                print "[Info]: Response verified."
            else:
                print "[Error]: Response head illegal."           
                return -1;
        else:
            print "[Error]: Response length illegal."        
            return -1;
        sensorValue=unpack("!"+str(len(self.sensor_map))+"f",self.responseRaw[len(self.response_head)/2:])   
        for sensor_id in range(len(self.sensor_map)):        
            if(sensorValue[sensor_id]>=self.sensor_map[sensor_id][2] and sensorValue[sensor_id]<=self.sensor_map[sensor_id][3]):
                self.sensorRes[self.sensor_map[sensor_id][0]]=sensorValue[sensor_id]
        if(detail_enable):
            print "--------------------------------------------------------"
            print "|ID | Type        | Value                   | Raw      |"
            print "--------------------------------------------------------"
            for i in range(len(self.sensor_map)):          
                print "| %d | %s | %s | %s |"%(i,self.sensor_map[i][0].ljust(11),(str(sensorValue[i])+" "+self.sensor_map[i][1]).ljust(23),hexlify(self.responseRaw[len(self.response_head)/2+i*4:len(self.response_head)/2+4+i*4]))       
            print "--------------------------------------------------------"
        return self.sensorRes
