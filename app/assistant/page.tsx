import CinetechAssistant from "@/app/ui/cinetech-assistant";
import '/app/globals.css';


export default function Home() {
  return (
    <div>
      <header className="header">
        <div className="mx-auto mb-12 max-w-custom text-center p-3 rounded-lg" style={{ height: '60px' }}>
            <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-5xl">CineTech Assistant</h1>
            <p className="text-gray-800">This is the beta version of our new technical assistant powered by OpenAI.</p>
        </div>
      </header>
      <main>
        <div className="mx-auto mb-12 max-w-custom text-center p-8 rounded-lg">
          <CinetechAssistant 
            assistantId="asst_fmjzsttDthGzzJud4Vv2bDGq"
            greeting="Hey there! How can I help?"
            messageLimit={10}
          />
        </div>
      </main>
    </div>
  );
}
