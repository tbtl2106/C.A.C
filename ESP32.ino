#include <vector> 
#include "pitches.h"
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Provide the token generation process info
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info
#include "addons/RTDBHelper.h"

// WiFi Configuration
#define WIFI_SSID "Bin"
#define WIFI_PASSWORD "matkhaunhucu"

// Firebase Configuration
#define API_KEY "AIzaSyBeNKymDI7abdj6Hj6YVHWqPU4QoIA8Kac"
#define DATABASE_URL "https://landslide-7cf2a-default-rtdb.firebaseio.com/"
#define USER_EMAIL "tuleanh2162008@gmail.com"
#define USER_PASSWORD "latdtntg1234"

// Piezo Buzzer Pin
#define BUZZER_PIN 18  // Change this to the GPIO pin connected to your piezo buzzer

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// NTP Client for time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// notes in the melody:
int melody[] = {
  NOTE_E5, NOTE_E5, NOTE_E5,
  NOTE_E5, NOTE_E5, NOTE_E5,
  NOTE_E5, NOTE_G5, NOTE_C5, NOTE_D5,
  NOTE_E5,
  NOTE_F5, NOTE_F5, NOTE_F5, NOTE_F5,
  NOTE_F5, NOTE_E5, NOTE_E5, NOTE_E5, NOTE_E5,
  NOTE_E5, NOTE_D5, NOTE_D5, NOTE_E5,
  NOTE_D5, NOTE_G5
};

// note durations: 4 = quarter note, 8 = eighth note, etc, also called tempo:
int noteDurations[] = {
  8, 8, 4,
  8, 8, 4,
  8, 8, 8, 8,
  2,
  8, 8, 8, 8,
  8, 8, 8, 16, 16,
  8, 8, 8, 8,
  4, 4
};

void setup() {
  // Initialize Serial communication
  Serial.begin(115200);
  
  // Add a small delay to ensure Serial is ready
  delay(2000);
  
  // Print initial connection message
  Serial.println("Starting WiFi Connection...");
  Serial.print("SSID: ");
  Serial.println(WIFI_SSID);

  // Connect to WiFi with error handling
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  // Increased timeout and more verbose logging
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Print WiFi status for debugging
    switch(WiFi.status()) {
      case WL_IDLE_STATUS:
        Serial.println("\nWiFi in idle state");
        break;
      case WL_NO_SSID_AVAIL:
        Serial.println("\nNo SSID Available!");
        break;
      case WL_CONNECT_FAILED:
        Serial.println("\nConnection Failed!");
        break;
    }
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }

  // Set buzzer pin as output
  pinMode(BUZZER_PIN, OUTPUT);

  // Initialize NTP Client
  timeClient.begin();
  timeClient.setTimeOffset(7 * 3600);  // Adjust for your timezone (e.g., UTC+7 for Vietnam)

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;
  
  // Authentication
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  /* Check connect of Firebase*/
  if (Firebase.ready()) Serial.println("Connected to Firebase successfully");
  else Serial.println("Failed to connect to Firebase");
}

void loop() {
  // Get the current date
  String currentDate = getCurrentDate();
  Serial.println("Current Date: " + currentDate);
  
  // Full path to the sensor data
  String fullPath = "/sensor_data/" + currentDate + "*/sensor 1/risk";
  Serial.println("Full Path: " + fullPath);
    
  // Variable to store risk percentage
  float riskPercentage = 0.0;

  // Read risk percentage from Firebase
  if (Firebase.RTDB.getFloat(&fbdo, fullPath)) {
    riskPercentage = fbdo.floatData();
    Serial.print("Risk Percentage: ");
    Serial.print(riskPercentage);
    Serial.println("%");

    // Check if risk is 70% or higher
    if (riskPercentage >= 70.0) {
      Serial.println("High Risk Detected! Triggering Alert...");
      triggerRiskAlert();
    } else {
      // Turn off buzzer if risk is below threshold
      digitalWrite(BUZZER_PIN, LOW);
      Serial.println("Risk is below threshold.");
    }
  } else {
    Serial.println("Failed to get risk data");
    Serial.println(fbdo.errorReason());
  }

  // Wait before next check
  delay(1000);  // Check every 1 seconds
}

// Get current date in YYYY-MM-DD format
String getCurrentDate() {
  // Use NTP client to get current date
  timeClient.update();
  time_t epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime(&epochTime);
  
  char buffer[11];
  snprintf(buffer, sizeof(buffer), "%04d-%02d-%02d", 
           ptm->tm_year + 1900, ptm->tm_mon + 1, ptm->tm_mday);
  
  return String(buffer);
}

// Trigger risk alert with buzzer
void triggerRiskAlert() {
  // iterate over the notes of the melody:
  int size = sizeof(noteDurations) / sizeof(int);

  for (int thisNote = 0; thisNote < size; thisNote++) {
    // to calculate the note duration, take one second divided by the note type.
    //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
    int noteDuration = 1000 / noteDurations[thisNote];
    
    // Play the tone
    tone(BUZZER_PIN, melody[thisNote], noteDuration);

    // to distinguish the notes, set a minimum time between them.
    // the note's duration + 30% seems to work well:
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    
    // stop the tone playing:
    noTone(BUZZER_PIN);
  }

  Serial.println("Risk Alert Melody Completed!");
}