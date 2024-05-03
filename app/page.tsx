import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative text-center">
      {/* Image container */}
      <div className="relative w-full overflow-hidden bg-cover">
        <Image
          src="/Cinetech_Logo_Clean_Blue_001.png"
          alt="background"
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-50vh text-white">
        <div className="container mx-auto px-4 py-12 h-full flex flex-col justify-end">
          <div>
            <h1 className="text-xl md:text-10xl 2xl:text-5xl font-bold mb-4">
              Welcome to the CineTech Assistant
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
