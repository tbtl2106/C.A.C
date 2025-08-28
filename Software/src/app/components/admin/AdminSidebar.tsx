'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Sensors', path: '/admin/sensors', icon: '📡' },
    { name: 'Risk Analysis', path: '/admin/risk-analysis', icon: '⚠️' },
    { name: 'Reports', path: '/admin/reports', icon: '📑' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' }
  ];

  return (
    <aside className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors
                    ${pathname === item.path ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-red-50 transition-colors">
            <span className="mr-3">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;