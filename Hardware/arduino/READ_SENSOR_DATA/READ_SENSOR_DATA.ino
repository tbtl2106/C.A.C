#include <MPU6050.h> 
#include <stdio.h> 
#include <Wire.h>  

// MPU-6050 I2C address 
const int MPU_ADDR = 0x68;   

// Accelerometer and gyroscope reading variables 
int16_t accelX, accelY, accelZ, gyroX, gyroY, gyroZ; float temperature;  

// Sensor pins 
const int SOIL_MOISTURE_PIN = A1; const int RAIN_DROP_PIN = A0;  

// Sensor value range 
const int SENSOR_MIN = 0; const int SENSOR_MAX = 1023;  

void setup() {   
  // Initialize I2C communication   
  Wire.begin();      
  
  // Initialize MPU-6050   
  Wire.beginTransmission(MPU_ADDR);    
  Wire.write(0x6B);  
  
  // PWR_MGMT_1 register   
  Wire.write(0);     
  
  // Wake up MPU-6050   
  Wire.endTransmission(true);      
  
  // Initialize serial communication   
  Serial.begin(9600);   
  while (!Serial) {;}      
  
  // Configure analog pins   
  pinMode(SOIL_MOISTURE_PIN, INPUT);   
  pinMode(RAIN_DROP_PIN, INPUT);      
  delay(100);  
}  

int count = 0; 
float totalRain = 0.0; 
float totalMoisture = 0.0;  

void loop() {   
  // Read soil moisture and rain sensor   
  int soilMoistureAnalog = analogRead(SOIL_MOISTURE_PIN);   
  int rainDropAnalog = analogRead(RAIN_DROP_PIN);   
  
  // Calculate percentages   
  float soilMoisturePercentage = 100 - ((float)soilMoistureAnalog / SENSOR_MAX * 100);   
  float rainPercentage = 100 - ((float)rainDropAnalog / SENSOR_MAX * 100);    
  
  // Read MPU-6050 data   
  Wire.beginTransmission(MPU_ADDR);   
  Wire.write(0x3B);  
  
  // Starting register for accelerometer data   
  Wire.endTransmission(false);   
  Wire.requestFrom(MPU_ADDR, 14, true);      
  accelX = Wire.read() << 8 | Wire.read();   
  accelY = Wire.read() << 8 | Wire.read();   
  accelZ = Wire.read() << 8 | Wire.read();   
  temperature = Wire.read() << 8 | Wire.read();   
  gyroX = Wire.read() << 8 | Wire.read();   
  gyroY = Wire.read() << 8 | Wire.read();   
  gyroZ = Wire.read() << 8 | Wire.read();    
  
  // Convert temperature   
  temperature = temperature / 340.00 + 36.53;    
  
  // Calculate risk factor   
  ++count;   
  totalRain += rainPercentage;   
  totalMoisture += soilMoisturePercentage;   
  if (count == 100)    
  {     
    totalRain /= count;     
    totalMoisture /= count;     
    count = 0;   
  }   
  if (count != 0)    
  {     
    totalRain /= count;     
    totalMoisture /= count;   
  }   
  float roll = abs(round(abs(atan(accelX / accelY)) * 57.3) - 90);   
  float acc = abs(round(atan(-accelX / sqrt(accelY * accelY + accelZ * accelZ)) * 57.3));   
  // float riskfactor = ((roll + acc) / 90 + (abs(totalRain / 100 - 1) + abs(totalMoisture / 100 - 1)) * 1023 / 1446) / 2;   
  float riskfactor = min(abs(1900 - accelY) / 100 * 1.5 + (abs(totalRain) + abs(totalMoisture)) / 2 , 100);   
  Serial.print(accelX);   
  Serial.print(" ");   
  Serial.print(accelY);   
  Serial.print(" ");   
  Serial.println(accelZ);   
  
  // Create JSON string with correct soil moisture value   
  String jsonString = "{\"soilMoisture\":" + String(totalMoisture, 2)
                      + ",\"rain\":"  + String(totalRain, 2)
                      + ",\"temperature\":" + String(temperature, 2)
                      + ",\"risk\":" + String(riskfactor, 2)                     
                      + ",\"latitude\":16.070992443753887"                     
                      + ",\"longitude\":108.22017471268836"                     
                      + "}";    
  Serial.println(jsonString);    
  
  if (count != 0)   
  {     
    totalRain *= count;     
    totalMoisture *= count;   
  }   
  else totalRain = totalMoisture = 0.0;      
  
  // Delay before next reading 
  delay(1000);  
}