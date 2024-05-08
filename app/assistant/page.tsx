'use client';
import { useEffect, useState } from "react";
import CinetechAssistant from "@/app/ui/cinetech-assistant";
import '/app/globals.css';


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
    <div className="relative text-center" style={{ width: "100vw", height: "100vh" }}>
      <header className="header">
        <div className="mx-auto mb-12 max-w-custom text-center p-3 rounded-lg" style={{ height: '5rem' }}>
        <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-none tracking-tight text-gray-900">CineTech Assistant</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-800">This is the beta version of our new technical assistant powered by OpenAI.</p>
        </div>
      </header>
      <main>
        <div className="mx-auto lg:mr-20 lg:ml-20 mb-12 text-sm sm:text-base md:text-lg text-center p-8 rounded-lg"> 
          <CinetechAssistant 
            assistantId="asst_fmjzsttDthGzzJud4Vv2bDGq"
            greeting="Hey there! How can I help?"
          />
        </div>
      </main>
    </div>
  );
}
