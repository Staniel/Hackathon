from bs4 import BeautifulSoup
import urllib2,urllib,json,re

content=urllib2.urlopen('http://aqicn.org/city/all/cn/',timeout=100).read()
soup = BeautifulSoup(content)
stations = {}
for i in soup.find_all('a',{'href':re.compile('^http://aqicn.org/city/china/')}):
    link = i.get('href')
    stations[link] = i.text
    
outfile = open('stations.txt','w')
json.dump(stations, outfile)
