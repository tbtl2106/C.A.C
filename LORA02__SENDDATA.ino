#include <MPU6050.h>
#include <Wire.h>
#include <SPI.h>
#include <LoRa.h>

// LoRa pins
#define LORA_SS 10
#define LORA_RST 9
#define LORA_DIO0 2

// MPU-6050 I2C address
const int MPU_ADDR = 0x68;

// Sensor variables
int16_t accelX, accelY, accelZ, gyroX, gyroY, gyroZ;
float temperature;

// Sensor pins
const int SOIL_MOISTURE_PIN = A1;
const int RAIN_DROP_PIN = A0;

// Sensor value range
const int SENSOR_MIN = 0;
const int SENSOR_MAX = 1023;

int count = 0;
float rainPercentage;
float totalRain = 0.0;
float soilMoisturePercentage;
float totalMoisture = 0.0;

bool mpuActive = 0;

void setup() {
  Serial.begin(9600);
  while (!Serial);
  
  // Reset LoRa module
  pinMode(LORA_RST, OUTPUT);
  digitalWrite(LORA_RST, LOW);
  delay(10);
  digitalWrite(LORA_RST, HIGH);
  delay(10);

  // SPI setup for Mega
  SPI.begin();
  
  // St SS pin as ouput 
  pinMode(LORA_SS, OUTPUT);
  digitalWrite(LORA_SS, HIGH);

  // Initialize LoRa
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  Serial.println("LoRa Initializing...");
  
  while (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed. Retrying...");
    delay(1000);
  }

  // Lower spreading factor for more reliable initialization
  LoRa.setSpreadingFactor(8);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(8);
  LoRa.setTxPower(17); 
  LoRa.enableCrc();
  Serial.println("LoRa initialized successfully!");
  
  // Initialize I2C
  Wire.begin();

  // Test MPU6050 Connection 
  Serial.println("\nTesting MPU6050...");
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);  // PWR_MGMT_1 register
  Wire.write(0);     // Wake up MPU-6050
  byte error = Wire.endTransmission(true);
  if (error == 0) {
    Serial.println("MPU6050 connection successful!");
    mpuActive = true;
  }
  else {
    Serial.println("MPU6050 connection failed!");
    mpuActive = false;
  }

  // Configure analog pins
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(RAIN_DROP_PIN, INPUT);
  
  delay(100);
}

bool isAnalogReadingValid(int reading)
{
  // Check if reading is within valid range and not stuck at a fixed value 
  return (reading >= 0 && reading <= 1023); 
}

void loop() {
  // Read sensors
  int soilMoistureAnalog = analogRead(SOIL_MOISTURE_PIN);
  if (isAnalogReadingValid(soilMoistureAnalog)) soilMoisturePercentage = 100 - ((float)soilMoistureAnalog / SENSOR_MAX * 100);
  else soilMoisturePercentage = -1; 
  int rainDropAnalog = analogRead(RAIN_DROP_PIN);
  if (isAnalogReadingValid(rainDropAnalog)) rainPercentage = 100 - ((float)rainDropAnalog / SENSOR_MAX * 100);
  else rainPercentage = -1;
  
  // Read MPU-6050
  if (mpuActive) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    if (Wire.endTransmission(false) != 0) mpuActive = 0;
    Wire.requestFrom(MPU_ADDR, 14, true);

    if (Wire.available() == 14) {
      accelX = Wire.read() << 8 | Wire.read();
      accelY = Wire.read() << 8 | Wire.read();
      accelZ = Wire.read() << 8 | Wire.read();
      temperature = Wire.read() << 8 | Wire.read();
      gyroX = Wire.read() << 8 | Wire.read();
      gyroY = Wire.read() << 8 | Wire.read();
      gyroZ = Wire.read() << 8 | Wire.read();

      temperature = temperature / 340.00 + 36.53;

      // Serial.print("AccelX: "); Serial.println(accelX);
      // Serial.print("AccelY: "); Serial.println(accelY);
      // Serial.print("AccelZ: "); Serial.println(accelZ);
      // Serial.print("GyroX: "); Serial.println(gyroX);
      // Serial.print("GyroY: "); Serial.println(gyroY);
      // Serial.print("GyroZ: "); Serial.println(gyroZ);
      // Serial.print("Temperature: "); Serial.println(temperature);
    } else {
      // MPU6050 not responding properly
      accelX = accelY = accelZ = gyroX = gyroY = gyroZ = temperature = -1;
      mpuActive = false;
      // Serial.println("AccelX: -1");
      // Serial.println("AccelY: -1");
      // Serial.println("AccelZ: -1");
      // Serial.println("GyroX: -1");
      // Serial.println("GyroY: -1");
      // Serial.println("GyroZ: -1");
      // Serial.println("Temperature: -1");
    }
  } else {
    // MPU6050 not active
    accelX = accelY = accelZ = gyroX = gyroY = gyroZ = temperature = -1;
    mpuActive = false;
    // Serial.println("AccelX: -1");
    // Serial.println("AccelY: -1");
    // Serial.println("AccelZ: -1");
    // Serial.println("GyroX: -1");
    // Serial.println("GyroY: -1");
    // Serial.println("GyroZ: -1");
    // Serial.println("Temperature: -1");
  }
  
  // Calculate averages and risk
  ++count;
  totalRain += rainPercentage;
  totalMoisture += soilMoisturePercentage;
  
  if (count == 100) {
    totalRain /= count;
    totalMoisture /= count;
    count = 0;
  }
  
  if (count != 0) {
    totalRain /= count;
    totalMoisture /= count;
  }
  
  // float roll = abs(round(abs(atan(accelX / accelY)) * 57.3) - 90);
  // float acc = abs(round(atan(-accelX / sqrt(accelY * accelY + accelZ * accelZ)) * 57.3));
  // float riskfactor = ((roll + acc) / 90 + (abs(totalRain / 100 - 1) + abs(totalMoisture / 100 - 1)) * 1023 / 1446) / 2;
  float riskfactor = min(100 , max(abs(9 - gyroX) / 100 * 1.5 , abs(19 - gyroY) / 100 * 1.5) + max(abs(-492 - accelY) / 100 * 1.5 , abs(-2616 - accelX) / 100 * 1.5) + (abs(totalRain - 1) + abs(totalMoisture - 1)) / 2);
  // Create JSON string
  String jsonString = "{\"soilMoisture\":" + String(totalMoisture, 2)
                     + ",\"rain\":" + String(totalRain, 2)
                     + ",\"temperature\":" + String(temperature, 2)
                     + ",\"risk\":" + String(riskfactor, 2)
                     + ",\"latitude\":16.070992443753887"
                     + ",\"longitude\":108.22017471268836"
                     + "}";
  
  // Send via LoRa
  LoRa.beginPacket();
  LoRa.print(jsonString);
  LoRa.endPacket();
  
  Serial.println(jsonString);
  
  if (count != 0) {
    totalRain *= count;
    totalMoisture *= count;
  } else {
    totalRain = totalMoisture = 0.0;
  }
  
  delay(1000);
}