// src/app/components/layout/Sidebar.tsx
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { title: 'Home', path: '/' },
    { title: 'Monitor', path: '/monitor' },
    { title: 'About', path: '/about' },
    { title: 'Contact', path: '/contact' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">Landslide Detection</h1>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className="block p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;