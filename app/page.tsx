import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative text-center">
      {/* Image container */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/Cinetech_Logo_Clean_Blue_001.png"
          alt="background"
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
      
      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 w-full h-full text-white">
        <div className="container mx-auto px-4 py-12 h-full flex flex-col justify-end">
          {/* Text above the button */}
          <div>
            <h1 className="text-4xl md:text-7xl font-bold mb-4"> {/* Adjusted text size */}
              Welcome to the CineTech Assistant
            </h1>
            <p className="text-lg md:text-2xl p-4 md:p-8"> {/* Adjusted text size */}
              A Technical Assistant Using OpenAI
            </p>
            <p className="text-base md:text-xl mb-4"> {/* Adjusted text size */}
              The CineTech Assistant is designed as an advanced virtual aide for
              filmmakers, cinematographers, and enthusiasts engaged in the cinematic arts and technologies.
              It is specifically designed to serve a wide spectrum of needs in the film and video production domains.
            </p>
            <Link href="/assistant">
              <button className="px-6 py-2 md:px-12 md:py-3 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition"> {/* Adjusted button size */}
                Try the Assistant
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
