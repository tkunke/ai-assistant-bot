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
    <div className="relative text-center 100vh 100vw">
      {orientation === "landscape" ? (
        <div>
          {/* Image Containter */}
          <div className="relative w-full bottom-0 overflow-hidden">
          <Image
            src="/background-image_land.png"
            alt="Cinetech Logo"
            width="0"
            height="0"
            sizes="100vw"
            className="w-full h-full object-cover"
          />
          </div>
          {/* Button overlay */}
          <div className="absolute bottom-16 left-0 w-full h-1/3 flex justify-center">
            <div className="container mx-auto px-4 py-4 flex flex-col items-center">
              <div className="mb-3 md:mb-6">
                <Link href="/assistant">
                  <button className="px-4 md:px-12 py-2 md:py-3 bg-white text-gray-700 text-sm md:text-base rounded-full hover:bg-gray-200 hover:text-gray-900 transition duration-300 ease-in-out">
                  Try the Assistant
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : orientation === "portrait" ? (
        <div>
          {/* Image Containter */}
          <div className="relative w-full bottom-0 overflow-hidden">
          <Image
            src="/background-image_land.png"
            alt="Cinetech Logo"
            width="0"
            height="0"
            sizes="100vw"
            className="w-full h-full object-contain"
          />
          </div>
          {/* Button overlay */}
          <div className="absolute bottom-7 left-0 w-full h-1/3 flex justify-center">
            <div className="container mx-auto px-4 py-4 flex flex-col items-center">
              <div className="mb-2 md:mb-6">
                <Link href="/assistant">
                  <button className="xs:px-2 sm:px-4 md:px-12 xs:py-1 sm:py-2 md:py-3 bg-white text-gray-700 xs:text-xs sm:text-sm md:text-base rounded-full hover:bg-gray-200 hover:text-gray-900 transition duration-300 ease-in-out">
                  Try the Assistant
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default ResponsiveDiv;