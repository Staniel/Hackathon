from bs4 import BeautifulSoup
import urllib2,urllib,json,re,cookielib,time

def getpage(link):
    content=opener.open(link,timeout=100).read()
    return content

opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookielib.CookieJar()))
opener.addheaders = [('User-agent', 'Mozilla/5.0')]
stations = json.loads(open("stations.txt",'r').read())
vmap = ['pm25','co','pm10','o3','so2','no2']
tmap = ["PM2_5","CO","PM10","O3","SO2","NO2"]
stationsdata = {}
for link in stations:
    
    try:
        print link
        content = getpage(link)
    except:
        print 'failed to open 1st'
        time.sleep(3)
        content = getpage(link)
    soup = BeautifulSoup(content)
    citydivmain = soup.find('div',id = 'citydivmain')
    stationdata = {}
    for i in range(len(vmap)):
        tr = 'tr_' + vmap[i]
        cur = 'cur_' + vmap[i]
        stationdata[tmap[i]] = citydivmain.find('tr', id = tr).find('td', id = cur).text
    stationsdata[stations[link]] = stationdata
    print stationdata
    time.sleep(3)

outfile = open("data.txt",'w')
json.dump(stationsdata, outfile)
