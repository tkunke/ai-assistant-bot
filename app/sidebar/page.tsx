import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './sidebar.module.css';

const Sidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };

    handleResize(); // Check the screen size on component mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <button className={styles.hamburger} onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`${styles.sidebar} ${isSidebarVisible ? styles.visible : styles.hidden}`}>
        <div className={styles.topSection}>
          <Link href="/">
            <Image
              src="/cinetech_art.png"
              alt="Cinetech Logo"
              width="200"
              height="200"
            />
          </Link>
        </div>
        <div className={styles.bottomSection}>
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="hover:bg-gray-700 p-2 rounded">
              Home
            </Link>
            <Link href="/about" className="hover:bg-gray-700 p-2 rounded">
              About
            </Link>
            <Link href="/contact" className="hover:bg-gray-700 p-2 rounded">
              Contact
            </Link>
            {/* Add more links as needed */}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
