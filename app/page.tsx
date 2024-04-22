import CinetechAssistant from "@/app/ui/cinetech-assistant";


export default function Home() {
  return (
    <main>
      <div className="mx-auto mb-12 max-w-custom text-center">
        <div className="m-4">
          <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-5xl">Cinetech Assistant</h1>
          <div className="mb-6 text-normal font-normal text-gray-500">
            This is an AI-powered technical assistant.
          </div>
        </div>
        <CinetechAssistant 
          assistantId="asst_za20xSFltb3gqCw3KusEdx82"
          greeting="Waddup, Chuck?"
          messageLimit={10}
        />
      </div>
    </main>
  );
}
