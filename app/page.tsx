"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";


export default function Home() {

  const { data: session } = useSession();
  console.log("session: ", session);

  return (
   <main className="flex flex-col items-center justify-center h-screen gap-5 text-3xl">
      <h1>
        Welcome to the test APP
      </h1>
    
      <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
        Sign In
      </Link>

      <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
        Sign Up
      </Link>
   </main>
  );
}
