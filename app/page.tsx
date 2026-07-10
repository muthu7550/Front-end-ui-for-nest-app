"use client"

import { useRouter } from "next/navigation"; 

export default function Home() {

      const router = useRouter(); 

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <button className="btn btn-success" onClick={()=> router.push('/auth')}>Test here</button>
    </div>
  );
}
