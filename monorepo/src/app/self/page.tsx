'use client'
import { useEffect, useState } from 'react'
import { countries, SelfQRcodeWrapper , SelfAppBuilder} from '@selfxyz/qrcode'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Verify() {
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const { address, isConnected } = useAccount()
  const [latestNullifier, setLatestNullifier] = useState<string | null>(null)
  const [latestUserIdentifier, setLatestUserIdentifier] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) {
      setSelfApp(null)
      return
    }

    const userId = address // or a UUID depending on your setup
    const SCOPE = process.env.NEXT_PUBLIC_SELF_SCOPE || 'self'
    const ENDPOINT = process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'http://localhost:3000/api/verify'
    
    const app = new SelfAppBuilder({
        version: 2,
        appName: "celution",
        scope: SCOPE,
        endpoint: ENDPOINT,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "https",
        userIdType: "hex",
        userDefinedData: "Aadhaar",
        disclosures: {
          minimumAge: 0,
          excludedCountries: [],
          ofac: false,
        }
      }).build();

    setSelfApp(app)
  }, [address, isConnected])

  const handleSuccessfulVerification = () => {
    // Persist the attestation / session result to your backend, then gate content
    console.log('Verified!')
  }

  // Subscribe to server-sent events for real-time updates from /api/verify/stream
  useEffect(() => {
    if (!isConnected) return

    const es = new EventSource('/api/verify/stream')

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLatestNullifier(data?.nullifier ?? null)
        setLatestUserIdentifier(data?.userIdentifier ?? null)
      } catch (e) {
        // ignore malformed messages
      }
    }

    es.onerror = () => {
      // Let the browser handle reconnection; if it closes, we'll clean up below
    }

    return () => {
      es.close()
    }
  }, [isConnected])

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {!isConnected ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <ConnectButton />
        </div>
      ) : selfApp ? (
        <>
          <div
            style={{
              background: '#1e293b',
              padding: '1.25rem',
              borderRadius: 12,
              display: 'inline-block',
            }}
          >
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={() => {
                console.error('Error: Failed to verify identity')
              }}
            />
          </div>
          <div
            style={{
              border: '1px solid #333',
              padding: '1rem',
              borderRadius: 8,
              background: '#121212',
              color: '#fff',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Latest From Server (SSE)</div>
            <div><strong>User Identifier:</strong> {latestUserIdentifier ?? '—'}</div>
            <div><strong>Nullifier:</strong> {latestNullifier ?? '—'}</div>
          </div>
        </>
      ) : (
        <div>
          <p>Preparing verification...</p>
        </div>
      )}
    </div>
  )
}