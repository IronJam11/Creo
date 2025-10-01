"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, User, Building, Github, Wallet, Zap, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const handleGetStarted = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#FCFF52] font-gt-alpina">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-50">
        <div className="text-center space-y-8">
          {/* Hero Icon */}
          
          {/* Hero Content - Onyx on Prosperity Yellow */}
          <div className="max-w-4xl mx-auto">

            
            <h1 className="celo-display-thin text-black mb-6 italic">
              Welcome to Celution
            </h1>
            
            <p className="celo-body-large text-black max-w-3xl mx-auto mb-12">
              Your comprehensive <em className="italic">purpose-driven</em> platform for building on the Celo blockchain. Connect with GitHub, deploy smart contracts, and create decentralized applications with our integrated development tools.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                className="bg-black text-[#FCFF52] px-8 py-4 border-4 border-black hover:bg-gray-800 rounded-none font-bold text-lg shadow-celo"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Building
              </Button>
              
              <Button 
                variant="outline"
                className="bg-white text-black px-8 py-4 border-4 border-black hover:bg-black hover:text-[#FCFF52] rounded-none font-bold text-lg shadow-celo"
              >
                <Github className="w-5 h-5 mr-2" />
                Connect GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section - Onyx on Prosperity Yellow */}
      <section className="bg-[#FCFF52] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="celo-heading-1 text-black mb-6 italic">
              Platform Features
            </h2>
            <p className="celo-body-large text-black max-w-2xl mx-auto">
              Everything you need to build, deploy, and manage applications on the Celo blockchain
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Smart Contracts */}
            <div className="bg-[#7CC0FF] border-4 border-black shadow-celo p-8 hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="bg-black border-2 border-black p-4 w-fit mx-auto mb-6 shadow-celo-sm">
                <Building className="w-12 h-12 text-[#FCFF52]" />
              </div>
              <h3 className="celo-heading-5 text-black mb-4 text-center">Smart Contracts</h3>
              <p className="celo-body-small text-black text-center">
                Deploy and interact with smart contracts using Solidity and Foundry
              </p>
            </div>

            {/* GitHub Integration */}
            <div className="bg-[#FF9A51] border-4 border-black shadow-celo p-8 hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="bg-black border-2 border-black p-4 w-fit mx-auto mb-6 shadow-celo-sm">
                <Github className="w-12 h-12 text-[#FCFF52]" />
              </div>
              <h3 className="celo-heading-5 text-black mb-4 text-center">GitHub Integration</h3>
              <p className="celo-body-small text-black text-center">
                Seamlessly connect your development workflow with GitHub repositories
              </p>
            </div>

            {/* Wallet Tools */}
            <div className="bg-[#56DF7C] border-4 border-black shadow-celo p-8 hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="bg-black border-2 border-black p-4 w-fit mx-auto mb-6 shadow-celo-sm">
                <Wallet className="w-12 h-12 text-[#FCFF52]" />
              </div>
              <h3 className="celo-heading-5 text-black mb-4 text-center">Wallet Management</h3>
              <p className="celo-body-small text-black text-center">
                Manage transactions and interact with DeFi protocols on Celo
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-[#B490FF] border-4 border-black shadow-celo p-8 hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="bg-black border-2 border-black p-4 w-fit mx-auto mb-6 shadow-celo-sm">
                <CheckCircle className="w-12 h-12 text-[#FCFF52]" />
              </div>
              <h3 className="celo-heading-5 text-black mb-4 text-center">Analytics & Monitoring</h3>
              <p className="celo-body-small text-black text-center">
                Track your project's performance and usage metrics
              </p>
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
              Get started with Celution in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-[#329F3B] border-4 border-black shadow-celo flex items-center justify-center mb-6">
                <span className="celo-heading-4 text-white">1</span>
              </div>
              <h3 className="celo-heading-4 text-black mb-4">Connect Your Accounts</h3>
              <p className="celo-body text-black">
                Use the navbar to connect your GitHub account and Celo wallet to get started
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-[#7CC0FF] border-4 border-black shadow-celo flex items-center justify-center mb-6">
                <span className="celo-heading-4 text-black">2</span>
              </div>
              <h3 className="celo-heading-4 text-black mb-4">Set Up Your Project</h3>
              <p className="celo-body text-black">
                Create or import your project repository and configure your smart contract deployment
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-[#FF9A51] border-4 border-black shadow-celo flex items-center justify-center mb-6">
                <span className="celo-heading-4 text-black">3</span>
              </div>
              <h3 className="celo-heading-4 text-black mb-4">Deploy & Monitor</h3>
              <p className="celo-body text-black">
                Deploy your contracts to Celo and monitor performance with our analytics dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Snow on Fig */}
      <section className="bg-[#1E002B] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="celo-heading-1 mb-6 text-white italic">
            Ready to Build on Celo?
          </h2>
          <p className="celo-body-large mb-8 text-white opacity-90">
            Join the Celo ecosystem and start building <em className="italic">purpose-driven</em> decentralized applications that create the conditions for prosperity for everyone.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              className="bg-[#FCFF52] text-black px-8 py-4 border-4 border-[#FCFF52] hover:bg-[#F0F52D] rounded-none font-bold text-lg shadow-celo"
            >
              <Zap className="w-5 h-5 mr-2" />
              Launch Platform
            </Button>
            
            <Button 
              variant="outline"
              className="bg-transparent text-white px-8 py-4 border-4 border-white hover:bg-white hover:text-black rounded-none font-bold text-lg"
            >
              <Building className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Onyx on Prosperity Yellow */}
      <footer className="bg-[#FCFF52] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="celo-heading-5 text-black mb-4">Celution</h3>
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
              <div className="celo-heading-5 text-black">CELUTION</div>
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