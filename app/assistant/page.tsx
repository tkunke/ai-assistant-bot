'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from "react";
import CinetechAssistant from "@/app/ui/cinetech-assistant";
import Sidebar from '../sidebar/page';
import styles from './assistant.module.css';

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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <header className={styles.header}></header>
        <main className={styles.main}>
          <CinetechAssistant 
            assistantId="asst_fmjzsttDthGzzJud4Vv2bDGq"
            greeting="Hey there! How can I help?"
          />
        </main>
      </div>
    </div>
  );
}
