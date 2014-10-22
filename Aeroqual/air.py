import time
import datetime
import device_module
import json
import urllib
import urllib2

my_device_host = ("10.16.44.83", 4196)
my_device_request = ["5501307a","5501406a","5501505a","55015555","5501b0fa","5501d8d2","5501f6b4","5501f8b2"]
##my_device_response_head = "aa01"
my_device_sensor_map = [["O3", "ppm"],["CO", "ppm"],["NO2", "ppm"], ["NOx", "ppm"],
	["SO2", "ppm"],["PM2.5", "ppm"],["TEMPERATURE", "C"], ["HUMIDITY", "%RH"]]
# sensor_map[sensorID]=[Name,Unit,Min_value,Max_value]

try:
    dev = device_module.AQdevice(
        my_device_host)

    dev.connect()
    sensorValue = dict()
    for sensor_id in range(0,len(my_device_sensor_map)):
    	dev.fetch(my_device_request[sensor_id])
    	tmp = dev.parse()
        print tmp[0]
    	sensorValue[my_device_sensor_map[sensor_id][0]] = tmp[0]
    
    #res = dict()
    res = {}
    #res["author"] = "roof"
    res["time"] = str(datetime.datetime.fromtimestamp(
        time.time()).strftime("%Y-%m-%dT%H:%M:%SZ"))
    res["O3"] = round(sensorValue["O3"],3)
    res["CO"] = round(sensorValue["CO"],3)
    res["NO2"] = round(sensorValue["NO2"],3)
    res["NOx"] = round(sensorValue["NOx"],3)
    res["SO2"] = round(sensorValue["SO2"],3)
    res["PM2.5"] = round(sensorValue["PM2.5"],3)
    res["TEMPERATURE"] = round(sensorValue["TEMPERATURE"],3)
    res["HUMIDITY"] = round(sensorValue["HUMIDITY"],3)

    resource_dict = {
        "resource_id": "f13bb262-bb17-49cf-85f1-dbd08afe5e47",
        "force": True,

        "records": [res],
        'method': 'insert',
    }

    json_coded = json.dumps(resource_dict)
    post_dict = urllib.quote(json_coded)

    post_url = "http://202.121.178.242/api/3/action/datastore_upsert"
    request = urllib2.Request(post_url)

    # requires an authorization header.
    # Replace *** with your API key, from your user account on the CKAN site
    # that you're creating the dataset on.

    # request.add_header('Authorization', '***')
    # 10.50.6.100 87boy Bin Zhang
    # request.add_header('Authorization', '9d5a55af-3612-4859-9836-b6e32f715e53')

    # 10.50.6.110 zhangbin zhangbin
    request.add_header('Authorization', '74fb00de-1095-4ac7-8303-fad8d0fac866')
    # request.add_header('Content-Type', "application/x-www-form-urlencoded")

    # Make the HTTP request.
    response = urllib2.urlopen(request, post_dict)

    print response.read()

except Exception as err:
    print err

finally:
    dev.disconnect()
    response.close()

