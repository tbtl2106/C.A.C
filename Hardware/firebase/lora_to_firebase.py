import serial
import json
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import sys
 
class ArduinoFirebaseBridge:
    def __init__(self, serial_port='COM10', baud_rate=9600, firebase_cred_path='D:\leanhtu\landslide-7cf2a-firebase-adminsdk-6s2n2-6573c60bb0.json', database_url='https://landslide-7cf2a-default-rtdb.firebaseio.com/'):
        try:
            # Initialize Firebase with error handling
            cred = credentials.Certificate(firebase_cred_path)
            
            # Modified Firebase initialization
            if not firebase_admin._apps:
                app = firebase_admin.initialize_app(cred, {
                    'databaseURL': database_url,
                    'httpTimeout': 30
                })
            print("Firebase initialized successfully")

            # Initialize Serial connection
            self.ser = serial.Serial(
                port=serial_port,
                baudrate=baud_rate,
                timeout=1
            )
            time.sleep(2)  # Wait for connection to establish
            print(f"Serial connection established on {serial_port}")
        
        except Exception as e:
            print(f"Initialization error: {str(e)}")
            raise

    def read_arduino_data(self):
        if self.ser.in_waiting:
            try:
                line = self.ser.readline().decode('utf-8').strip()
                if not line:
                    return None  # Skip empty lines
                print(f"Raw Arduino line: {line}")  # Debug print
                return json.loads(line)
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                print(f"Error parsing Arduino data: {str(e)} | Raw line: {line}")
                return None
        return None
    
    def validate_data(self, data):
        required_fields = ['soilMoisture', 'rain', 'temperature', 'risk', 'latitude', 'longitude']
        return all(field in data for field in required_fields) and \
               all(isinstance(data[field], (int, float)) for field in required_fields)
    
    def upload_to_firebase(self, data , cnt):       
        try:
            if not self.validate_data(data):
                print(f"Invalid data format: {data}")
                return
            
            # Create a reference for the current date
            current_date = datetime.now().strftime('%Y-%m-%d')
            # Create a reference for the current timestamp
            current_timestamp = int(datetime.now().timestamp())
            
            if (cnt == 0):
                # FOR WEBSITE
                ref = db.reference(f'sensor_data/{current_date}/{current_timestamp}/sensor 1')
                # Push data to Firebase
                ref.set(data)
                print(f"Data uploaded successfully: {data}")

            # FOR ESP32
            ref = db.reference(f'sensor_data/{current_date}*/sensor_1')
            # Push data on Firebase
            ref.set(data)

        except Exception as e:
            print(f"Error uploading to Firebase: {str(e)}")
    
    def run(self):
        print("Starting Arduino to Firebase bridge...")
        cnt = 0
        while True:
            try:
                data = self.read_arduino_data()
                if data:
                    if (cnt == 3): cnt = 0
                    self.upload_to_firebase(data , cnt)
                    cnt += 1
                time.sleep(0.1)
                 
            except KeyboardInterrupt:
                print("\nStopping the bridge...")
                self.ser.close()
                break
                
            except serial.SerialException as e:
                print(f"Serial connection error: {str(e)}")
                # Try to reconnect
                time.sleep(5)
                try:
                    self.ser.close()
                    self.ser.open()
                except:
                    pass
            except Exception as e:
                print(f"Error in main loop: {str(e)}")
                time.sleep(1)

if __name__ == "__main__":
    # Configuration
    CONFIG = {
        'serial_port': 'COM10',
        'baud_rate': 9600,
        'firebase_cred_path': 'D:\leanhtu\landslide-7cf2a-firebase-adminsdk-6s2n2-6573c60bb0.json',
        'database_url': 'https://landslide-7cf2a-default-rtdb.firebaseio.com/'
    }
    
    try:
        # Create and run the bridge
        bridge = ArduinoFirebaseBridge(**CONFIG)
        bridge.run()
    except Exception as e:
        print(f"Failed to start bridge: {str(e)}")
        sys.exit(1)