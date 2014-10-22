# Filename: device_module.py
import socket
import datetime
import time
from binascii import hexlify, unhexlify
from struct import unpack

class AQdevice:    

    def __init__(self,host):
        self.host=host
        #self.sensor_map = sensor_map
      ##  self.request_code=request_code


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

    def fetch(self,request_code):
        self.fetchTimestamp=time.time()
        self.fetchTime=datetime.datetime.fromtimestamp(self.fetchTimestamp).strftime("%Y-%m-%d %H:%M:%S")
        try:
            self.sockConnection.send(unhexlify(request_code))
            self.responseRaw=self.sockConnection.recv(1024)
        except Exception as err: 
            print(err)
            self.responseRaw=-1
        return self.responseRaw

    def parse(self):
        if (self.responseRaw == -1):
            return -1
        if (len(self.responseRaw) != 15):
            print "[Error]: Response length illegal."        
            return -1

        ##print hexlify(self.responseRaw)
        sensorValue=unpack("!1f",self.responseRaw[6:2:-1])
        ##print sensorValue

        return sensorValue

     