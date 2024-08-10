'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Orientation = 'portrait' | 'landscape' | null;

const ResponsiveDiv = () => {
  // Initialize state with null to indicate the server doesn't know the orientation
  const [orientation, setOrientation] = useState<Orientation>(null);

  useEffect(() => {
    // Update the orientation based on the current window dimensions
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    // Call updateOrientation initially and also set it as the resize event handler
    updateOrientation();
    window.addEventListener('resize', updateOrientation);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  // Render based on orientation, or render nothing until the orientation is determined
  return (
    <div className="page-background">
      {orientation === "landscape" ? (
        <div>
          <header className="header-homepage">
            <div className="header-content">
              <h1 className="text-cyan-100" style={{ fontFamily: "'Limelight', 'sans-serif'" }}>
                Coming Soon!
              </h1>
            </div>
          </header>
          {/* Overlay Container */}
          <div className="overlay-image-container">
            <Image
              src="/cinetech_art.png"
              alt="Cinetech Logo"
              width="0"
              height="0"
              sizes="100vw"
              className="overlay-image"
            />
            {/* Button overlay */}
            <div className="absolute bottom-12 left-0 w-full h-1/3 flex justify-center" style={{ zIndex: '50'}}>
              <div className="container mx-auto px-4 py-4 flex flex-col items-center">
                <div className="mb-3 md:mb-6">
                </div>
              </div>
            </div>
          </div>
          <footer className="footer-homepage">
            <div className="footer-content">
              <h1 className="text-cyan-100" style={{ fontFamily: "'Limelight', 'sans-serif'" }}>
                The CineTech Assistant is designed as an advanced virtual aide for industry professionals and enthusiasts
              </h1>
            </div>
          </footer>
        </div>
      ) : orientation === "portrait" ? (
        <div>
          <header className="header-homepage">
            <div className="header-content">
              <h1 className="text-cyan-100" style={{ fontFamily: "'Limelight', 'sans-serif'" }}>
                Coming Soon!
              </h1>
            </div>
          </header>
          {/* Overlay container */}
          <div className="overlay-image-container">
            <Image
              src="/cinetech_art.png"
              alt="Cinetech Logo"
              width="0"
              height="0"
              sizes="100vw"
              className="overlay-image"
            />
            {/* Button overlay */}
            <div className="overlay-button-container">
                <div className="mb-2 md:mb-6">
                </div>
            </div>
          </div>
          <footer className="footer-homepage">
            <div className="footer-content">
              <h1 className="text-cyan-100" style={{ fontFamily: "'Limelight', 'sans-serif'" }}>
                The CineTech Assistant is designed as an advanced virtual aide for industry professionals and enthusiasts
              </h1>
            </div>
          </footer>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default ResponsiveDiv;