"use client";
import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import RiskGraph from '../components/monitor/RiskGraph';

const firebaseConfig = {                                                    
  apiKey: "AIzaSyBeNKymDI7abdj6Hj6YVHWqPU4QoIA8Kac",
  authDomain: "landslide-7cf2a.firebaseapp.com",
  databaseURL: "https://landslide-7cf2a-default-rtdb.firebaseio.com",
  projectId: "landslide-7cf2a",
  storageBucket: "landslide-7cf2a.firebasestorage.app",
  messagingSenderId: "939694240101",
  appId: "1:939694240101:web:c2ba7a13b43f59a0f9718c",
  measurementId: "G-F5PSQDXDTC"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

interface SensorData {
  latitude: number;
  longitude: number;
  rain: number;
  soilMoisture: number;
  temperature: number;
  risk: number;
  timestamp: string;
  sensorId: number;
}

// Function to send an email
const sendEmail = async (riskValue: number) => {
  try {
    const response = await fetch('http://localhost:5000/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ riskValue }),
    });

    if (response.ok) {
      console.log('sent');
    } else {
      console.log('sent error');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to send an alert email to all users
const sendAlertToAllUsers = async (riskValue: number) => {
  try {
    const usersRef = ref(database, 'users'); // Define the usersRef pointing to the correct database path
    onValue(usersRef, async (snapshot) => {

      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ riskValue }),
      });

      if (response.ok) {
        alert('Alert sent to all users successfully.');
      } else {
        alert('Failed to send alert to users.');
      }
    });
  } catch (error) {
    console.error('Error sending alert to users:', error);
    alert('An error occurred while sending alerts.');
  }
};

export default function MonitoringDashboard() {
  const [mapMarkers, setMapMarkers] = useState<{ sensorId: number; latitude: number; longitude: number; timestamp: string; }[]>([]);
  const [graphSensorData, setGraphSensorData] = useState<SensorData[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [riskValue, setRiskValue] = useState<number | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBbnHy_9HBHYDYssKdBjJyX2W96lYoB5m8"
  });

  // Function to validate latitude and longitude
  const isValidLatLng = (lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  useEffect(() => {
    setIsClient(true);
    const dataRef = ref(database, `sensor_data/${selectedDate}`);
    const dataRef2 = ref(database, `sensor_data/${selectedDate}*/sensor_1`);

    const checkRiskValue = () => {
      onValue(dataRef2, (snapshot) => {
        const value = snapshot.val();
        if (value && value.risk >= 70) {
          setRiskValue(value.risk);
          sendEmail(value.risk); // Call the email function
        } else {
          setRiskValue(null);
        }
      });
    };

    onValue(dataRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;

      const fetchedData: SensorData[] = [];

      // Iterate through timestamps
      Object.keys(value).forEach(timestampKey => {
        const sensorData = value[timestampKey];

        // Iterate through sensors
        Object.keys(sensorData).forEach(sensorKey => {
          const sensor = sensorData[sensorKey];
          
          // Create a proper timestamp string
          const formattedTimestamp = new Date(parseInt(timestampKey) * 1000).toISOString();
          
          fetchedData.push({
            sensorId: Number(sensorKey.split(' ')[1]), // Extract number from "sensor X"
            latitude: sensor.latitude,
            longitude: sensor.longitude,
            rain: sensor.rain,
            soilMoisture: sensor.soilMoisture,
            temperature: sensor.temperature,
            risk: sensor.risk,
            timestamp: formattedTimestamp // Use the timestamp from the data structure
          });
        });
      });

      // Use a Set to eliminate repeated markers and filter out invalid markers
      const uniqueMarkers = Array.from(
        fetchedData.reduce((map, marker) => {
          const key = `${marker.latitude}-${marker.longitude}`;
          if (!map.has(key) && isValidLatLng(marker.latitude, marker.longitude)) {
            map.set(key, marker);
          }
          return map;
        }, new Map()).values()
      );

      setMapMarkers(uniqueMarkers.map(data => ({
        sensorId: data.sensorId,
        latitude: data.latitude,
        longitude: data.longitude,
        //latitude: 16.07352951647323,
        //longitude: 108.21905188010119,
        timestamp: data.timestamp,
      })));
      setGraphSensorData(fetchedData);
    });

    const interval = setInterval(checkRiskValue, 3000); // Check every 3 seconds
    // Cleanup when component unmounts
    return () => {
      clearInterval(interval);
      // Optionally clean up listeners if needed
    };
  }, [selectedDate]);

  return (
    <div suppressHydrationWarning className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 w-full h-full items-center sm:items-start relative">
        <div className="w-full flex justify-center mb-4 gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
          <button
            onClick={() => sendAlertToAllUsers(riskValue || 0)}
            className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition-colors"
          >
            Send Alert
          </button>
        </div>
        {isClient && isLoaded && (
          <div className="w-full relative">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '600px' }}
              center={{ lat: 16.07352951647323, lng: 108.21905188010119}}
              zoom={15}
            >
                {mapMarkers.map((marker, index) => (
                  <Marker
                  key={`sensor-${marker.sensorId}-${index}`}
                  position={{ lat: marker.latitude, lng: marker.longitude }}
                  label={{
                    text: `Sensor ${marker.sensorId}`,
                    color: 'black',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                  />
                ))}
            </GoogleMap>
            <button 
              onClick={() => setShowGraph(!showGraph)}
              className="absolute bottom-10 left-4 bg-white px-4 py-2 rounded-md shadow-md hover:bg-gray-100 transition-colors z-10"
            >
              {showGraph ? 'Hide Risk Graph' : 'Show Risk Graph'}
            </button>
          </div>
        )}
        {showGraph && (
          <div className="w-full" id="popupBoxOnePosition">
            <div className="popupBoxWrapper w-full">
              <div className="popupBoxContent w-full">
                <RiskGraph data={graphSensorData} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}