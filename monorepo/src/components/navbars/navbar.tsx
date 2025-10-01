'use client';

import { useState, useEffect } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useSidebar } from "@/components/ui/sidebar"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAccount } from 'wagmi';
import { Github, Wallet, AlertCircle } from "lucide-react";
import { WEBSITE_LOGO_PATH as LOGO_PATH, WEBSITE_NAME, WEBSITE_TITLE_FONT as WEBSITE_FONT } from "@/utils/constants/navbarConstants"

export function Navbar() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  const bothConnected = session && isConnected;
  const needsConnection = !session || !isConnected;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FCFF52] font-gt-alpina">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-4">
            
            <span className={`text-4xl text-black ${WEBSITE_FONT} tracking-tight`}>
              {WEBSITE_NAME}
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/" 
                    className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-gray-100 hover:shadow-celo transition-all duration-200 rounded-none hover:-translate-y-0.5"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/about" 
                    className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-gray-100 hover:shadow-celo transition-all duration-200 rounded-none hover:-translate-y-0.5"
                  >
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/issues" 
                    className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
                  >
                    Issues
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/docs" 
                    className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
                  >
                    Docs
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            {/* GitHub Status */}
            <div className="flex items-center gap-2">
              {mounted ? (
                session ? (
                  <div className="relative group">
                    <div className="bg-[#56DF7C] border-2 border-black shadow-celo-sm px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#4CC968] transition-colors">
                      <Github className="w-4 h-4 text-black" />
                      <span className="celo-body-small font-bold text-black">@{session.user?.githubUsername}</span>
                    </div>
                    {/* Dropdown menu */}
                    <div className="absolute top-full right-0 mt-2 bg-white border-4 border-black shadow-celo-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-48">
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-3 py-2 mb-2">
                          <Github className="w-4 h-4 text-black" />
                          <div>
                            <p className="celo-body-small font-bold text-black">@{session.user?.githubUsername}</p>
                            <p className="text-xs text-gray-600">{session.user?.email}</p>
                          </div>
                        </div>
                        <hr className="border-black border-t-2 mb-2" />
                        <Button
                          onClick={() => signOut()}
                          className="w-full bg-[#E70532] text-white border-2 border-black shadow-celo-sm px-3 py-2 flex items-center gap-2 hover:bg-red-600 rounded-none text-left justify-start"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span className="celo-body-small font-bold">Disconnect GitHub</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => signIn('github')}
                    className="bg-[#E70532] text-white border-2 border-black shadow-celo-sm px-3 py-2 flex items-center gap-2 hover:bg-red-600 rounded-none"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="celo-body-small font-bold">Connect GitHub</span>
                  </Button>
                )
              ) : (
                // Skeleton/placeholder during hydration
                <div className="bg-gray-200 border-2 border-black shadow-celo-sm px-3 py-2 animate-pulse">
                  <div className="w-32 h-4 bg-gray-300 rounded"></div>
                </div>
              )}
            </div>

            {/* Wallet Status */}
            <div className="flex items-center gap-2">
              {mounted ? (
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted: connectMounted,
                  }) => {
                    const ready = connectMounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
                              >
                                <Wallet className="w-5 h-5 mr-2" />
                                Connect Wallet
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                className="inline-flex h-12 w-max items-center justify-center bg-[#E70532] px-6 py-3 text-base font-bold text-white border-2 border-black shadow-celo-sm hover:bg-red-600 transition-all duration-200 rounded-none"
                              >
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Wrong Network
                              </button>
                            );
                          }

                          return (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={openChainModal}
                                className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 20,
                                      height: 20,
                                      borderRadius: 999,
                                      overflow: 'hidden',
                                      marginRight: 8,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? 'Chain icon'}
                                        src={chain.iconUrl}
                                        style={{ width: 20, height: 20 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>

                              <button
                                onClick={openAccountModal}
                                className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
                              >
                                <div className="w-5 h-5 bg-[#FF6B9D] rounded-full mr-2 flex items-center justify-center">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                {account.displayName}
                                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              ) : (
                // Skeleton/placeholder during hydration
                <div className="bg-gray-200 border-2 border-black shadow-celo-sm px-3 py-2 animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                </div>
              )}
            </div>

            {/* Onboarding Prompt */}
            {needsConnection && (
              <Link href="/onboarding">
                <Button className="bg-black text-[#FCFF52] border-2 border-black shadow-celo-sm hover:bg-gray-800 rounded-none font-bold">
                  Complete Setup
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}