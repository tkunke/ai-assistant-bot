import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative text-center">
      {/* Image container */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/Cinetech_Webste_Logo_Background0001.png"
          width={1920}
          height={1080}
          alt="Background"
          className="opacity-100"
        />
      </div>
      
      {/* Text overlay */}
      <div className="absolute top-1/3 left-0 w-full text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Text above the button */}
          <div className="mb-8">
            <h1 className="text-7xl font-bold mb-4">
              Welcome to the CineTech Assistant
            </h1>
            <p className="text-2xl">
              A Technical Assistant Using OpenAI
            </p>
          </div>
        </div>
      </div>

      {/* Description and button container */}
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">
          The CineTech Assistant is designed as an advanced virtual aide for
          filmmakers, cinematographers, and enthusiasts engaged in the cinematic arts and technologies.
          It is tailored to serve a wide spectrum of needs in the film and video production domains.
        </p>
        <Link href="/assistant">
          <button className="px-12 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition">
            Try the Assistant
          </button>
        </Link>
      </div>
    </div>
  );
}
