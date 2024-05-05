'use client';
import Image from 'next/image';
import Link from 'next/link';
import { MdHeight } from 'react-icons/md';
import {useMediaQuery} from 'react-responsive';

export default function Home() {
  // Function to check the screen orientation
  const getScreenOrientation = () => {
    return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
  };

  // Define background images for portrait and landscape orientations
  const portraitBackground = "/background_portrait.png";
  const landscapeBackground = "/background_landscape.png";

  // Determine the current screen orientation
  const screenOrientation = getScreenOrientation();

  // Render different background images based on the screen orientation
  return (
    <div className="relative text-center" style={{ width: "100vw", height: "100vh", backgroundImage: `url(${screenOrientation === 'portrait' ? portraitBackground : landscapeBackground})` }}>
      {/* Add other content here */}
    </div>
  );
}