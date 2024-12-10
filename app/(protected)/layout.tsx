import React from 'react'
import AuthGuard from '@/components/auth/auth-guard'

function Protected(
    {children}: {children: React.ReactNode}
) {
  return (
   <AuthGuard>
        {children}
   </AuthGuard>
  )
}

export default Protected