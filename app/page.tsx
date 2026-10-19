 
   "use client"
          import { useRouter } from "next/navigation";

export default function Home() {

   const router = useRouter();

   function handleGetStarted(){
    console.log("Button clicked!");
    router.push("/about");
   }
  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-center text-black">

      <h1 className="text-9xl font-bold">
        NOVA
      </h1>

      <p className="text-base mt-8">
        your money, in perspective.
      </p>

      <button 
      onClick={handleGetStarted}
      className="bg-black text-white px-6 py-3 rounded-full mt-5">
        Get Started
      </button>

    </div>
  )
}