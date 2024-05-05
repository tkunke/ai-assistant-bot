'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MdHeight } from 'react-icons/md';
import {useMediaQuery} from 'react-responsive';

export default function Home() {
  const [screenOrientation, setScreenOrientation] = useState("portrait");

  useEffect(() => {
    const getScreenOrientation = () => {
      return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
    };

    const handleOrientationChange = () => {
      setScreenOrientation(getScreenOrientation());
    };

    setScreenOrientation(getScreenOrientation()); // Initial check

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Define background images for portrait and landscape orientations
  const portraitBackground = "/background_portrait.png";
  const landscapeBackground = "/background_landscape.png";

  // Render different background images based on the screen orientation
  return (
    <div className="relative text-center" style={{ width: "100vw", height: "100vh", backgroundImage: `url(${screenOrientation === 'portrait' ? portraitBackground : landscapeBackground})` }}>
      {/* Add other content here */}
    </div>
  );
}