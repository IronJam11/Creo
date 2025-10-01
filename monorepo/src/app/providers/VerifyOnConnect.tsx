"use client"

import * as React from 'react'
import { useAccount, useReadContract, useDisconnect, useWriteContract } from 'wagmi'
import * as Dialog from '@radix-ui/react-dialog'
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
} from "@selfxyz/qrcode";
import { toast } from 'react-hot-toast'
import { CONTRACT_ABI } from '@/app/config/contractABI'

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x05B5C305e16382cF1C94165308b90D79A7334F50').trim() as `0x${string}`


export default function VerifyOnConnect() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { writeContractAsync } = useWriteContract()
  const [open, setOpen] = React.useState(false)
  const [selfApp, setSelfApp] = React.useState<any | null>(null)
  const [rebuilding, setRebuilding] = React.useState(false)
  const [qrKey, setQrKey] = React.useState(0)
  const [latestNullifier, setLatestNullifier] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Resolve ABI shape: support either exported as a flat array, or wrapped as [{ abi: [...] }]
  const resolvedAbi: any = Array.isArray(CONTRACT_ABI) && (CONTRACT_ABI as any)[0]?.abi
    ? (CONTRACT_ABI as any)[0].abi
    : (CONTRACT_ABI as any)

  const {
    data: isVerified,
    refetch,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: resolvedAbi,
    functionName: 'isAddressVerified',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address && CONTRACT_ADDRESS),
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  })

  // Minimal warnings
  React.useEffect(() => {
    if (!CONTRACT_ADDRESS) {
      toast.error('Missing NEXT_PUBLIC_CONTRACT_ADDRESS env. Set it in .env.local')
    }
  }, [])

  React.useEffect(() => {
    if (error) {
      console.warn('Contract read error:', error)
      // Only show error if user is connected and we have a contract address
      if (isConnected && CONTRACT_ADDRESS) {
        toast.error('Could not verify wallet status. Please check your network connection.')
      }
    }
  }, [error, isConnected])

  // Force a check on initial mount and whenever the wallet connects/changes
  React.useEffect(() => {
    if (isConnected && address) {
      refetch()
    }
  }, [isConnected, address, refetch])

  // Also re-check when the window regains focus
  React.useEffect(() => {
    function onFocus() {
      if (isConnected && address) refetch()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isConnected, address, refetch])

  function buildSelfApp(userAddr: string) {
    const app = new SelfAppBuilder({
      version: 2,
      appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Self App',
      scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'self-scope',
      endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'http://localhost:3000/api/verify',
      logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
      userId: userAddr,
      endpointType: 'https',
      userIdType: 'hex',
      userDefinedData: 'Verification',
      disclosures: {
        minimumAge: 0,
        excludedCountries: [],
        ofac: false,
      },
    }).build()
    return app
  }

  // Build Self app when we need to show the QR
  React.useEffect(() => {
    if (!isConnected || !address) {
      setSelfApp(null)
      return
    }
    // If not verified, prepare Self app
    if (isConnected && address && isVerified === false) {
      const app = buildSelfApp(address)
      setSelfApp(app)
      setQrKey((k) => k + 1)
    }
  }, [isConnected, address, isVerified])

  // Open modal when connected and not verified
  React.useEffect(() => {
    if (isConnected && address && isVerified === false) setOpen(true)
    if (isVerified === true) setOpen(false)
  }, [isConnected, address, isVerified])

  const handleSuccess = async () => {
    try {
      toast.success('Verified successfully!')
      // Fetch latest nullifier from backend
      const res = await fetch('/api/verify')
      const data = await res.json()
      const n = data?.nullifier ? BigInt(String(data.nullifier)) : null
      if (!n) {
        toast.error('No nullifier from backend. Please retry.')
      } else {
        // Prompt wallet to store nullifier on-chain
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: resolvedAbi,
          functionName: 'storeNullifier',
          args: [n],
          chainId: 11142220,
        })
        toast.success('Transaction sent: ' + String(hash).slice(0, 10) + '…')
      }

    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || 'Transaction failed')
    } finally {
      // Re-check on-chain and close modal
      setTimeout(() => {
        refetch()
      }, 3000)
      setOpen(false)
    }
  }

  if (!isConnected || !address || !CONTRACT_ADDRESS) return null

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        // If user closes the modal (ESC or clicking overlay), disconnect the wallet
        if (!next && isConnected) {
          try {
            disconnect()
          } catch {}
        }
        setOpen(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(1px)',
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffffff',
            padding: '20px',
            borderRadius: 0,
            width: 'min(92vw, 480px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '2px solid #000',
            color: '#000',
          }}
        >
          <Dialog.Title style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            Verify your address
          </Dialog.Title>
          <Dialog.Description style={{ opacity: 0.8, marginBottom: 16 }}>
            Your connected wallet isn't verified yet. Complete verification to continue.
          </Dialog.Description>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 0, border: '2px solid #000' }}>
              {(selfApp) ? (
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={handleSuccess}
                  onError={() => {
                    toast.error('Verification failed. Please try again.')
                  }}
                />
              ) : (
                <div style={{ color: '#000' }}>Preparing verification...</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => {
                if (!address) return
                setRebuilding(true)
                toast.loading('Retrying verification...', { id: 'retry' })
                try {
                  // Force unmount/remount to refresh QR
                  setSelfApp(null)
                  const app = buildSelfApp(address)
                  setSelfApp(app)
                  setQrKey((k) => k + 1)
                  toast.success('QR refreshed. Scan again.', { id: 'retry' })
                } catch (e) {
                  toast.error('Could not refresh QR. Please try again.', { id: 'retry' })
                } finally {
                  setRebuilding(false)
                }
              }}
              disabled={rebuilding}
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#000',
                fontWeight: 600,
                border: '2px solid #000',
                padding: '10px 12px',
                borderRadius: 0,
                cursor: 'pointer',
                opacity: rebuilding ? 0.7 : 1,
              }}
            >
              {rebuilding ? 'Refreshing…' : 'Retry'}
            </button>
          </div>

          {/* Auto-commit flow handled in onSuccess; no manual save button needed */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
