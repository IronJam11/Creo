"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, User, Mail, Building, Github, Wallet } from "lucide-react";
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 1,
    title: "Welcome to Celution",
    description: "Let's get you started with your journey",
    icon: <User className="w-8 h-8" />,
  },
  {
    id: 2,
    title: "Connect Your Accounts",
    description: "Link your GitHub and Celo wallet",
    icon: <Wallet className="w-8 h-8" />,
  },
  {
    id: 3,
    title: "Personal Information",
    description: "Tell us a bit about yourself",
    icon: <Mail className="w-8 h-8" />,
  },
  {
    id: 4,
    title: "Setup Complete",
    description: "You're all set to begin!",
    icon: <Building className="w-8 h-8" />,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  });

  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    // Validation for step 2 (connections)
    if (currentStep === 2) {
      if (!session) {
        toast.error('Please connect your GitHub account to continue');
        return;
      }
      if (!isConnected) {
        toast.error('Please connect your Celo wallet to continue');
        return;
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGitHubConnect = async () => {
    try {
      await signIn('github');
      toast.success('GitHub connected successfully!');
    } catch (error) {
      toast.error('Failed to connect GitHub');
    }
  };

  useEffect(() => {
    if (session && isConnected && currentStep === 2) {
      toast.success('Both accounts connected! You can proceed to the next step.');
    }
  }, [session, isConnected, currentStep]);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log("Onboarding completed with data:", formData);
    window.location.href = "/";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-[#7CC0FF] border-4 border-black shadow-celo flex items-center justify-center">
              <User className="w-16 h-16 text-black" />
            </div>
            <div>
              <h2 className="celo-heading-1 mb-4">
                Welcome to Celution
              </h2>
              <p className="celo-body-large max-w-md mx-auto">
                We're excited to have you on board. Let's take a few moments to set up your account and get you started.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-[#56DF7C] border-4 border-black shadow-celo flex items-center justify-center mb-6">
                <Wallet className="w-16 h-16 text-black" />
              </div>
              <h2 className="celo-heading-1 mb-4">
                Connect Your Accounts
              </h2>
              <p className="celo-body-large mb-8">
                Link your GitHub and Celo wallet to get started
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* GitHub Connection */}
              <div className="bg-white border-4 border-black shadow-celo p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Github className="w-8 h-8 text-black" />
                    <div>
                      <h3 className="celo-heading-5">GitHub</h3>
                      <p className="celo-body-small text-gray-600">Connect your GitHub account</p>
                    </div>
                  </div>
                  {session ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : null}
                </div>
                
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200">
                      <span className="font-medium text-green-800">
                        Connected as @{session.user?.githubUsername}
                      </span>
                      <Button
                        onClick={() => signOut()}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleGitHubConnect}
                    className="w-full bg-black text-[#FCFF52] hover:bg-gray-800 border-2 border-black rounded-none font-bold"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Connect GitHub
                  </Button>
                )}
              </div>

              {/* Wallet Connection */}
              <div className="bg-white border-4 border-black shadow-celo p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-8 h-8 text-black" />
                    <div>
                      <h3 className="celo-heading-5">Celo Wallet</h3>
                      <p className="celo-body-small text-gray-600">Connect your Celo wallet</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : null}
                </div>
                
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200">
                      <span className="font-medium text-green-800">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                      <Button
                        onClick={() => disconnect()}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#B490FF] border-2 border-black shadow-celo-sm p-2 rounded-none">
                    <ConnectButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-[#FF9A51] border-4 border-black shadow-celo flex items-center justify-center mb-6">
                <Mail className="w-16 h-16 text-black" />
              </div>
              <h2 className="celo-heading-1 mb-4">
                Personal Information
              </h2>
              <p className="celo-body-large mb-8">
                Help us personalize your experience
              </p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="celo-label block mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full border-2 border-black focus:ring-0 focus:border-black rounded-none"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="celo-label block mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="w-full border-2 border-black focus:ring-0 focus:border-black rounded-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="celo-label block mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full border-2 border-black focus:ring-0 focus:border-black rounded-none"
                />
              </div>
              <div>
                <label htmlFor="company" className="celo-label block mb-2">
                  Company (Optional)
                </label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  className="w-full border-2 border-black focus:ring-0 focus:border-black rounded-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-[#329F3B] border-4 border-black shadow-celo flex items-center justify-center">
              <Check className="w-16 h-16 text-white stroke-[3]" />
            </div>
            <div>
              <h2 className="celo-heading-1 mb-4">
                All Set!
              </h2>
              <p className="celo-body-large max-w-md mx-auto mb-6">
                Congratulations! Your account has been set up successfully. You're now ready to explore all the features Celution has to offer.
              </p>
              <div className="bg-[#FCFF52] border-4 border-black shadow-celo p-6 max-w-md mx-auto">
                <h3 className="celo-heading-4 mb-4">Your Details:</h3>
                <div className="text-left space-y-2 celo-body">
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  {formData.company && <p><strong>Company:</strong> {formData.company}</p>}
                  <p><strong>GitHub:</strong> @{session?.user?.githubUsername}</p>
                  <p><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFF52] flex items-center justify-center p-4 font-gt-alpina">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-black ${
                    currentStep >= step.id
                      ? "bg-black text-[#F9FF00]"
                      : "bg-white text-black"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-1 mx-4 ${
                      currentStep > step.id ? "bg-black" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-black font-bold">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border-4 border-black shadow-celo-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 font-bold border-2 border-black hover:bg-black hover:text-[#F9FF00] rounded-none disabled:opacity-30"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === index + 1 ? "bg-black" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentStep < steps.length ? (
              <Button 
                onClick={handleNext} 
                className="px-6 font-bold bg-black text-[#FCFF52] hover:bg-gray-800 border-2 border-black rounded-none"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                className="px-6 font-bold bg-black text-[#FCFF52] hover:bg-gray-800 border-2 border-black rounded-none"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}