#include <aJSON.h>
#include <dht.h>
dht DHT;
#define DHT22_PIN 7
char sample_data1[512]="POST /data/write HTTP/1.1\r\nHost: 202.120.58.116:8080\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: ";
char value[4];
int dustPin=A0;
int ledPower=2;
int dustVal=0,lastDustVal=0;
const int Time280=280, Time40=40, offTime=9680;
long previousMillis=0;
long previousMillis2=0;
long previousMillis3=0;
int interval1=5;
int interval2=500;
int interval3=10000;
float temperature,humidity;
float voltage=0, dustDensity = 0;
unsigned long currentMillis;

void setup()
{
  Serial.begin(115200);
  pinMode(ledPower,OUTPUT);
}

int getDustVal()
{
  int Val;
  // ledPower is any digital pin on the arduino connected to Pin 3 on the sensor
  digitalWrite(ledPower,LOW); // power on the LED
  delayMicroseconds(Time280);
  Val=analogRead(dustPin); // read the dust value via pin 5 on the sensor
  delayMicroseconds(Time40);
  digitalWrite(ledPower,HIGH); // turn the LED off
  delayMicroseconds(offTime); 
  return Val;
}

aJsonObject *createMessage()
{
  aJsonObject *msg = aJson.createObject();
  return msg;
}

aJsonObject *add_pm25(aJsonObject* msg,float value)
{
  aJson.addNumberToObject(msg,"PM25",value);
  return msg;
}

aJsonObject *add_temperature(aJsonObject* msg,float value)
{
  aJson.addNumberToObject(msg,"temperature",value);
  return msg;
}

aJsonObject *add_humidity(aJsonObject* msg,float value)
{
  aJson.addNumberToObject(msg,"humidity",value);
  return msg;
}

aJsonObject *add_CO2(aJsonObject* msg,float value)
{
  aJson.addNumberToObject(msg,"CO2",value);
  return msg;
}

aJsonObject *add_text(aJsonObject* msg,char* key,char* value)
{
  aJson.addStringToObject(msg,key,value);
  return msg;
}

char* build_request(aJsonObject* msg, char* key)
{
  char temp[512];
  char data[256];
  strcpy(temp,sample_data1);
  strcpy(data,aJson.print(msg));
  int length=strlen(data);
  strcat(temp,itoa(length+13+strlen(key),value,10));
  strcat(temp,"\r\n\r\nkey=");
  strcat(temp,key);
  strcat(temp,"&content=");
  strcat(temp,data);
  strcat(temp,"\r\n");
  return temp;
}

void post_request(char* request)
{
  Serial.write(request);
}

void loop()
{
  currentMillis = millis();
  
  //pseudo thread one to handle serial comminication
  if(currentMillis - previousMillis > interval1) 
  {
    previousMillis = currentMillis; 
    // display the message received from the web server, use 5 ms to avoid buffer overflow
    while(Serial.available())
      Serial.write(Serial.read());  
  }
  
  //pseudo thread two to update sensor value
  if(currentMillis - previousMillis2 > interval2) 
  {
    previousMillis2 = currentMillis; 
    //dust part, use a simple filter
    dustVal = int(lastDustVal*0.6 + getDustVal()*0.4); 
    lastDustVal = dustVal;
    voltage = dustVal*(5.0/1023);
    dustDensity = 0.172*voltage-0.0999;   
    dustDensity = constrain(dustDensity, 0, 0.5004);      
    //temperature and humidity 
    int chk = DHT.read22(DHT22_PIN);
    if (chk==DHTLIB_OK)
      {
        temperature = DHT.temperature;
        humidity = DHT.humidity;
      }
     else
     {
     temperature = 0;
        humidity = 0;
     }
  }
  
  //pseudo thread three to post request
  if(currentMillis - previousMillis3 > interval3) 
  {
    previousMillis3 = currentMillis; 
    // create a blank aJson object
    aJsonObject *msg = createMessage();
    //set parameter to the object
    add_pm25(msg,dustDensity*1000);
    add_temperature(msg, temperature);
    add_humidity(msg, humidity);
    add_text(msg,"name","yao");
    char* temp=build_request(msg,"MOGE");
    post_request(temp);
    //clean the memory to avoid overflow
    aJson.deleteItem(msg);
  }
}


