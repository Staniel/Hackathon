import time
import datetime
import device_module
import json
import urllib
import urllib2

my_device_host = ("10.16.44.83", 3000)
my_device_request = "000000000006010300000014"
my_device_response_head = "00000000002b010328"
my_device_sensor_map = [["CO", "mg/m^3", 0, 50], ["H2S", "PPM", 0, 2], ["NH3", "ug/m^3", 0, 50], ["VOC", "PPM", 0, 5], ["TEMPERATURE", "C", -40, 85], [
    "HUMIDITY", "%RH", 0,   100], ["PM2.5", "ug/m^3", 0, 1], ["SO2", "ug/m^3", 0, 2000], ["NO2", "ug/m^3", 0, 2000], ["O3", "ug/m^3", 0, 500]]
# sensor_map[sensorID]=[Name,Unit,Min_value,Max_value]

try:
    log_file = open("/home/ubuntu/gms800/gms800.log", 'a')
    log_file.write(datetime.datetime.fromtimestamp(
        time.time()).strftime("\n----%Y-%m-%d %H:%M:%S----\n"))
    dev = device_module.AQdevice(
        my_device_host, my_device_request, my_device_response_head, my_device_sensor_map)

    dev.connect()
    dev.fetch()
    res = dev.parse(False)

    new_res = dict()
    new_res["author"] = "roof"
    new_res["submitted_on"] = datetime.datetime.fromtimestamp(
        time.time()).strftime("%Y-%m-%dT%H:%M:%SZ")
    new_res["content"] = {"PM2_5": round(res["PM2.5"], 3),
                          "CO": round(res["CO"], 3),
                          "PM10": 0,
                          "SO2": round(res["SO2"], 3),
                          "O3": round(res["O3"], 3),
                          "NO2": round(res["NO2"], 3)}
    new_res["PM2_5"] = round(res["PM2.5"], 3)
    new_res["CO"] = round(res["CO"], 3)
    new_res["PM10"] = 0
    new_res["SO2"] = round(res["SO2"], 3)
    new_res["O3"] = round(res["O3"], 3)
    new_res["NO2"] = round(res["NO2"], 3)

    resource_dict = {
        "resource_id": "a8980e4f-e68e-4e85-a557-46c56a45ab41",
        "force": True,

        "records": [new_res],
        'method': 'insert',
    }

    json_coded = json.dumps(resource_dict)
    post_dict = urllib.quote(json_coded)

    post_url = "http://10.50.6.110/api/3/action/datastore_upsert"
    request = urllib2.Request(post_url)

    # requires an authorization header.
    # Replace *** with your API key, from your user account on the CKAN site
    # that you're creating the dataset on.

    # request.add_header('Authorization', '***')
    # 10.50.6.100 87boy Bin Zhang
    # request.add_header('Authorization', '9d5a55af-3612-4859-9836-b6e32f715e53')

    # 10.50.6.110 zhangbin zhangbin
    request.add_header('Authorization', 'f7069e57-4d61-4398-aec2-40b372a00243')
    # request.add_header('Content-Type', "application/x-www-form-urlencoded")

    # Make the HTTP request.
    response = urllib2.urlopen(request, post_dict)

    log_file.write("Response:" + response.read() + "\n")
    print response.read()

except Exception as err:
    print err
    log_file.write(str(err) + "\n")
finally:
    dev.disconnect()
    log_file.close()
    response.close()

# sensor0       CO	            0-50PPM	      50*(D1-400 )/1600
# sensor1       H2S	            0-2ppm	      2*(D2-400 )/1600
# sensor2       NH3	            0-50PPM       2*(D3-400 )/1600
# sensor3       VOC	            0-5PPM        5*(D4-400 )/1600
# sensor4       TEMPERATURE     -40C--85C     40+125*(D5-400)/1600
# sensor5       HUMIDITY        0-100%RH      100*(D6-400)/1600
# sensor6       PM2.5	        0--1mg/m3     D7/1000	   *1000
# sensor7       SO2             0-2000ppb     **
# sensor8       NO2             0-2000ppb     **
# sensor9       O3              0-5000ppb     **
