// components/PaymentStatus.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function PaymentStatus() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Order ID: {sessionId}</p>
    </div>
  )
}