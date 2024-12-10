'use client';


import { signOut } from 'next-auth/react';
import {  useRouter } from 'next/navigation'
import React from 'react'

function Dashboard() {

    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in');
    }

  return (
    <main className='flex items-center justify-center gap-10'>
        Dashboard

        <button
         onClick={handleSignOut}
         className='text-blue-600 hover:text-blue-800'
        >
            Sign Out
        </button>
    </main>
  )
}

export default Dashboard