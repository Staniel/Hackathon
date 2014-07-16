from bs4 import BeautifulSoup
import urllib2,urllib,json, codecs

content=urllib2.urlopen('http://pm25.in',timeout=100).read()
soup = BeautifulSoup(content)
cities = soup.find("div","all").find_all('a')
city_info = {}
for city_element in cities:
    pinyin = city_element.get('href')[1:]
    city_info[pinyin] = city_element.text

outfile = codecs.open('cities.txt','w','utf-8')
cities_write = json.dumps(city_info,ensure_ascii=False)
outfile.write(cities_write)
outfile.close()
