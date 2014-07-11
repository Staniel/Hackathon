from bs4 import BeautifulSoup
import urllib2,urllib,json

content=urllib2.urlopen('http://pm25.in',timeout=100).read()
soup = BeautifulSoup(content)
cities = soup.find("div","all").find_all('a')
city_info = {}
for city_element in cities:
    pinyin = city_element.get('href')[1:]
    city_info[pinyin] = city_element.text

outfile = open('cities.txt','w')
cities = json.dump(city_info, outfile)
outfile.close()
