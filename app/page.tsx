import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative text-center">
      <div className="relative w-full">
        <Image
          src="/CameraTechAssistant_Pic.png"
          layout="responsive"
          width={100}
          height={100}
          objectFit="cover"
          alt="Background"
          className="opacity-90"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <h1 className="text-white text-4xl font-bold mb-4">
            Welcome to Our Service!
          </h1>
          <p className="text-white text-lg mb-8">
            Experience the new way to interact with applications.
          </p>
          <Link href="/assistant">
            <button className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">
              Try the Assistant
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}