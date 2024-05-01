import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative text-center">
      {/* Image container */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/Cinetech_Logo_Clean_Blue_001.png"
          width={1920}
          height={1080}
          alt="Background"
          className="opacity-100"
        />
      </div>
      
      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 w-full h-full text-white">
        <div className="container mx-auto px-4 py-12 h-full flex flex-col justify-end">
          {/* Text above the button */}
          <div>
            <h1 className="text-7xl font-bold mb-4">
              Welcome to the CineTech Assistant
            </h1>
            <p className="text-2xl p-8">
              A Technical Assistant Using OpenAI
            </p>
            <p className="text-xl mb-4">
              The CineTech Assistant is designed as an advanced virtual aide for
              filmmakers, cinematographers, and enthusiasts engaged in the cinematic arts and technologies.
              It is specifically designed to serve a wide spectrum of needs in the film and video production domains.
            </p>
            <Link href="/assistant">
              <button className="px-12 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition">
                Try the Assistant
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


