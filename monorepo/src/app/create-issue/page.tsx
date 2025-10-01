"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { GitHubAPI, createDifficultyLabels } from "@/lib/github-api";
import { 
  Plus, 
  GitBranch, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Eye,
  User,
  Calendar,
  Tag,
  ExternalLink,
  Loader2,
  Zap
} from "lucide-react";

// Contract ABI for createIssue function
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_githubIssueUrl", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint8", "name": "_difficulty", "type": "uint8"},
      {"internalType": "uint256", "name": "_easyDuration", "type": "uint256"},
      {"internalType": "uint256", "name": "_mediumDuration", "type": "uint256"},
      {"internalType": "uint256", "name": "_hardDuration", "type": "uint256"},
      {"internalType": "uint256", "name": "_minimumBountyCompletionPercentageForStakeReturn", "type": "uint256"}
    ],
    "name": "createIssue",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = "0x05B5C305e16382cF1C94165308b90D79A7334F50" as const; // Replace with actual deployed contract address

// GitHub Issue interface
interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

interface AnalysisResult {
  agents_discovered: number;
  agents_used: number;
  analysis_method: string;
  repository: string;
  selected_agents: string[];
  success: boolean;
  github_payload: {
    assignees: any[];
    body: string;
    labels: string[];
    title: string;
  };
  synthesized_analysis: {
    acceptance_criteria: string[];
    body: string;
    difficulty: string;
    implementation_estimate: string;
    labels: string[];
    priority: string;
    technical_requirements: string[];
    title: string;
  };
}

enum Difficulty {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2
}

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: {
    label: "Easy",
    color: "bg-[#56DF7C]",
    duration: 7,
    description: "Simple bug fixes, documentation updates"
  },
  [Difficulty.MEDIUM]: {
    label: "Medium", 
    color: "bg-[#7CC0FF]",
    duration: 30,
    description: "Feature implementations, moderate complexity"
  },
  [Difficulty.HARD]: {
    label: "Hard",
    color: "bg-[#FF9A51]", 
    duration: 150,
    description: "Complex features, architectural changes"
  }
};

export default function CreateIssuePage() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check token scopes on mount
  useEffect(() => {
    const checkTokenScopes = async () => {
      if (session?.accessToken) {
        try {
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });
          
          if (userResponse.ok) {
            const scopes = userResponse.headers.get('X-OAuth-Scopes');

            setHasRepoScope(scopes?.includes('repo') || false);
          }
        } catch (error) {
          console.warn('Could not check token scopes:', error);
        }
      }
    };

    checkTokenScopes();
  }, [session]);
  
  // State management
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>(""); // Format: "owner/repo"
  
  // AI Analysis states
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [approvingIssue, setApprovingIssue] = useState(false);
  const [hasRepoScope, setHasRepoScope] = useState<boolean | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubUrl: "",
    difficulty: Difficulty.EASY,
    bountyAmount: "0.1",
    customDurations: {
      easy: 0,
      medium: 0, 
      hard: 0
    },
    minimumCompletionPercentage: 80
  });

  // Contract interaction
  const { data: contractWriteData, writeContract, isPending: isContractLoading, error: contractError } = useWriteContract();

  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess, error: transactionError } = useWaitForTransactionReceipt({
    hash: contractWriteData,
  });

  // Store the created GitHub issue temporarily until blockchain confirmation
  const [pendingGitHubIssue, setPendingGitHubIssue] = useState<GitHubIssue | null>(null);

  // Fetch user repositories
  useEffect(() => {
    if (session?.accessToken) {
      fetchRepositories();
    }
  }, [session]);

  // Fetch GitHub issues
  useEffect(() => {
    if (session?.accessToken && selectedRepo) {
      fetchGitHubIssues();
    }
  }, [session, selectedRepo]);

  // Handle transaction success/failure
  useEffect(() => {
    if (isTransactionSuccess && pendingGitHubIssue) {
      // Transaction succeeded - add issue to local state
      setGithubIssues(prev => [pendingGitHubIssue, ...prev]);
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        githubUrl: "",
        difficulty: Difficulty.EASY,
        bountyAmount: "0.1",
        customDurations: { easy: 0, medium: 0, hard: 0 },
        minimumCompletionPercentage: 80
      });
      setPendingGitHubIssue(null);
      alert('Bounty created successfully! 🎉');
    }
  }, [isTransactionSuccess, pendingGitHubIssue]);

  // Handle transaction/contract errors
  useEffect(() => {
    if ((contractError || transactionError) && pendingGitHubIssue) {
      console.error('Transaction failed:', contractError || transactionError);
      
      let errorMessage = 'Failed to create bounty on blockchain. ';
      const error = contractError || transactionError;
      
      if (error?.message?.includes('User not verified')) {
        errorMessage += 'Please verify your account first.';
      } else if (error?.message?.includes('Insufficient payment')) {
        errorMessage += 'Bounty amount must be greater than the AI service fee.';
      } else if (error?.message?.includes('rejected')) {
        errorMessage += 'Transaction was rejected by user.';
      } else {
        errorMessage += error?.message || 'Please try again.';
      }
      
      alert(errorMessage);
      setPendingGitHubIssue(null);
    }
  }, [contractError, transactionError, pendingGitHubIssue]);

  const fetchRepositories = async () => {
    if (!session?.accessToken) return;
    
    try {
      const githubApi = new GitHubAPI(session.accessToken);
      const allRepos = await githubApi.getUserRepos();

      
      // For now, let's not verify each repository individually as it's slow
      // Instead, rely on the getUserRepos method to return only accessible repos
      setRepositories(allRepos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const fetchGitHubIssues = async () => {
    if (!session?.accessToken || !selectedRepo) return;
    
    setLoading(true);
    try {
      const githubApi = new GitHubAPI(session.accessToken);
      const [owner, repo] = selectedRepo.split('/');
      const issues = await githubApi.getRepoIssues(owner, repo);
      setGithubIssues(issues);
    } catch (error) {
      console.error('Error fetching GitHub issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGitHubIssue = async () => {
    if (!session?.accessToken || !selectedRepo) return null;
    
    try {
      const githubApi = new GitHubAPI(session.accessToken);
      const [owner, repo] = selectedRepo.split('/');
      
      // Create difficulty labels if they don't exist
      await createDifficultyLabels(session.accessToken, owner, repo);
      
      const newIssue = await githubApi.createIssue(owner, repo, {
        title: formData.title,
        body: formData.description,
        labels: [
          `difficulty:${DIFFICULTY_CONFIG[formData.difficulty].label.toLowerCase()}`,
          'bounty',
          'celution'
        ]
      });
      
      return newIssue;
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
    }
    return null;
  };

  const analyzeRepository = async () => {
    if (!selectedRepo) {
      alert('Please select a repository first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const repoUrl = `https://github.com/${selectedRepo}`;
      const response = await fetch('http://localhost:5000/api/analyze-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_url: repoUrl
        }),
      });

      if (response.ok) {
        const result: AnalysisResult = await response.json();
        setAnalysisResult(result);
        setShowSuggestion(true);
      } else {
        console.error('Analysis failed:', response.statusText);
        alert('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing repository:', error);
      alert('Error connecting to analysis service. Make sure the service is running on localhost:5000');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveAndCreateIssue = async () => {
    if (!session?.accessToken || !selectedRepo || !analysisResult) return;

    setApprovingIssue(true);
    try {
      const githubApi = new GitHubAPI(session.accessToken);
      const [owner, repo] = selectedRepo.split('/');
      

      
      // Test token scopes
      try {
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (userResponse.ok) {
          const scopes = userResponse.headers.get('X-OAuth-Scopes');

          
          if (!scopes?.includes('repo')) {
            console.warn('Token does not have repo scope - cannot create issues');
            throw new Error('❌ Insufficient GitHub permissions.\n\nYour GitHub token does not have the required "repo" scope to create issues.\n\n🔧 To fix this:\n1. Sign out of GitHub in the navbar\n2. Sign back in to get updated permissions\n3. The app will now request the correct permissions\n\nNote: You may need to clear your browser cache or restart the app.');
          }
        }
      } catch (scopeError) {
        console.warn('Could not check token scopes:', scopeError);
      }
      
      // Check if the user has write access to the repository
      try {
        // First, try to get repository info to verify access
        const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;

        
        const repoInfo = await fetch(repoUrl, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        console.log('Repository check response:', {
          status: repoInfo.status,
          statusText: repoInfo.statusText,
          ok: repoInfo.ok
        });
        
        if (!repoInfo.ok) {
          const errorData = await repoInfo.json().catch(() => ({}));
          console.error('Repository access error details:', errorData);
          throw new Error(`Repository not found or no access: ${repoInfo.statusText} (${repoInfo.status})`);
        }
        
        const repoData = await repoInfo.json();
        console.log('Repository permissions:', repoData.permissions);
        console.log('Repository info:', {
          name: repoData.name,
          full_name: repoData.full_name,
          private: repoData.private,
          owner: repoData.owner?.login
        });
        
        if (!repoData.permissions?.push) {
          throw new Error(`You don't have write access to ${selectedRepo}. You can only create issues in repositories you own or have write access to.`);
        }
        

      } catch (repoError) {
        console.error('Repository access error:', repoError);
        
        // Provide specific guidance based on the error
        if (repoError instanceof Error && repoError.message.includes('404')) {
          throw new Error(`❌ Repository "${selectedRepo}" not found.\n\nPossible issues:\n• Repository doesn't exist\n• Repository is private and you don't have access\n• Repository name has changed\n• You're not logged in with the correct GitHub account\n\nPlease verify the repository exists and you have access to it.`);
        }
        throw repoError;
      }
      
      // Create difficulty labels if they don't exist (only if we have write access)
      try {
        await createDifficultyLabels(session.accessToken, owner, repo);
      } catch (labelError) {
        console.warn('Could not create labels:', labelError);
        // Continue anyway - labels might already exist
      }
      
      // Map difficulty string to enum
      const difficultyMap: { [key: string]: Difficulty } = {
        'Easy': Difficulty.EASY,
        'Medium': Difficulty.MEDIUM,
        'Hard': Difficulty.HARD
      };
      
      const difficulty = difficultyMap[analysisResult.synthesized_analysis.difficulty] || Difficulty.MEDIUM;
      
      // Create the GitHub issue with AI-suggested content
      const newIssue = await githubApi.createIssue(owner, repo, {
        title: analysisResult.github_payload.title,
        body: analysisResult.github_payload.body,
        labels: [
          ...analysisResult.github_payload.labels,
          `difficulty:${analysisResult.synthesized_analysis.difficulty.toLowerCase()}`,
          'bounty',
          'celution',
          'ai-generated'
        ]
      });

      if (newIssue) {
        // Update the issues list
        setGithubIssues(prev => [newIssue, ...prev]);
        
        // Hide the suggestion
        setShowSuggestion(false);
        setAnalysisResult(null);
        
        alert('Issue created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating approved issue:', error);
      const errorMessage = error.message || 'Failed to create issue. Please try again.';
      alert(errorMessage);
    } finally {
      setApprovingIssue(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!isConnected || !session) return;

    try {
      // First create the GitHub issue
      const githubIssue = await createGitHubIssue();
      if (!githubIssue) {
        alert('Failed to create GitHub issue');
        return;
      }

      // Store the GitHub issue temporarily
      setPendingGitHubIssue(githubIssue);

      // Then create on blockchain
      const bountyInWei = parseEther(formData.bountyAmount);
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createIssue',
        args: [
          githubIssue.html_url,
          formData.description,
          formData.difficulty,
          BigInt(formData.customDurations.easy * 24 * 60 * 60), // Convert days to seconds
          BigInt(formData.customDurations.medium * 24 * 60 * 60),
          BigInt(formData.customDurations.hard * 24 * 60 * 60),
          BigInt(formData.minimumCompletionPercentage)
        ],
        value: bountyInWei,
      });

      // Don't update local state here - wait for transaction confirmation
      // The useEffect above will handle success/failure
      
    } catch (error) {
      console.error('Error creating bounty:', error);
      alert('Failed to create bounty. Please try again.');
      setPendingGitHubIssue(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyFromLabels = (labels: GitHubIssue['labels']) => {
    const diffLabel = labels.find(label => label.name.startsWith('difficulty:'));
    if (diffLabel?.name.includes('easy')) return Difficulty.EASY;
    if (diffLabel?.name.includes('medium')) return Difficulty.MEDIUM;
    if (diffLabel?.name.includes('hard')) return Difficulty.HARD;
    return Difficulty.EASY;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FCFF52] font-gt-alpina flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-6"></div>
          <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (!session || !isConnected) {
    return (
      <div className="min-h-screen bg-[#FCFF52] font-gt-alpina flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-black" />
          <h1 className="celo-heading-2 text-black mb-4">Authentication Required</h1>
          <p className="celo-body text-black mb-6">
            Please connect your GitHub account and Celo wallet to create and manage issues.
          </p>
          <Button className="bg-black text-[#FCFF52] px-8 py-3 border-4 border-black font-bold shadow-celo">
            Connect Accounts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFF52] font-gt-alpina">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="celo-heading-1 text-black italic mb-2">Issue Management</h1>
            <p className="celo-body-large text-black">
              Create blockchain-backed issues with bounties and manage your repository's development workflow
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* Repository Selector */}
            <div className="flex flex-col">
              <select 
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="px-4 py-2 border-4 border-black bg-white text-black font-bold rounded-none shadow-celo"
                disabled={repositories.length === 0}
              >
                <option value="">
                  {repositories.length === 0 ? "No accessible repositories found" : "Select Repository"}
                </option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-black mt-1 opacity-75">
                {repositories.length === 0 
                  ? "You need repositories with write access to create issues"
                  : "Only showing repositories where you can create issues"
                }
              </p>
            </div>
            
            <Button
              onClick={analyzeRepository}
              disabled={!selectedRepo || isAnalyzing || hasRepoScope === false}
              className="bg-[#7CC0FF] text-black px-6 py-3 border-4 border-black font-bold shadow-celo hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'AI Analyze Repo'}
            </Button>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              disabled={hasRepoScope === false}
              className="bg-[#B490FF] text-black px-6 py-3 border-4 border-black font-bold shadow-celo hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Issue
            </Button>
          </div>
        </div>

        {/* Token Scope Warning */}
        {hasRepoScope === false && (
          <div className="bg-[#FF9A51] border-4 border-black p-6 mb-8 shadow-celo">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
              <div>
                <h3 className="celo-heading-5 text-black mb-2">⚠️ GitHub Permissions Required</h3>
                <p className="celo-body text-black mb-4">
                  Your GitHub token doesn't have the required permissions to create issues. 
                  The app needs "repo" scope to create issues and manage labels.
                </p>
                <div className="bg-white border-2 border-black p-4 mb-4">
                  <p className="celo-body-small text-black mb-2"><strong>Current scopes:</strong> read:user, user:email</p>
                  <p className="celo-body-small text-black"><strong>Required scopes:</strong> read:user, user:email, repo</p>
                </div>
                <p className="celo-body-small text-black">
                  <strong>To fix this:</strong> Sign out from GitHub in the navbar above, then sign back in. 
                  The app will request the updated permissions automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Suggestion Section */}
        {showSuggestion && analysisResult && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="celo-heading-3 text-black italic">AI Suggested Issue</h2>
              <Button
                onClick={() => setShowSuggestion(false)}
                className="bg-white text-black px-4 py-2 border-4 border-black font-bold shadow-celo hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Analysis Summary */}
            <div className="bg-[#7CC0FF] border-4 border-black p-6 mb-6 shadow-celo">
              <h3 className="celo-heading-5 text-black mb-2">AI Analysis Report</h3>
              <p className="celo-body text-black mb-4">{analysisResult.synthesized_analysis.body}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span><strong>Repository:</strong> {analysisResult.repository}</span>
                <span><strong>Method:</strong> {analysisResult.analysis_method}</span>
                <span><strong>Agents Used:</strong> {analysisResult.agents_used}/{analysisResult.agents_discovered}</span>
              </div>
            </div>

            {/* Suggested Issue Card */}
            <div className="bg-white border-4 border-black p-6 shadow-celo hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all">
              {/* Issue Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  <div className={`${
                    analysisResult.synthesized_analysis.difficulty === 'Easy' ? 'bg-[#56DF7C]' :
                    analysisResult.synthesized_analysis.difficulty === 'Medium' ? 'bg-[#7CC0FF]' :
                    'bg-[#FF9A51]'
                  } border-2 border-black px-2 py-1 shadow-celo-sm`}>
                    <span className="celo-label text-black">{analysisResult.synthesized_analysis.difficulty}</span>
                  </div>
                  <div className={`${
                    analysisResult.synthesized_analysis.priority === 'Low' ? 'bg-[#56DF7C]' :
                    analysisResult.synthesized_analysis.priority === 'Medium' ? 'bg-[#7CC0FF]' :
                    'bg-[#FF9A51]'
                  } border-2 border-black px-2 py-1 shadow-celo-sm`}>
                    <span className="celo-label text-black">{analysisResult.synthesized_analysis.priority}</span>
                  </div>
                </div>
              </div>
              
              {/* Issue Title */}
              <h3 className="celo-heading-4 text-black mb-4">
                {analysisResult.github_payload.title}
              </h3>
              
              {/* Issue Description */}
              <div className="celo-body text-black mb-4 prose prose-sm max-w-none">
                <p>{analysisResult.synthesized_analysis.body}</p>
              </div>
              
              {/* Technical Requirements */}
              {analysisResult.synthesized_analysis.technical_requirements.length > 0 && (
                <div className="mb-4">
                  <h4 className="celo-heading-6 text-black mb-2">Technical Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-black space-y-1">
                    {analysisResult.synthesized_analysis.technical_requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Acceptance Criteria */}
              {analysisResult.synthesized_analysis.acceptance_criteria.length > 0 && (
                <div className="mb-6">
                  <h4 className="celo-heading-6 text-black mb-2">Acceptance Criteria:</h4>
                  <ul className="list-disc list-inside text-sm text-black space-y-1">
                    {analysisResult.synthesized_analysis.acceptance_criteria.map((criteria, index) => (
                      <li key={index}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Issue Details */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-black" />
                  <span className="text-black">{analysisResult.synthesized_analysis.implementation_estimate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-black" />
                  <span className="text-black">{analysisResult.synthesized_analysis.labels.join(', ')}</span>
                </div>
              </div>
              
              {/* Approve Button */}
              <Button
                onClick={approveAndCreateIssue}
                disabled={approvingIssue}
                className="w-full bg-[#56DF7C] text-black px-6 py-3 border-4 border-black font-bold shadow-celo hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approvingIssue ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Issue...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve & Create GitHub Issue
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Issues Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <span className="ml-2 celo-body text-black">Loading issues...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {githubIssues.map((issue) => {
              const difficulty = getDifficultyFromLabels(issue.labels);
              const config = DIFFICULTY_CONFIG[difficulty];
              
              return (
                <div
                  key={issue.id}
                  className={`${config.color} border-4 border-black shadow-celo p-6 hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all`}
                >
                  {/* Issue Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-black" />
                      <span className="celo-label text-black">#{issue.number}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-black border-2 border-black px-2 py-1 shadow-celo-sm">
                        <span className="celo-label text-white">{config.label}</span>
                      </div>
                      {issue.state === 'open' && (
                        <div className="bg-[#329F3B] border-2 border-black px-2 py-1 shadow-celo-sm">
                          <span className="celo-label text-white">OPEN</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Issue Title */}
                  <h3 className="celo-heading-5 text-black mb-3 line-clamp-2">
                    {issue.title}
                  </h3>
                  
                  {/* Issue Description */}
                  <p className="celo-body-small text-black mb-4 line-clamp-3">
                    {issue.body || "No description provided"}
                  </p>
                  
                  {/* Labels */}
                  {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {issue.labels.slice(0, 3).map((label) => (
                        <div
                          key={label.name}
                          className="bg-white border-2 border-black px-2 py-1 shadow-celo-sm"
                          style={{ backgroundColor: `#${label.color}40` }}
                        >
                          <span className="celo-label text-black">{label.name}</span>
                        </div>
                      ))}
                      {issue.labels.length > 3 && (
                        <div className="bg-white border-2 border-black px-2 py-1 shadow-celo-sm">
                          <span className="celo-label text-black">+{issue.labels.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Issue Meta */}
                  <div className="flex items-center justify-between text-black mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="celo-body-small">{issue.user.login}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="celo-body-small">{formatDate(issue.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-black text-white px-4 py-2 border-2 border-black font-bold text-sm shadow-celo-sm hover:bg-gray-800"
                      onClick={() => window.open(issue.html_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View on GitHub
                    </Button>
                    <Button
                      className="bg-[#FCFF52] text-black px-4 py-2 border-2 border-black font-bold text-sm shadow-celo-sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          githubUrl: issue.html_url,
                          title: issue.title,
                          description: issue.body || ""
                        }));
                        setShowCreateForm(true);
                      }}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Add Bounty
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && githubIssues.length === 0 && (
          <div className="text-center py-20">
            <GitBranch className="w-16 h-16 mx-auto mb-6 text-black opacity-50" />
            <h3 className="celo-heading-3 text-black mb-4">No Issues Found</h3>
            <p className="celo-body text-black mb-6">
              {selectedRepo ? "This repository has no open issues." : "Select a repository to view issues."}
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-black text-[#FCFF52] px-6 py-3 border-4 border-black font-bold shadow-celo"
            >
              Create Your First Issue
            </Button>
          </div>
        )}
      </div>

      {/* Create Issue Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FCFF52] border-4 border-black shadow-celo-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#B490FF] border-b-4 border-black p-6 flex justify-between items-center">
              <h2 className="celo-heading-3 text-black italic">Create New Issue</h2>
              <Button
                onClick={() => setShowCreateForm(false)}
                className="bg-black text-white p-2 border-2 border-black shadow-celo-sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Issue Title */}
              <div>
                <label className="celo-label text-black mb-2 block">Issue Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-4 border-black bg-white text-black font-bold rounded-none shadow-celo"
                  placeholder="Brief description of the issue"
                />
              </div>
              
              {/* Issue Description */}
              <div>
                <label className="celo-label text-black mb-2 block">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border-4 border-black bg-white text-black rounded-none shadow-celo resize-none"
                  placeholder="Detailed description of the issue, requirements, and acceptance criteria"
                />
              </div>
              
              {/* Difficulty Selection */}
              <div>
                <label className="celo-label text-black mb-2 block">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: Number(key) as Difficulty }))}
                      className={`${config.color} border-4 ${
                        formData.difficulty === Number(key) ? 'border-black shadow-celo-lg' : 'border-black shadow-celo'
                      } p-4 text-left transition-all hover:translate-x-1 hover:translate-y-1`}
                    >
                      <div className="celo-heading-5 text-black mb-1">{config.label}</div>
                      <div className="celo-body-small text-black mb-2">{config.description}</div>
                      <div className="flex items-center gap-1 text-black">
                        <Clock className="w-4 h-4" />
                        <span className="celo-label">{config.duration} days</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Bounty Amount */}
              <div>
                <label className="celo-label text-black mb-2 block">Bounty Amount (CELO) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0.01"
                    value={formData.bountyAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, bountyAmount: e.target.value }))}
                    className="w-full px-4 py-3 border-4 border-black bg-white text-black font-bold rounded-none shadow-celo pr-16"
                    placeholder="0.100"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className="celo-label text-black">CELO</span>
                  </div>
                </div>
                <p className="celo-body-small text-black mt-1">
                  Minimum: 0.01 CELO (≈ $0.50)
                </p>
              </div>
              
              {/* Completion Percentage */}
              <div>
                <label className="celo-label text-black mb-2 block">Minimum Completion for Stake Return (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.minimumCompletionPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumCompletionPercentage: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border-4 border-black bg-white text-black font-bold rounded-none shadow-celo"
                  placeholder="80"
                />
                <p className="celo-body-small text-black mt-1">
                  Contributors need to complete at least this percentage to avoid stake forfeiture
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#E7E3D4] border-t-4 border-black p-6 flex gap-4">
              <Button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-white text-black px-6 py-3 border-4 border-black font-bold shadow-celo"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateIssue}
                disabled={!formData.title || !formData.description || isContractLoading || isTransactionLoading || pendingGitHubIssue !== null}
                className="flex-1 bg-[#329F3B] text-white px-6 py-3 border-4 border-black font-bold shadow-celo disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isContractLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating GitHub Issue...
                  </>
                ) : isTransactionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Confirming Blockchain Transaction...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Create Bounty ({formData.bountyAmount} CELO)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}