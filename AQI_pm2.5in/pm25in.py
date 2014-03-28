import urllib2
import cookielib
urllib2.install_opener(urllib2.build_opener(urllib2.HTTPCookieProcessor(cookielib.CookieJar()))) #Handle the cookie
urllib2.urlopen("http://www.pm25.in/api/querys/aqi_details.json?city=shanghai&token=5j1znBVAsnSf5xQyNQyq") #Give me some cookie!
response = urllib2.urlopen("http://www.pm25.in/api/querys/aqi_details.json?city=shanghai") #Second request with cookie
print response.read()
    
