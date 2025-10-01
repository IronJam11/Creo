"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACT_ABI } from "@/app/config/contractABI";
import { 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  Tag,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Zap,
  Filter,
  Search,
  Plus,
  X,
  Info,
  TrendingUp,
  Shield,
  Target
} from "lucide-react";
import Link from "next/link";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '').trim() as `0x${string}`;

// Resolve ABI shape
const resolvedAbi: any = Array.isArray(CONTRACT_ABI) && (CONTRACT_ABI as any)[0]?.abi
  ? (CONTRACT_ABI as any)[0].abi
  : (CONTRACT_ABI as any);

interface Issue {
  id: bigint;
  creator: string;
  githubIssueUrl: string;
  description: string;
  bounty: bigint;
  assignedTo: string;
  isCompleted: boolean;
  percentageCompleted: bigint;
  claimedPercentage: bigint;
  isUnderReview: boolean;
  createdAt: bigint;
  difficulty: number;
  deadline: bigint;
  easyDuration: bigint;
  mediumDuration: bigint;
  hardDuration: bigint;
  presentHackerConfidenceScore: bigint;
  minimumBountyCompletionPercentageForStakeReturn: bigint;
}

const difficultyLabels = ['Easy', 'Medium', 'Hard'];
const difficultyColors = ['bg-[#56DF7C]', 'bg-[#FF9A51]', 'bg-[#B490FF]'];

export default function IssuesPage() {
  const { address, isConnected } = useAccount();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [takingIssue, setTakingIssue] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");

  // Contract write hook for taking issues
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get all issues directly using the new getAllIssues function
  const { data: allIssues, isError: issuesError, isLoading: issuesLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: resolvedAbi,
    functionName: 'getAllIssues',
  });

  // Update issues state when data is loaded
  useEffect(() => {
    if (allIssues && Array.isArray(allIssues)) {
      const validIssues = allIssues.filter(issue => issue && issue.id !== 0n);
      setIssues(validIssues);
    }
    setLoading(false);
  }, [allIssues]);

  // Filter issues based on search and filters
  useEffect(() => {
    let filtered = issues;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.githubIssueUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => {
        switch (statusFilter) {
          case "open":
            return !issue.isCompleted && issue.assignedTo === "0x0000000000000000000000000000000000000000";
          case "assigned":
            return !issue.isCompleted && issue.assignedTo !== "0x0000000000000000000000000000000000000000";
          case "completed":
            return issue.isCompleted;
          case "under-review":
            return issue.isUnderReview;
          default:
            return true;
        }
      });
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      const difficultyIndex = ["easy", "medium", "hard"].indexOf(difficultyFilter);
      filtered = filtered.filter(issue => issue.difficulty === difficultyIndex);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, difficultyFilter]);

  const getIssueStatus = (issue: Issue) => {
    if (issue.isCompleted) return { label: "Completed", color: "bg-[#56DF7C]", icon: CheckCircle2 };
    if (issue.isUnderReview) return { label: "Under Review", color: "bg-[#B490FF]", icon: Clock };
    if (issue.assignedTo !== "0x0000000000000000000000000000000000000000") {
      const isExpired = issue.deadline > 0n && BigInt(Math.floor(Date.now() / 1000)) > issue.deadline;
      return { 
        label: isExpired ? "Expired" : "Assigned", 
        color: isExpired ? "bg-red-500" : "bg-[#FF9A51]", 
        icon: isExpired ? AlertCircle : User 
      };
    }
    return { label: "Open", color: "bg-[#7CC0FF]", icon: GitBranch };
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const openIssueModal = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
    // Set default stake to 10% of bounty
    const defaultStake = formatEther(issue.bounty / BigInt(10));
    setStakeAmount(defaultStake);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
    setStakeAmount("");
  };

  const handleTakeIssueFromModal = async () => {
    if (!selectedIssue || !isConnected || !address || !stakeAmount) {
      alert('Please connect your wallet and enter a stake amount');
      return;
    }

    try {
      setTakingIssue(selectedIssue.id.toString());
      
      const stakeAmountWei = parseEther(stakeAmount);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: resolvedAbi,
        functionName: 'takeIssue',
        args: [selectedIssue.id],
        value: stakeAmountWei,
      });
    } catch (error) {
      console.error('Error taking issue:', error);
      alert('Failed to take issue. Please try again.');
      setTakingIssue(null);
    }
  };

  const handleTakeIssue = async (issueId: bigint, bounty: bigint) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setTakingIssue(issueId.toString());
      
      // Calculate stake (10% of bounty as example)
      const stakeAmount = bounty / BigInt(10);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: resolvedAbi,
        functionName: 'takeIssue',
        args: [issueId],
        value: stakeAmount,
      });
    } catch (error) {
      console.error('Error taking issue:', error);
      alert('Failed to take issue. Please try again.');
      setTakingIssue(null);
    }
  };

  // Reset taking issue state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setTakingIssue(null);
      // Refresh issues list
      window.location.reload();
    }
  }, [isConfirmed]);

  const extractRepoFromUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : url;
  };

  if (issuesLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FCFF52] font-gt-alpina flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="celo-body-large text-black">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (issuesError) {
    return (
      <div className="min-h-screen bg-[#FCFF52] font-gt-alpina flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="celo-body-large text-black">Error loading issues. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFF52] font-gt-alpina">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="celo-display-thin text-black mb-6 italic">
            All Issues
          </h1>
          <p className="celo-body-large text-black max-w-3xl mx-auto mb-8">
            Browse and contribute to open-source issues with <em className="italic">decentralized bounties</em> on the Celo blockchain.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/create-issue">
              <Button className="bg-black text-[#FCFF52] px-8 py-4 border-4 border-black hover:bg-gray-800 rounded-none font-bold text-lg shadow-celo">
                <Plus className="w-5 h-5 mr-2" />
                Create Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border-4 border-black shadow-celo p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="under-review">Under Review</option>
              <option value="completed">Completed</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-black text-[#FCFF52] px-4 py-3 border-2 border-black font-bold">
              {filteredIssues.length} Issues
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16">
            <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="celo-heading-4 text-black mb-2">No Issues Found</h3>
            <p className="celo-body text-black">
              {issues.length === 0 
                ? "No issues have been created yet. Be the first to create one!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => {
              const status = getIssueStatus(issue);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={issue.id.toString()}
                  onClick={() => openIssueModal(issue)}
                  className="bg-white border-4 border-black shadow-celo hover:shadow-celo-lg hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
                >
                  {/* Issue Header */}
                  <div className="p-6 border-b-2 border-black">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="celo-heading-6 text-black">#{issue.id.toString()}</span>
                        <div className={`${difficultyColors[issue.difficulty]} border-2 border-black px-2 py-1`}>
                          <span className="celo-body-small text-black font-bold">
                            {difficultyLabels[issue.difficulty]}
                          </span>
                        </div>
                      </div>
                      <div className={`${status.color} border-2 border-black px-3 py-1 flex items-center gap-1`}>
                        <StatusIcon className="w-4 h-4 text-black" />
                        <span className="celo-body-small text-black font-bold">{status.label}</span>
                      </div>
                    </div>

                    <h3 className="celo-heading-5 text-black mb-2 line-clamp-2">
                      {issue.description}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <GitBranch className="w-4 h-4" />
                      <span className="celo-body-small truncate">
                        {extractRepoFromUrl(issue.githubIssueUrl)}
                      </span>
                    </div>
                  </div>

                  {/* Issue Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="celo-body-small text-black font-bold">
                          {formatEther(issue.bounty)} CELO
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="celo-body-small text-gray-600">
                          {formatTimeAgo(issue.createdAt)}
                        </span>
                      </div>
                    </div>

                    {issue.assignedTo !== "0x0000000000000000000000000000000000000000" && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="celo-body-small text-black font-bold">Assigned to:</span>
                        </div>
                        <span className="celo-body-small text-gray-600 font-mono">
                          {issue.assignedTo.slice(0, 6)}...{issue.assignedTo.slice(-4)}
                        </span>
                      </div>
                    )}

                    {issue.percentageCompleted > 0n && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="celo-body-small text-black font-bold">Progress</span>
                          <span className="celo-body-small text-black">{issue.percentageCompleted.toString()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 border-2 border-black h-3">
                          <div 
                            className="bg-[#56DF7C] h-full border-r-2 border-black transition-all"
                            style={{ width: `${issue.percentageCompleted}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={issue.githubIssueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="w-full bg-black text-[#FCFF52] border-2 border-black hover:bg-gray-800 rounded-none font-bold">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on GitHub
                        </Button>
                      </a>
                      
                      {!issue.isCompleted && issue.assignedTo === "0x0000000000000000000000000000000000000000" && isConnected && (
                        <Button 
                          onClick={() => handleTakeIssue(issue.id, issue.bounty)}
                          disabled={takingIssue === issue.id.toString() || isPending || isConfirming}
                          className="bg-[#56DF7C] text-black border-2 border-black hover:bg-green-400 rounded-none font-bold px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {takingIssue === issue.id.toString() || (isPending && takingIssue === issue.id.toString()) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Issue Detail Modal */}
      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FCFF52] border-4 border-black shadow-celo max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-black text-[#FCFF52] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="celo-heading-3 font-bold">Issue #{selectedIssue.id.toString()}</h2>
                <div className={`${difficultyColors[selectedIssue.difficulty]} border-2 border-[#FCFF52] px-3 py-1`}>
                  <span className="celo-body-small text-black font-bold">
                    {difficultyLabels[selectedIssue.difficulty]}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="bg-[#FCFF52] text-black border-2 border-[#FCFF52] hover:bg-white p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Issue Status */}
              <div className="mb-6">
                {(() => {
                  const status = getIssueStatus(selectedIssue);
                  const StatusIcon = status.icon;
                  return (
                    <div className={`${status.color} border-2 border-black px-4 py-2 inline-flex items-center gap-2`}>
                      <StatusIcon className="w-5 h-5 text-black" />
                      <span className="celo-body text-black font-bold">{status.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Issue Description */}
              <div className="mb-8">
                <h3 className="celo-heading-4 text-black mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Description
                </h3>
                <div className="bg-white border-2 border-black p-6">
                  <p className="celo-body text-black leading-relaxed">{selectedIssue.description}</p>
                </div>
              </div>

              {/* Issue Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="celo-body-small text-black font-bold">Bounty</span>
                    </div>
                    <span className="celo-heading-5 text-black">{formatEther(selectedIssue.bounty)} CELO</span>
                  </div>

                  <div className="bg-white border-2 border-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="celo-body-small text-black font-bold">Created</span>
                    </div>
                    <span className="celo-body text-black">{formatTimeAgo(selectedIssue.createdAt)}</span>
                  </div>

                  <div className="bg-white border-2 border-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-5 h-5 text-purple-600" />
                      <span className="celo-body-small text-black font-bold">Repository</span>
                    </div>
                    <span className="celo-body text-black">{extractRepoFromUrl(selectedIssue.githubIssueUrl)}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {selectedIssue.assignedTo !== "0x0000000000000000000000000000000000000000" && (
                    <div className="bg-white border-2 border-black p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-purple-600" />
                        <span className="celo-body-small text-black font-bold">Assigned To</span>
                      </div>
                      <span className="celo-body text-black font-mono">
                        {selectedIssue.assignedTo.slice(0, 6)}...{selectedIssue.assignedTo.slice(-4)}
                      </span>
                    </div>
                  )}

                  {selectedIssue.percentageCompleted > 0n && (
                    <div className="bg-white border-2 border-black p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="celo-body-small text-black font-bold">Progress</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="celo-body text-black">{selectedIssue.percentageCompleted.toString()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 border-2 border-black h-4">
                        <div 
                          className="bg-[#56DF7C] h-full border-r-2 border-black transition-all"
                          style={{ width: `${selectedIssue.percentageCompleted}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-white border-2 border-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      <span className="celo-body-small text-black font-bold">Min. Completion</span>
                    </div>
                    <span className="celo-body text-black">
                      {selectedIssue.minimumBountyCompletionPercentageForStakeReturn.toString()}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Staking Section */}
              {!selectedIssue.isCompleted && selectedIssue.assignedTo === "0x0000000000000000000000000000000000000000" && isConnected && (
                <div className="bg-white border-4 border-black p-6 mb-6">
                  <h3 className="celo-heading-4 text-black mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Stake & Contribute
                  </h3>
                  <p className="celo-body text-black mb-4">
                    To work on this issue, you need to stake CELO as a commitment. The stake will be returned when you complete the work.
                  </p>
                  
                  <div className="mb-4">
                    <label className="celo-body-small text-black font-bold mb-2 block">
                      Stake Amount (CELO)
                    </label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Enter stake amount"
                      className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black"
                      step="0.01"
                      min="0"
                    />
                    <p className="celo-body-small text-gray-600 mt-1">
                      Recommended: {formatEther(selectedIssue.bounty / BigInt(10))} CELO (10% of bounty)
                    </p>
                  </div>

                  <Button
                    onClick={handleTakeIssueFromModal}
                    disabled={takingIssue === selectedIssue.id.toString() || isPending || isConfirming || !stakeAmount}
                    className="w-full bg-black text-[#FCFF52] px-8 py-4 border-4 border-black hover:bg-gray-800 rounded-none font-bold text-lg shadow-celo disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {takingIssue === selectedIssue.id.toString() || (isPending && takingIssue === selectedIssue.id.toString()) ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Taking Issue...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Stake & Take Issue
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <a
                  href={selectedIssue.githubIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-black text-[#FCFF52] border-2 border-black hover:bg-gray-800 rounded-none font-bold py-3">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View on GitHub
                  </Button>
                </a>
                
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="bg-white text-black px-8 py-3 border-2 border-black hover:bg-black hover:text-[#FCFF52] rounded-none font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
