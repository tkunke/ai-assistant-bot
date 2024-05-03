'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useMediaQuery} from 'react-responsive';

export default function Home() {
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-device-width: 1224px)'
  });

  const backgroundImageStyle = {
    backgroundImage: `url(/Cinetech_Webste_Logo__Final_.png)`,
    backgroundSize: isDesktopOrLaptop ? 'cover' : 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="relative text-center" style={backgroundImageStyle}>
      {/* Button overlay */}
      <div className="absolute bottom-20 left-0 w-full h-1/3 flex items-center justify-center">
        <div className="container mx-auto px-4 py-6 md:py-12 flex flex-col items-center">
          <div className="mb-6">
            <Link href="/assistant">
              <button className="px-6 py-2 md:px-12 md:py-3 bg-white text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition">
                Try the Assistant
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}