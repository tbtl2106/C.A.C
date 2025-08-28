#include <SPI.h>
#include <LoRa.h>

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("Testing LoRa module connection...");
  
  SPI.begin();
  
  // Basic SPI test
  pinMode(53, OUTPUT);  // SS pin must be set as output
  digitalWrite(53, HIGH);
  
  // Test LoRa with minimal configuration
  LoRa.setPins(53, 9, 2);  // SS=53, RST=9, DIO0=2
  
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  
  Serial.println("LoRa initialization successful!");
}

void loop() {
  // Empty loop
}