import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative text-center">
      {/* Image container */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/Cinetech_Webste_Logo__Final_.png"
          alt="background"
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
      
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
