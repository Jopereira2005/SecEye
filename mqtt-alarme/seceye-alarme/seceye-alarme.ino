#include <WiFi.h>
#include <PubSubClient.h>
#include "config.h"

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
  String msg="";
  for(int i=0;i<length;i++){
    msg += (char)payload[i];
  }

  Serial.print("Recebido: ");
  Serial.println(msg);

  if(msg=="1"){
    digitalWrite(ALARM_PIN, HIGH);
  }
  if(msg=="0"){
    digitalWrite(ALARM_PIN, LOW);
  }
}

void reconnect(){
  while(!client.connected()){
    Serial.println("Conectando MQTT...");
    if(client.connect("ESP32cliente", MQTT_USER, MQTT_PASS)){
      Serial.println("Conectado ao broker!");
      client.subscribe(MQTT_TOPIC);
    }else{
      Serial.print("Erro: ");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void setup(){
  pinMode(ALARM_PIN, OUTPUT);
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while(WiFi.status()!=WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi conectado!");
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(callback);
}

void loop(){
  if(!client.connected()){
    reconnect();
  }
  client.loop();
}