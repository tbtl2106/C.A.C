// src/app/components/layout/Header.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import '../wwwroot/css/animate.min.css';
import '../wwwroot/css/bootstrap.min.css';
import '../wwwroot/css/bootstrap-icons.css';
import '../wwwroot/css/boxicons.min.css';
import '../wwwroot/css/glightbox.min.css';
import '../wwwroot/css/swiper-bundle.min.css';
import '../wwwroot/css/style.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Monitor', href: '/monitor' },
    { name: 'Report', href: '/report'},
    { name: 'Contact', href: '/contact' },
    { name: 'Admin', href: '/admin/login' },
  ];

  return (
    <header id = "header" className="d-flex align-items-center">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="logo">
            <h1><a>landslide detection and warning system</a></h1>
            {/* Uncomment below if you prefer to use an image logo
            {/* <a href="index.html">
            <img src="assets/img/logo.png" alt="" className="img-fluid"></a> */}
        </div>
        <nav id="navbar" className="navbar">
          <div className="hidden md:flex items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                    pathname === item.href
                  } px-4 py-2 text-sm font-medium`}>
                {item.name}
              </Link>
            ))}
          </div>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
        {/* .navbar */}
      </div>
    </header>
  );
};

export default Header;