my_device_host=("10.16.44.83",3000)
my_device_request="000000000006010300000014"
my_device_response_head="00000000002b010328"
my_device_sensorMap=[["CO","PPM",0,50],["H2S","PPM",0,2],["NH3","PPM",0,50],["VOC","PPM",0,5],["TEMPERATURE","C",-40,85],["HUMIDITY","%RH",0,100],["PM2.5","mg/m^3",0,1],["SO2","PPB",0,2000],["NO2","PPB",0,2000],["O3","PPB",0,500]]
#sensorMap[sensorID]=[Name,Unit,Min_value,Max_value]

import time
import device_module

def run():
    dev=device_module.AQdevice(my_device_host,my_device_request,my_device_response_head,my_device_sensorMap)
    logFile = open("AQ.txt", 'a')    
    dev.connect()
    try:
        while(1):
            dev.fetch()
            dev.parse()
            logFile.write(dev.fetchTime+"\n"+str(dev.sensorRes)+"\n\n")
            time.sleep(2)
    except KeyboardInterrupt:
        dev.disconnect()
        logFile.close()
        print "Exit."
run()
    
##sensor0       CO	            0-50PPM	      50*£®D1-400 £©/1600		
##sensor1	H2S	            0-2ppm	      2*£®D2-400 £©/1600		
##sensor2	NH3	            0-50PPM           2*£®D3-400 £©/1600		 
##sensor3	VOC	            0-5PPM            5*£®D4-400 £©/1600		
##sensor4	TEMPERATURE         -40°Ê--85°„C       -40+125*£®D5-400£©/1600		
##sensor5	HUMIDITY            0-100%RH          100*(D6-400)/1600		
##sensor6	PM2.5	            0--1mg/m3         D7/1000		
##sensor7       SO2                 0-2000ppb         **
##sensor8       NO2                 0-2000ppb         **
##sensor9       O3                  0-5000ppb         **
