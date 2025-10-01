'use client';

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
  const bothConnected = session && isConnected;
  const needsConnection = !session || !isConnected;

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
              {session ? (
                <div className="bg-[#56DF7C] border-2 border-black shadow-celo-sm px-3 py-2 flex items-center gap-2">
                  <Github className="w-4 h-4 text-black" />
                  <span className="celo-body-small font-bold text-black">@{session.user?.githubUsername}</span>
                </div>
              ) : (
                <Button
                  onClick={() => signIn('github')}
                  className="bg-[#E70532] text-white border-2 border-black shadow-celo-sm px-3 py-2 flex items-center gap-2 hover:bg-red-600 rounded-none"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="celo-body-small font-bold">Connect GitHub</span>
                </Button>
              )}
            </div>

            {/* Wallet Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="bg-[#7CC0FF] border-2 border-black shadow-celo-sm px-3 py-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-black" />
                  <span className="celo-body-small font-bold text-black">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
              ) : (
                <div className="bg-[#E70532] border-2 border-black shadow-celo-sm p-1 rounded-none">
                  <div className="flex items-center gap-2 px-2">
                    <AlertCircle className="w-4 h-4 text-white" />
                    <ConnectButton />
                  </div>
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