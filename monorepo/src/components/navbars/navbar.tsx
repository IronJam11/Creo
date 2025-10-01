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
            <div className="w-12 h-12 bg-white border-2 border-black shadow-celo-sm flex items-center justify-center">
              <Image 
                src={LOGO_PATH} 
                alt="Logo" 
                width={24} 
                height={24}
                className="w-6 h-6"
              />
            </div>
            <span className={`text-2xl font-bold text-black ${WEBSITE_FONT}`}>
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
                    className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    href="/about" 
                    className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none"
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

              <NavigationMenuItem>
                <NavigationMenuTrigger className="inline-flex h-12 w-max items-center justify-center bg-white px-6 py-3 text-base font-bold text-black border-2 border-black shadow-celo-sm hover:bg-black hover:text-[#FCFF52] transition-all duration-200 rounded-none data-[state=open]:bg-black data-[state=open]:text-[#FCFF52]">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] bg-[#FF9A51] border-4 border-black shadow-celo rounded-none">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/services/web-dev"
                        className="block select-none space-y-2 bg-white border-2 border-black shadow-celo-sm p-4 leading-none no-underline outline-none transition-colors hover:bg-black hover:text-[#FCFF52] rounded-none"
                      >
                        <div className="text-lg font-bold leading-none">Web Development</div>
                        <p className="line-clamp-2 text-sm leading-snug font-medium">
                          Build modern web applications
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/services/consulting"
                        className="block select-none space-y-2 bg-white border-2 border-black shadow-celo-sm p-4 leading-none no-underline outline-none transition-colors hover:bg-black hover:text-[#FCFF52] rounded-none"
                      >
                        <div className="text-lg font-bold leading-none">Consulting</div>
                        <p className="line-clamp-2 text-sm leading-snug font-medium">
                          Expert technical consulting
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
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
                <div className="border-2 border-black shadow-celo-sm rounded-none overflow-hidden">
                  <ConnectButton showBalance={false} />
                </div>
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