import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './sidebar.module.css';

const Sidebar = () => (
  <div className={styles.sidebar}>
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
);

export default Sidebar;
