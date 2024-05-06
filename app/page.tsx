'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [screenOrientation, setScreenOrientation] = useState("portrait");

  useEffect(() => {
    const getScreenOrientation = () => {
      return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
    };

    const handleOrientationChange = () => {
      setScreenOrientation(getScreenOrientation());
    };

    setScreenOrientation(getScreenOrientation());

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Define background images for portrait and landscape orientations
  const portraitBackground = "/background_portrait.png";
  const landscapeBackground = "/background_landscape.png";

  return (
    <div className="relative text-center" style={{ width: "100vw", height: "100vh", backgroundImage: `url(${screenOrientation === 'portrait' ? portraitBackground : landscapeBackground})` }}>
      {/* Image container */}
      <div className="relative w-full bottom-0 overflow-hidden" style={{ height: "100%" }}>
        <Image
          src="/cinetech_logo.png"
          alt="Cinetech logo"
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Button overlay */}
      <div className="absolute bottom-14 left-0 w-full h-1/3 flex justify-center">
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
  );
}
