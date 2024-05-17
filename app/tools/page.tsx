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
    <div className="page-tools-background">
      {orientation === "landscape" ? (
        <div className="relative flex items-center w-full h-full">
          <div className="image-tools-container">
            <Image
              src="/cinetech_art.png"
              alt="Cinetech Art"
              width="700"
              height="700"
            />
          </div>
          {/* Button Array */}
          <div className="absolute bottom-12 left-0 w-full h-1/4 flex justify-center">
            <div className="contaner mx-auto flex flex-col items-center gap-4">
              <div className="container mx-auto flex flex-row items-center gap-4">
                  <Link href="/assistant">
                    <button className="button-tools">
                    Try the Assistant
                    </button>
                  </Link>
                  <Link href="/shot-composer">
                    <button className="button-tools">
                    Try ShotComp
                    </button>
                  </Link>
              </div>
              <div className="container mx-auto flex flex-row items-center gap-4">
                  <Link href="/assistant">
                    <button className="button-tools">
                    Lens Lore
                    </button>
                  </Link>
                  <Link href="/shot-composer">
                    <button className="button-tools">
                    CineMetrics Toolkit
                    </button>
                  </Link>
              </div>
            </div>
          </div>
        </div>
      ) : orientation === "portrait" ? (
        <div>

        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default ResponsiveDiv;