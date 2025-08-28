interface StatsCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down';
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`mt-4 flex items-center ${
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      }`}>
        <svg
          className={`w-4 h-4 ${trend === 'down' ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </div>
    </div>
  );
};

export default StatsCard;