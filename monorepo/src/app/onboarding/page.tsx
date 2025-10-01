"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, User, Building, Github, Wallet, Zap, CheckCircle, DollarSign, Users, Activity, TrendingUp, BarChart3 } from "lucide-react";

export default function OnboardingPage() {
  const handleGetStarted = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#FCFF52] font-gt-alpina">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-50 relative overflow-hidden">
        {/* Enhanced background geometric elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-black/20 opacity-60 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-black/18 opacity-45 animate-pulse delay-300"></div>
        
        {/* Additional light squares - Top Layer */}
        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-black/16 opacity-55 animate-pulse delay-500"></div>
        <div className="absolute top-40 left-32 w-16 h-16 border-2 border-black/22 opacity-50 animate-pulse delay-700"></div>
        <div className="absolute top-60 right-32 w-28 h-28 border-2 border-black/14 opacity-58 animate-pulse delay-900"></div>
        
        {/* Middle Layer */}
        <div className="absolute bottom-40 left-20 w-18 h-18 border-2 border-black/17 opacity-52 animate-pulse delay-1100"></div>
        <div className="absolute bottom-32 right-40 w-22 h-22 border-2 border-black/19 opacity-56 animate-pulse delay-1300"></div>
        <div className="absolute top-72 left-16 w-14 h-14 border-2 border-black/15 opacity-48 animate-pulse delay-1500"></div>
        
        {/* Lower Layer */}
        <div className="absolute bottom-60 right-16 w-26 h-26 border-2 border-black/20 opacity-53 animate-pulse delay-1700"></div>
        <div className="absolute top-80 right-60 w-12 h-12 border-2 border-black/23 opacity-57 animate-pulse delay-1900"></div>
        <div className="absolute bottom-72 left-40 w-30 h-30 border-2 border-black/16 opacity-54 animate-pulse delay-2100"></div>
        
        {/* Far Background Layer */}
        <div className="absolute top-96 left-60 w-10 h-10 border-2 border-black/12 opacity-42 animate-pulse delay-2300"></div>
        <div className="absolute bottom-80 right-80 w-36 h-36 border-2 border-black/13 opacity-47 animate-pulse delay-2500"></div>
        <div className="absolute top-44 left-80 w-8 h-8 border-2 border-black/25 opacity-59 animate-pulse delay-2700"></div>
        
        <div className="text-center space-y-8 relative z-10">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto">
            {/* Animated title */}
            <div className="mb-6 group">
              <h1 className="celo-display-thin text-black italic relative overflow-hidden">
                <span className="inline-block transform transition-all duration-700 hover:scale-105 hover:-rotate-1">
                  Welcome  to CREO
                </span>
                <span className="inline-block transform transition-all duration-700 delay-100 hover:scale-110 hover:rotate-1 text-black relative">
                  
                  {/* Underline animation */}
                  <div className="absolute -bottom-2 left-0 w-0 h-1 bg-black transition-all duration-1000 group-hover:w-full"></div>
                </span>
              </h1>
            </div>
            
            {/* Enhanced description */}
            <div className="relative mb-12">
              <p className="celo-body-large text-black max-w-3xl mx-auto leading-relaxed transform transition-all duration-500 hover:scale-[1.02]">
                Your comprehensive{' '}
                <em className="italic relative inline-block">
                  <span className="relative z-10">purpose-driven</span>
                  <div className="absolute inset-0 bg-[#329F3B]/20 -skew-x-12 transform opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </em>{' '}
                platform for building on the{' '}
                <span className="font-bold relative inline-block">
                  <span className="relative z-10">Celo blockchain</span>
                  <div className="absolute inset-0 bg-[#FCFF52]/80 -skew-x-6 transform opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </span>
                . Connect with GitHub, deploy smart contracts, and create decentralized applications with our integrated development tools.
              </p>
            </div>
            
            {/* Enhanced buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <div className="group relative">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-black text-[#FCFF52] px-8 py-4 border-4 border-black hover:bg-gray-800 rounded-none font-bold text-lg shadow-celo transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl relative z-10"
                >
                  <ArrowRight className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                  Start Building
                </Button>
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-black/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
              </div>
              
              
            </div>

            {/* Floating elements */}
            <div className="absolute -top-10 -left-10 w-6 h-6 bg-[#329F3B] opacity-60 animate-bounce delay-700"></div>
            <div className="absolute -top-20 right-20 w-4 h-4 bg-[#7CC0FF] opacity-60 animate-bounce delay-1000"></div>
            <div className="absolute -bottom-10 -right-10 w-8 h-8 bg-[#FF9A51] opacity-60 animate-bounce delay-500"></div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FCFF52]/20 pointer-events-none"></div>
          </div>
        </div>
      </section>
      {/* Platform Statistics Dashboard */}
      <section className="bg-[#FCFF52] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="celo-heading-1 text-black mb-6 italic">
              Platform Statistics
            </h2>
            <p className="celo-body-large text-black max-w-2xl mx-auto">
              Real-time metrics and statistics from the Celo blockchain ecosystem
            </p>
          </div>
          
          {/* Statistics Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Value Locked */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <DollarSign className="w-6 h-6 text-white group-hover:animate-pulse" />
                </div>
                <span className="text-sm font-bold text-[#329F3B] bg-[#329F3B]/10 px-2 py-1 border border-[#329F3B] group-hover:bg-[#329F3B] group-hover:text-white transition-all duration-300">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">$2.4B</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Total Value Locked</p>
            </div>

            {/* Active Users */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Users className="w-6 h-6 text-white group-hover:animate-bounce" />
                </div>
                <span className="text-sm font-bold text-[#7CC0FF] bg-[#7CC0FF]/10 px-2 py-1 border border-[#7CC0FF] group-hover:bg-[#7CC0FF] group-hover:text-white transition-all duration-300">+8.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">1.2M</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Active Users</p>
            </div>

            {/* Daily Transactions */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Activity className="w-6 h-6 text-white group-hover:animate-pulse" />
                </div>
                <span className="text-sm font-bold text-[#FF9A51] bg-[#FF9A51]/10 px-2 py-1 border border-[#FF9A51] group-hover:bg-[#FF9A51] group-hover:text-white transition-all duration-300">+15.7%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">45.2K</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Daily Transactions</p>
            </div>

            {/* Network Growth */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-6 h-6 text-white group-hover:animate-bounce" />
                </div>
                <span className="text-sm font-bold text-[#B490FF] bg-[#B490FF]/10 px-2 py-1 border border-[#B490FF] group-hover:bg-[#B490FF] group-hover:text-white transition-all duration-300">+22.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">98.7%</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Network Uptime</p>
            </div>
          </div>

          {/* Secondary Statistics Row */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Smart Contracts Deployed */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Building className="w-6 h-6 text-white group-hover:animate-pulse" />
                </div>
                <span className="text-sm font-bold text-[#56DF7C] bg-[#56DF7C]/10 px-2 py-1 border border-[#56DF7C] group-hover:bg-[#56DF7C] group-hover:text-white transition-all duration-300">+5.4%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">15,847</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Smart Contracts Deployed</p>
              <div className="mt-4 text-xs text-black/60 group-hover:text-black/80 transition-colors duration-300">
                <span className="font-semibold">234</span> contracts deployed today
              </div>
            </div>

            {/* GitHub Repositories */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Github className="w-6 h-6 text-[#FCFF52] group-hover:animate-spin" />
                </div>
                <span className="text-sm font-bold text-black bg-black/10 px-2 py-1 border border-black group-hover:bg-black group-hover:text-white transition-all duration-300">+3.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">3,456</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Connected Repositories</p>
              <div className="mt-4 text-xs text-black/60 group-hover:text-black/80 transition-colors duration-300">
                <span className="font-semibold">89</span> new connections this week
              </div>
            </div>

            {/* Development Activity */}
            <div className="group relative bg-white border-4 border-black shadow-celo p-6 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1">
              {/* Animated border outline */}
              <div className="absolute -bottom-1 -right-1 w-0 h-0 bg-black transition-all duration-500 group-hover:w-full group-hover:h-full -z-10 opacity-10"></div>
              <div className="absolute -bottom-2 -right-2 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"></div>
              <div className="absolute -bottom-2 -right-2 w-1 h-0 bg-black transition-all duration-300 delay-150 group-hover:h-full"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-black border-2 border-black p-3 shadow-celo-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-6 h-6 text-white group-hover:animate-bounce" />
                </div>
                <span className="text-sm font-bold text-[#FF9A51] bg-[#FF9A51]/10 px-2 py-1 border border-[#FF9A51] group-hover:bg-[#FF9A51] group-hover:text-white transition-all duration-300">+18.3%</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-1 transition-colors duration-300">892</h3>
              <p className="text-sm text-black/70 font-medium group-hover:text-black/90 transition-colors duration-300">Active Developers</p>
              <div className="mt-4 text-xs text-black/60 group-hover:text-black/80 transition-colors duration-300">
                <span className="font-semibold">147</span> commits pushed today
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Onyx on Prosperity Yellow */}
      <section className="bg-[#FCFF52] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="celo-heading-1 text-black mb-6 italic">
              How It Works
            </h2>
            <p className="celo-body-large text-black max-w-2xl mx-auto">
              Get started with Creo in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting flow lines */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#329F3B] via-[#7CC0FF] to-[#FF9A51] opacity-30"></div>
            
            {/* Step 1 */}
            <div className="group text-center cursor-pointer transition-all duration-700 hover:-translate-y-2 relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-[#329F3B]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform scale-95 group-hover:scale-105"></div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-[#329F3B]/60 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 animate-pulse"></div>
              <div className="absolute -top-6 right-8 w-2 h-2 bg-[#56DF7C]/60 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-400 animate-bounce"></div>
              
              <div className="relative z-10">
                {/* Enhanced circle with multiple layers */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Outer ring animation */}
                  <div className="absolute inset-0 border-2 border-[#329F3B]/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-700"></div>
                  <div className="absolute inset-0 border border-[#329F3B]/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-125"></div>
                  
                  {/* Main circle */}
                  <div className="relative w-20 h-20 bg-[#329F3B] border-4 border-black shadow-celo flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-[#329F3B]/30 transition-all duration-700 group-hover:bg-[#2a8332]">
                    <span className="celo-heading-4 text-white transform transition-all duration-700 group-hover:scale-110">1</span>
                  </div>
                  
                  {/* Inner accent dot */}
                  <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#FCFF52] border border-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 transform scale-0 group-hover:scale-100"></div>
                </div>
                
                <h3 className="celo-heading-4 text-black mb-4 group-hover:text-[#329F3B] transition-colors duration-700 transform group-hover:scale-105">Connect Your Accounts</h3>
                <p className="celo-body text-black group-hover:text-black/90 transition-all duration-700 transform group-hover:scale-102">
                  Use the navbar to connect your GitHub account and Celo wallet to get started
                </p>
                
                {/* Subtle bottom accent line */}
                <div className="mt-6 h-0.5 bg-[#329F3B] opacity-0 group-hover:opacity-100 transition-all duration-1000 transform scale-x-0 group-hover:scale-x-100"></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group text-center cursor-pointer transition-all duration-700 hover:-translate-y-2 relative delay-100">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-[#7CC0FF]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform scale-95 group-hover:scale-105"></div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-5 left-6 w-4 h-4 bg-[#7CC0FF]/50 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-[#B490FF]/60 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500 animate-bounce"></div>
              
              <div className="relative z-10">
                {/* Enhanced circle with multiple layers */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Outer ring animation */}
                  <div className="absolute inset-0 border-2 border-[#7CC0FF]/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-700"></div>
                  <div className="absolute inset-0 border border-[#7CC0FF]/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-125"></div>
                  
                  {/* Main circle */}
                  <div className="relative w-20 h-20 bg-[#7CC0FF] border-4 border-black shadow-celo flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-[#7CC0FF]/30 transition-all duration-700 group-hover:bg-[#6BB3FF]">
                    <span className="celo-heading-4 text-black transform transition-all duration-700 group-hover:scale-110">2</span>
                  </div>
                  
                  {/* Inner accent dot */}
                  <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#FCFF52] border border-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 transform scale-0 group-hover:scale-100"></div>
                </div>
                
                <h3 className="celo-heading-4 text-black mb-4 group-hover:text-[#7CC0FF] transition-colors duration-700 transform group-hover:scale-105">Set Up Your Project</h3>
                <p className="celo-body text-black group-hover:text-black/90 transition-all duration-700 transform group-hover:scale-102">
                  Create or import your project repository and configure your smart contract deployment
                </p>
                
                {/* Subtle bottom accent line */}
                <div className="mt-6 h-0.5 bg-[#7CC0FF] opacity-0 group-hover:opacity-100 transition-all duration-1000 transform scale-x-0 group-hover:scale-x-100"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group text-center cursor-pointer transition-all duration-700 hover:-translate-y-2 relative delay-200">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-[#FF9A51]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform scale-95 group-hover:scale-105"></div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-3 right-4 w-2 h-2 bg-[#FF9A51]/70 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-400 animate-pulse"></div>
              <div className="absolute -bottom-6 left-8 w-4 h-4 bg-[#FCFF52]/60 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-600 animate-bounce"></div>
              <div className="absolute top-4 -left-6 w-3 h-3 bg-[#FF6B9D]/50 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500 animate-pulse"></div>
              
              <div className="relative z-10">
                {/* Enhanced circle with multiple layers */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Outer ring animation */}
                  <div className="absolute inset-0 border-2 border-[#FF9A51]/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-700"></div>
                  <div className="absolute inset-0 border border-[#FF9A51]/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-125"></div>
                  
                  {/* Main circle */}
                  <div className="relative w-20 h-20 bg-[#FF9A51] border-4 border-black shadow-celo flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-[#FF9A51]/30 transition-all duration-700 group-hover:bg-[#FF8A31]">
                    <span className="celo-heading-4 text-black transform transition-all duration-700 group-hover:scale-110">3</span>
                  </div>
                  
                  {/* Inner accent dot */}
                  <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#FCFF52] border border-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 transform scale-0 group-hover:scale-100"></div>
                </div>
                
                <h3 className="celo-heading-4 text-black mb-4 group-hover:text-[#FF9A51] transition-colors duration-700 transform group-hover:scale-105">Deploy & Monitor</h3>
                <p className="celo-body text-black group-hover:text-black/90 transition-all duration-700 transform group-hover:scale-102">
                  Deploy your contracts to Celo and monitor performance with our analytics dashboard
                </p>
                
                {/* Subtle bottom accent line */}
                <div className="mt-6 h-0.5 bg-[#FF9A51] opacity-0 group-hover:opacity-100 transition-all duration-1000 transform scale-x-0 group-hover:scale-x-100"></div>
              </div>
            </div>
            
            {/* Additional floating background elements */}
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#56DF7C]/30 animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-[#B490FF]/20 animate-bounce delay-1500"></div>
            <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-[#FF6B9D]/40 animate-ping delay-2000"></div>
          </div>
        </div>
      </section>

      {/* CTA Section - Snow on Fig */}
      

      {/* Footer - Onyx on Prosperity Yellow */}
      <footer className="bg-[#FCFF52] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="celo-heading-5 text-black mb-4">Creo</h3>
              <p className="celo-body-small text-black">
                Your comprehensive platform for building on the Celo blockchain with integrated development tools.
              </p>
            </div>
            
            <div>
              <h4 className="celo-label text-black mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">Smart Contracts</a></li>
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">GitHub Integration</a></li>
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">Wallet Tools</a></li>
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="celo-label text-black mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">Documentation</a></li>
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">GitHub</a></li>
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">Community</a></li>
                <li><a href="#" className="celo-body-small text-black hover:text-gray-700">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="celo-heading-5 text-black">Creo</div>
              <div className="celo-body-small text-black">
                Built with ❤️ for the Celo ecosystem
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}