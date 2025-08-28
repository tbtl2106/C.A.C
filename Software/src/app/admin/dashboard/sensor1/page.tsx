'use client';
import { useState, useEffect } from 'react';
import ChartComponent from '@/app/components/admin/ChartComponent';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { getDisplayName } from 'next/dist/shared/lib/utils';
import { remove } from 'firebase/database';

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

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalSensors: '0',
    highRiskSensors: '0',
    avgRisk: '0%',
    dataPoints: '0',
    loraStatus: 'OK'
  });

  const [chartData, setChartData] = useState<SensorData[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dataRef = ref(database, `sensor_data/${formattedDate}`);
    // alert(formattedDate)
    // const dataRef = ref(database, `sensor_data/2024-12-08`);

    let maxTimestamp = 0;

    onValue(dataRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;

      const fetchedData: SensorData[] = [];
      const uniqueSensors = new Set<number>();
      let totalRisk = 0;
      let highRiskCount = 0;

      // Iterate through timestamps
      Object.keys(value).forEach(timestampKey => {
        const sensorData = value[timestampKey];
        const timestamp = parseInt(timestampKey);
        if (timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
        }

        // Iterate through sensors
        Object.keys(sensorData).forEach(sensorKey => {
          const sensor = sensorData[sensorKey];
          
          // Create a proper timestamp string
          const formattedTimestamp = new Date(parseInt(timestampKey) * 1000).toISOString();
          
          const dataPoint = {
            sensorId: Number(sensorKey.split(' ')[1]), // Extract number from "sensor X"
            latitude: sensor.latitude,
            longitude: sensor.longitude,
            rain: sensor.rain,
            soilMoisture: sensor.soilMoisture,
            temperature: sensor.temperature,
            risk: sensor.risk,
            timestamp: formattedTimestamp // Use the timestamp from the data structure
          };

          fetchedData.push(dataPoint);
          uniqueSensors.add(dataPoint.sensorId);
          totalRisk += sensor.risk;
          if (sensor.risk > 70) highRiskCount++;
        });
      });

      const avgRisk = fetchedData.length > 0 ? (totalRisk / fetchedData.length).toFixed(2) : '0.00';
      const latestTimestamp = maxTimestamp;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const loraStatus = (currentTimestamp - latestTimestamp) < 20 ? 'OK' : 'ERROR';
      setStats({
        totalSensors: new Intl.NumberFormat().format(uniqueSensors.size),
        highRiskSensors: new Intl.NumberFormat().format(highRiskCount),
        avgRisk: `${avgRisk}%`,
        dataPoints: new Intl.NumberFormat().format(fetchedData.length),
        loraStatus: loraStatus
      });

      setChartData(fetchedData);
      console.log("Max Timestamp:", maxTimestamp);
    });
    const intervalId = setInterval(() => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const loraStatus = (currentTimestamp - maxTimestamp) < 20 ? 'OK' : 'ERROR';
      setStats(prevStats => ({
        ...prevStats,
        loraStatus: loraStatus
      }));
    }, 5000); // Update every 1 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  const allowedSensors = [1, 2]; // Example allowed sensor IDs
  const handleRedirect = () => {
    router.push('/admin/dashboard');
  };

  const [selectedDate, setSelectedDate] = useState<string>(''); // State để lưu ngày tháng được chọn
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value; // Lấy giá trị ngày từ input
    setSelectedDate(date); // Lưu ngày vào state
  };

  const handleDeleteData = async () => {
    if (selectedDate) {
      const formattedDate = selectedDate; // Không cần định dạng lại vì Firebase sử dụng định dạng YYYY-MM-DD
      const formattedDate2 = `${formattedDate}*`; // Thay dấu '-' cuối cùng bằng '*'
    
      const confirmDelete = window.confirm(
        `Are you sure you want to delete data for ${formattedDate} and ${formattedDate2}?`
      );
      if (!confirmDelete) {
        return; // Exit if the user cancels
      }
      const dataRef = ref(database, `sensor_data/${formattedDate}`); // Path for formattedDate
      const dataRef2 = ref(database, `sensor_data/${formattedDate2}`); // Path for formattedDate2


      try {
        await remove(dataRef); // Xóa dữ liệu trên Firebase
        await remove(dataRef2);
        alert(`Data for ${formattedDate} has been deleted successfully!`); // Thông báo thành công
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Failed to delete data. Please try again.'); // Thông báo lỗi
      }

    } else {
      alert('No date selected!'); // Thông báo nếu chưa chọn ngày
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div style={{display: 'grid', gridTemplateColumns: '150px 150px 150px', gridGap: '20px'}}>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard 1</h1>
          <input
            type="date"
            className="p-2 border rounded"
            onChange={handleDateChange} // Gọi hàm khi ngày được chọn
          />
          <button
            id="deleted"
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={handleDeleteData} // Gọi hàm khi nhấn nút
          >
            Deleted
          </button>
        </div>

        <div className="flex space-x-4">
          <select
            className="p-2 border rounded"
            onChange={(e) => {
              const sensorId = e.target.value;
              if (sensorId) {
                window.location.href = `/admin/dashboard/sensor${sensorId}`;
              }
            }}
          >
            <option value="">Select a sensor</option>
            {allowedSensors.map((sensorId, index) => (
              <option key={index} value={sensorId}>
                Sensor {sensorId}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleRedirect}>Go to Manage Page</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sensors status</h2>
          <table className="min-w-full bg-white">
          <tbody className="text-1xl font-bold">
              <tr>
                <td className="py-2 px-4 border-b">Rain</td>
                <td className={`py-2 px-4 border-b ${stats.loraStatus === 'OK' && chartData.length > 0 && chartData[chartData.length - 1].rain !== -1 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.loraStatus === 'OK' && chartData.length > 0 && chartData[chartData.length - 1].rain !== -1 ? 'OK' : 'ERROR'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Soil Moisture</td>
                <td className={`py-2 px-4 border-b ${stats.loraStatus === 'OK' && chartData.length > 0 && chartData[chartData.length - 1].soilMoisture !== -1 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.loraStatus === 'OK' && chartData.length > 0 && chartData[chartData.length - 1].soilMoisture !== -1 ? 'OK' : 'ERROR'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Acceleration</td>
                <td className={`py-2 px-4 border-b ${stats.loraStatus === 'OK' && chartData.length > 0 && chartData[chartData.length - 1].temperature !== -1 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.loraStatus === 'OK' && chartData.length > 0 && chartData[chartData.length - 1].temperature !== -1 ? 'OK' : 'ERROR'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Lora Status</td>
                <td className={`py-2 px-4 border-b ${stats.loraStatus === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.loraStatus}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">High Risk Sensors</h2>
          <p className="text-3xl font-bold">{stats.highRiskSensors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Average Risk</h2>
          <p className="text-3xl font-bold">{stats.avgRisk}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Data Points</h2>
          <p className="text-3xl font-bold">{stats.dataPoints}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Risk Level Distribution</h2>
          <div className="h-[300px]">
            <ChartComponent 
              data={chartData.map(d => ({ sensorId: d.sensorId, date: new Date(d.timestamp), value: d.risk }))}
              type="pie"
              height={300}
              colorScale={d => d.value > 50 ? 'red' : 'green'}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Daily Risk Trends</h2>
          <div className="h-[300px]">
            <ChartComponent 
              data={chartData.map(d => ({ sensorId: d.sensorId, date: new Date(d.timestamp), value: d.risk }))}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>

      
    </div>
  );
}