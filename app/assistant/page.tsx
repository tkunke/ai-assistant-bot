import CinetechAssistant from "@/app/ui/cinetech-assistant";


export default function Home() {
  return (
    <main>
      <div className="mx-auto mb-12 max-w-custom text-center p-8 rounded-lg">
        <div className="m-4">
          <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-5xl">CineTech Assistant</h1>
          <div className="mb-6 text-normal font-normal text-gray-500">
            This the beta version of our new technical assistant powered by OpenAI.
          </div>
        </div>
        <CinetechAssistant 
          assistantId="asst_fmjzsttDthGzzJud4Vv2bDGq"
          greeting="Hey there! How can I help?"
          messageLimit={10}
        />
      </div>
    </main>
  );
}
