##POST_URL="http://10.50.6.70:8080/data/write"
##POST_NAME="BAZHE"

import urllib2,urllib
import cookielib
import json
import time,datetime

try:
    logFile = open("pm25in.log", 'a')
    logFile.write(datetime.datetime.fromtimestamp(time.time()).strftime("\n----%Y-%m-%d %H:%M:%S----\n"))
    cities_json = open("cities.txt", 'r').read()
    cities = json.loads(cities_json)
    urllib2.install_opener(urllib2.build_opener(urllib2.HTTPCookieProcessor(cookielib.CookieJar()))) #Handle the cookie
    jsonObj = {}
    res_all = {}
    for pinyin in cities:
        url1 = "http://www.pm25.in/api/querys/aqi_details.json?city="+pinyin+"&token=5j1znBVAsnSf5xQyNQyq"
        url2 = "http://www.pm25.in/api/querys/aqi_details.json?city="+pinyin
        try:
            urllib2.urlopen(url1,timeout=10) #Give me some cookie!
            
        except Exception as err:
            print "(pm25in_1st request)"+str(err)
            logFile.write("(pm25in_1st request)"+str(err)+"\n")
            urllib2.urlopen(url1,timeout=10) 
        try:
            response = urllib2.urlopen(url2,timeout=10) #Second request with cookie
            print 1
        except Exception as err:
            print "(pm25in_2nd request)"+str(err)
            logFile.write("(pm25in_2nd request)"+str(err)+"\n")
            response = urllib2.urlopen(url2,timeout=10) 
            print 2
            
        jsonObj = json.loads(response.read())
        response.close()
        vmap=["pm2_5","co","pm10","o3","so2","no2"]
        tmap=["PM2_5","CO","PM10","O3","SO2","NO2"]
        res = {}
        for station in jsonObj:
            if(station['position_name']!=None):
                res[station['position_name']]=dict()
                for i in range(len(vmap)):
                    res[station['position_name']][tmap[i]]=station[vmap[i]]
            else:    
                res['Average']=dict()
                for i in range(len(vmap)):
                    res['Average'][tmap[i]]=station[vmap[i]]
                    
        res_all[cities[pinyin]] = res
    outfile = open("data.txt","w")
    jsonCoded=json.dump(res_all,outfile)
    
##    postDict = {"content":jsonCoded,"key":POST_NAME}
##    postData = urllib.urlencode(postDict)
##    req = urllib2.Request(POST_URL,postData)
##    req.add_header('Content-Type', "application/x-www-form-urlencoded")
##    resp = urllib2.urlopen(req,timeout=10)
##    
##    logFile.write("Response:"+resp.read()+"\n")
##    print resp.read()
except Exception as err:
    print err
    logFile.write(str(err)+"\n")
finally:
    logFile.close()
    ##resp.close()
    outfile.close()
