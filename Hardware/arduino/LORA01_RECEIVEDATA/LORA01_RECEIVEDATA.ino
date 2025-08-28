#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>

// LoRa pins for Arduino Uno
#define LORA_SS 10
#define LORA_RST 9
#define LORA_DIO0 2

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // Reset LoRa module
  pinMode(LORA_RST, OUTPUT);
  digitalWrite(LORA_RST, LOW);
  delay(10);
  digitalWrite(LORA_RST, HIGH);
  delay(10);

  // Initialize SPI
  SPI.begin();
  
  // Set SS pin as output
  pinMode(LORA_SS, OUTPUT);
  digitalWrite(LORA_SS, HIGH);

  // Initialize LoRa
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  Serial.println("LoRa Receiver Initializing...");
  
  while (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed. Retrying...");
    delay(1000);
  }

  // Match transmitter settings
  LoRa.setSpreadingFactor(8);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(8);
  LoRa.enableCrc();
  
  Serial.println("LoRa Receiver initialized successfully!");
}

void loop() {
  // Check if there's any incoming packet
  int packetSize = LoRa.parsePacket();
  
  if (packetSize) {
    String receivedData = "";
    
    // Read the packet
    while (LoRa.available()) {
      receivedData += (char)LoRa.read();
    }

    // Print raw data
    Serial.println(receivedData);
    delay(1000);
  }
}