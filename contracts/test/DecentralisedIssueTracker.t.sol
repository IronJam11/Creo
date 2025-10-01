// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DecentralisedIssueTracker.sol";

contract DecentralizedIssueTrackerTest is Test {
    DecentralizedIssueTracker public tracker;
    
    address public owner;
    address public aiAgent;
    address public creator1;
    address public creator2;
    address public contributor1;
    address public contributor2;
    address public contributor3;
    
    uint256 constant AI_FEE = 0.00001 ether;
    uint256 constant MIN_BOUNTY = 0.1 ether;
    
    event IssueCreated(uint256 indexed issueId, address indexed creator, string githubIssueUrl, uint256 bounty, DecentralizedIssueTracker.Difficulty difficulty);
    event IssueAssigned(uint256 indexed issueId, address indexed contributor, uint256 deadline);
    event IssueCompleted(uint256 indexed issueId, address indexed contributor, uint256 reward);
    event BountyIncreased(uint256 indexed issueId, uint256 newBounty);
    event DeadlineExpired(uint256 indexed issueId, address indexed contributor);
    event AIPaymentSent(address indexed from, uint256 amount);
    event StakeForfeited(uint256 indexed issueId, address indexed contributor, uint256 amount);
    
    function setUp() public {
        owner = address(this);
        aiAgent = makeAddr("aiAgent");
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        contributor1 = makeAddr("contributor1");
        contributor2 = makeAddr("contributor2");
        contributor3 = makeAddr("contributor3");
        
        tracker = new DecentralizedIssueTracker(aiAgent);
        
        // Fund accounts
        vm.deal(creator1, 100 ether);
        vm.deal(creator2, 100 ether);
        vm.deal(contributor1, 10 ether);
        vm.deal(contributor2, 10 ether);
        vm.deal(contributor3, 10 ether);
        
        // Setup nullifiers for verified users
        vm.startPrank(aiAgent);
        tracker.storeNullifier(creator1, 1001);
        tracker.storeNullifier(creator2, 1002);
        tracker.storeNullifier(contributor1, 2001);
        tracker.storeNullifier(contributor2, 2002);
        tracker.storeNullifier(contributor3, 2003);
        vm.stopPrank();
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor() public {
        assertEq(tracker.AI_AGENT_ADDRESS(), aiAgent);
        assertEq(tracker.owner(), owner);
        assertEq(tracker.nextIssueId(), 1);
    }
    
    function test_Constructor_RevertIf_InvalidAIAgent() public {
        vm.expectRevert("Invalid AI agent address");
        new DecentralizedIssueTracker(address(0));
    }
    
    // ============ Nullifier Tests ============
    
    function test_StoreNullifier() public {
        address newUser = makeAddr("newUser");
        uint256 nullifier = 3001;
        
        vm.prank(aiAgent);
        tracker.storeNullifier(newUser, nullifier);
        
        assertEq(tracker.addressToNullifier(newUser), nullifier);
        assertEq(tracker.nullifierToAddress(nullifier), newUser);
    }
    
    function test_StoreNullifier_RevertIf_NotAIAgent() public {
        vm.prank(creator1);
        vm.expectRevert("Only AI Agent can call this");
        tracker.storeNullifier(makeAddr("newUser"), 3001);
    }
    
    function test_StoreNullifier_RevertIf_InvalidUser() public {
        vm.prank(aiAgent);
        vm.expectRevert("Invalid user address");
        tracker.storeNullifier(address(0), 3001);
    }
    
    function test_StoreNullifier_RevertIf_InvalidNullifier() public {
        vm.prank(aiAgent);
        vm.expectRevert("Invalid nullifier");
        tracker.storeNullifier(makeAddr("newUser"), 0);
    }
    
    function test_StoreNullifier_RevertIf_AlreadyExists() public {
        vm.startPrank(aiAgent);
        vm.expectRevert("Nullifier already exists");
        tracker.storeNullifier(creator1, 9999);
        vm.stopPrank();
    }
    
    function test_StoreNullifier_RevertIf_NullifierAlreadyMapped() public {
        vm.startPrank(aiAgent);
        vm.expectRevert("Nullifier already mapped");
        tracker.storeNullifier(makeAddr("newUser"), 1001);
        vm.stopPrank();
    }
    
    // ============ Create Issue Tests ============
    
    function test_CreateIssue() public {
        vm.startPrank(creator1);
        
        uint256 bounty = MIN_BOUNTY;
        vm.expectEmit(true, true, false, true);
        emit AIPaymentSent(creator1, AI_FEE);
        
        vm.expectEmit(true, true, false, true);
        emit IssueCreated(1, creator1, "https://github.com/test/issue/1", bounty, DecentralizedIssueTracker.Difficulty.MEDIUM);
        
        uint256 issueId = tracker.createIssue{value: bounty + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test issue description",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        
        assertEq(issueId, 1);
        assertEq(tracker.nextIssueId(), 2);
        
        (
            uint256 id,
            address creator,
            string memory url,
            string memory desc,
            uint256 issueBounty,
            address assignedTo,
            bool isCompleted,
            bool isAssigned,
            ,,,,,,,,,,
        ) = tracker.getIssueInfo(issueId);
        
        assertEq(id, 1);
        assertEq(creator, creator1);
        assertEq(url, "https://github.com/test/issue/1");
        assertEq(desc, "Test issue description");
        assertEq(issueBounty, bounty);
        assertEq(assignedTo, address(0));
        assertFalse(isCompleted);
        assertFalse(isAssigned);
        
        vm.stopPrank();
    }
    
    function test_CreateIssue_RevertIf_NotVerified() public {
        address unverified = makeAddr("unverified");
        vm.deal(unverified, 1 ether);
        
        vm.prank(unverified);
        vm.expectRevert("User not verified");
        tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
    }
    
    function test_CreateIssue_RevertIf_InsufficientPayment() public {
        vm.prank(creator1);
        vm.expectRevert("Insufficient payment (must exceed AI service fee)");
        tracker.createIssue{value: AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
    }
    
    function test_CreateIssue_RevertIf_EmptyURL() public {
        vm.prank(creator1);
        vm.expectRevert("GitHub issue URL cannot be empty");
        tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
    }
    
    function test_CreateIssue_RevertIf_InvalidMinPercentage() public {
        vm.prank(creator1);
        vm.expectRevert("Minimum percentage cannot exceed 100");
        tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 101
        );
    }
    
    function test_CreateIssue_CustomDurations() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            14 days, 60 days, 300 days, 50
        );
        
        (,,,,,,,,,,,,,,uint256 easyDur, uint256 medDur, uint256 hardDur,,) = tracker.getIssueInfo(issueId);
        assertEq(easyDur, 14 days);
        assertEq(medDur, 60 days);
        assertEq(hardDur, 300 days);
    }
    
    // ============ Take Issue Tests ============
    
    function test_TakeIssue() public {
        // Create issue
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        
        // Take issue
        uint256 stake = (MIN_BOUNTY * 10) / 100; // 10% stake
        
        vm.prank(contributor1);
        vm.expectEmit(true, true, false, false);
        emit IssueAssigned(issueId, contributor1, 0);
        
        tracker.takeIssue{value: stake}(issueId);
        
        (,,,,, address assignedTo,, bool isAssigned,,,,,,uint256 deadline,,,,,) = tracker.getIssueInfo(issueId);
        
        assertEq(assignedTo, contributor1);
        assertTrue(isAssigned);
        assertGt(deadline, block.timestamp);
        assertEq(tracker.contributorStakes(contributor1), stake);
        assertTrue(tracker.hasContributorAttemptedIssue(issueId, contributor1));
    }
    
    function test_TakeIssue_RevertIf_NotVerified() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        address unverified = makeAddr("unverified");
        vm.deal(unverified, 1 ether);
        
        vm.prank(unverified);
        vm.expectRevert("User not verified");
        tracker.takeIssue{value: 0.01 ether}(issueId);
    }
    
    function test_TakeIssue_RevertIf_IssueDoesNotExist() public {
        vm.prank(contributor1);
        vm.expectRevert("Issue does not exist");
        tracker.takeIssue{value: 0.01 ether}(999);
    }
    
    function test_TakeIssue_RevertIf_AlreadyAssigned() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor2);
        vm.expectRevert("Issue already assigned");
        tracker.takeIssue{value: stake}(issueId);
    }
    
    function test_TakeIssue_RevertIf_CreatorTakesOwn() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        vm.prank(creator1);
        vm.expectRevert("Creator cannot assign issue to themselves");
        tracker.takeIssue{value: 0.01 ether}(issueId);
    }
    
    function test_TakeIssue_RevertIf_AlreadyAttempted() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // Expire the issue
        vm.warp(block.timestamp + 31 days);
        
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        // Try to take again
        vm.prank(contributor1);
        vm.expectRevert("You have already attempted this issue");
        tracker.takeIssue{value: stake}(issueId);
    }
    
    function test_TakeIssue_RevertIf_InvalidStake_TooLow() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 tooLow = (MIN_BOUNTY * 4) / 100; // 4% - below minimum
        
        vm.prank(contributor1);
        vm.expectRevert("Invalid stake amount");
        tracker.takeIssue{value: tooLow}(issueId);
    }
    
    function test_TakeIssue_RevertIf_InvalidStake_TooHigh() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 tooHigh = (MIN_BOUNTY * 21) / 100; // 21% - above maximum
        
        vm.prank(contributor1);
        vm.expectRevert("Invalid stake amount");
        tracker.takeIssue{value: tooHigh}(issueId);
    }
    
    function test_TakeIssue_DifferentDifficulties() public {
        // Easy
        vm.prank(creator1);
        uint256 easyId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Easy",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        // Medium
        vm.prank(creator1);
        uint256 mediumId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/2",
            "Medium",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        
        // Hard
        vm.prank(creator1);
        uint256 hardId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/3",
            "Hard",
            DecentralizedIssueTracker.Difficulty.HARD,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(easyId);
        
        vm.prank(contributor2);
        tracker.takeIssue{value: stake}(mediumId);
        
        vm.prank(contributor3);
        tracker.takeIssue{value: stake}(hardId);
        
        (,,,,,,,,,,,,,uint256 easyDeadline,,,,,) = tracker.getIssueInfo(easyId);
        (,,,,,,,,,,,,,uint256 medDeadline,,,,,) = tracker.getIssueInfo(mediumId);
        (,,,,,,,,,,,,,uint256 hardDeadline,,,,,) = tracker.getIssueInfo(hardId);
        
        assertEq(easyDeadline, block.timestamp + 7 days);
        assertEq(medDeadline, block.timestamp + 30 days);
        assertEq(hardDeadline, block.timestamp + 150 days);
    }
    
    // ============ Grade Issue Tests ============
    
    function test_GradeIssueByAI() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(aiAgent);
        tracker.gradeIssueByAI(issueId, 85);
        
        (,,,,,,,,,uint256 score,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(score, 85);
    }
    
    function test_GradeIssueByAI_RevertIf_NotAIAgent() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        vm.prank(contributor1);
        vm.expectRevert("Only AI Agent can call this");
        tracker.gradeIssueByAI(issueId, 85);
    }
    
    function test_GradeIssueByAI_RevertIf_InvalidScore() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(aiAgent);
        vm.expectRevert("Confidence score must be between 0 and 100");
        tracker.gradeIssueByAI(issueId, 101);
    }
    
    // ============ Complete Issue Tests ============
    
    function test_CompleteIssue() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        uint256 balanceBefore = contributor1.balance;
        
        vm.prank(creator1);
        vm.expectEmit(true, true, false, true);
        emit IssueCompleted(issueId, contributor1, MIN_BOUNTY + stake);
        
        tracker.completeIssue(issueId);

        (,,,,,, bool isCompleted,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertTrue(isCompleted);
        uint256 balanceAfter = contributor1.balance;
        assertEq(balanceAfter - balanceBefore, MIN_BOUNTY + stake);
        assertEq(tracker.contributorStakes(contributor1), 0);
    }
    
    function test_CompleteIssue_RevertIf_NotCreator() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor1);
        vm.expectRevert("Only issue creator can complete issue");
        tracker.completeIssue(issueId);
    }
    
    // ============ Percentage Claim Tests ============
    
    function test_SubmitPercentageClaim() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 50);
        
        (,,,,,,, uint256 claimed, bool underReview,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(claimed, 50);
        assertTrue(underReview);
    }
    
    function test_SubmitPercentageClaim_RevertIf_NotAssignedContributor() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor2);
        vm.expectRevert("Only assigned contributor can submit percentage");
        tracker.submitIssuePercentageClaim(issueId, 50);
    }
    
    function test_SubmitPercentageClaimResponse_Accept() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 50);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        (,,,,,,,, uint256 completed, uint256 claimed, bool underReview,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(completed, 50);
        assertEq(claimed, 0);
        assertFalse(underReview);
    }
    
    function test_SubmitPercentageClaimResponse_Reject() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 50);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, false);
        
        (,,,,,,,, uint256 completed, uint256 claimed, bool underReview,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(completed, 0);
        assertEq(claimed, 0);
        assertFalse(underReview);
    }
    
    // ============ Expired Issue Tests ============
    
    function test_ClaimExpiredIssue_WithPartialCompletion() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 30 // 30% minimum for stake return
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // Submit and accept 60% completion
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 60);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        // Warp past deadline
        vm.warp(block.timestamp + 8 days);
        
        uint256 balanceBefore = contributor1.balance;
        
        vm.prank(contributor1);
        vm.expectEmit(true, true, false, false);
        emit DeadlineExpired(issueId, contributor1);
        
        tracker.claimExpiredIssue(issueId);
        
        uint256 balanceAfter = contributor1.balance;
        uint256 expectedPayout = (MIN_BOUNTY * 60) / 100 + stake;
        
        assertEq(balanceAfter - balanceBefore, expectedPayout);
        
        (,,,,, address assignedTo,, bool isAssigned,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(assignedTo, address(0));
        assertFalse(isAssigned);
    }
    
    function test_ClaimExpiredIssue_StakeForfeiture() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50 // 50% minimum for stake return
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // Submit and accept only 30% completion (below minimum)
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 30);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        uint256 bountyBefore = MIN_BOUNTY;
        
        // Warp past deadline
        vm.warp(block.timestamp + 8 days);
        
        uint256 balanceBefore = contributor1.balance;
        
        vm.prank(contributor1);
        vm.expectEmit(true, true, false, true);
        emit StakeForfeited(issueId, contributor1, stake);
        
        tracker.claimExpiredIssue(issueId);
        
        uint256 balanceAfter = contributor1.balance;
        uint256 expectedPayout = (MIN_BOUNTY * 30) / 100; // Only bounty, no stake return
        
        assertEq(balanceAfter - balanceBefore, expectedPayout);
        
        // Verify stake was added to bounty
        (,,,, uint256 bountyAfter,,,,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(bountyAfter, bountyBefore - expectedPayout + stake);
    }
    
    function test_ClaimExpiredIssue_ZeroCompletion() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // Warp past deadline without any completion
        vm.warp(block.timestamp + 8 days);
        
        uint256 balanceBefore = contributor1.balance;
        
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        uint256 balanceAfter = contributor1.balance;
        assertEq(balanceAfter, balanceBefore); // No payout
        
        // Stake forfeited to bounty
        (,,,, uint256 bounty,,,,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(bounty, MIN_BOUNTY + stake);
    }
    
    function test_ClaimExpiredIssue_RevertIf_DeadlineNotPassed() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor1);
        vm.expectRevert("Deadline has not passed");
        tracker.claimExpiredIssue(issueId);
    }
    
    function test_ClaimExpiredIssue_RevertIf_NotAssignedContributor() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(contributor2);
        vm.expectRevert("Only assigned contributor can claim");
        tracker.claimExpiredIssue(issueId);
    }
    
    // ============ Increase Bounty Tests ============
    
    function test_IncreaseBounty() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 additionalBounty = 0.05 ether;
        
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit BountyIncreased(issueId, MIN_BOUNTY + additionalBounty);
        
        tracker.increaseBounty{value: additionalBounty}(issueId);
        
        (,,,, uint256 bounty,,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(bounty, MIN_BOUNTY + additionalBounty);
    }
    
    function test_IncreaseBounty_RevertIf_NotCreator() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        vm.prank(creator2);
        vm.expectRevert("Only issue creator can increase bounty");
        tracker.increaseBounty{value: 0.05 ether}(issueId);
    }
    
    function test_IncreaseBounty_RevertIf_NoValue() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        vm.prank(creator1);
        vm.expectRevert("Must send some ETH");
        tracker.increaseBounty(issueId);
    }
    
    function test_IncreaseBounty_RevertIf_IssueCompleted() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(creator1);
        tracker.completeIssue(issueId);
        
        vm.prank(creator1);
        vm.expectRevert("Cannot increase bounty for completed issue");
        tracker.increaseBounty{value: 0.05 ether}(issueId);
    }
    
    // ============ Increase Deadline Tests ============
    
    function test_IncreaseIssueDeadline() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        (,,,,,,,,,,,,,uint256 deadlineBefore,,,,,) = tracker.getIssueInfo(issueId);
        
        vm.prank(creator1);
        tracker.increaseIssueDeadline(issueId, 5 days);
        
        (,,,,,,,,,,,,,uint256 deadlineAfter,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(deadlineAfter, deadlineBefore + 5 days);
    }
    
    function test_IncreaseIssueDeadline_RevertIf_NotCreator() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(creator2);
        vm.expectRevert("Only issue creator can extend deadline");
        tracker.increaseIssueDeadline(issueId, 5 days);
    }
    
    function test_IncreaseIssueDeadline_RevertIf_ZeroTime() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(creator1);
        vm.expectRevert("Time extension must be greater than zero");
        tracker.increaseIssueDeadline(issueId, 0);
    }
    
    // ============ Increase Difficulty Tests ============
    
    function test_IncreaseIssueDifficulty() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(creator1);
        tracker.increaseIssueDifficulty(issueId, DecentralizedIssueTracker.Difficulty.HARD);
        
        (,,,,,,,,,,,,DecentralizedIssueTracker.Difficulty difficulty,,,,,,) = tracker.getIssueInfo(issueId);
        assertTrue(difficulty == DecentralizedIssueTracker.Difficulty.HARD);
    }
    
    function test_IncreaseIssueDifficulty_RevertIf_NotIncreasing() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(creator1);
        vm.expectRevert("New difficulty must be greater than previous");
        tracker.increaseIssueDifficulty(issueId, DecentralizedIssueTracker.Difficulty.EASY);
    }
    
    // ============ View Function Tests ============
    
    function test_GetCreatorIssues() public {
        vm.startPrank(creator1);
        uint256 id1 = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test 1",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        uint256 id2 = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/2",
            "Test 2",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        vm.stopPrank();
        
        uint256[] memory issues = tracker.getCreatorIssues(creator1);
        assertEq(issues.length, 2);
        assertEq(issues[0], id1);
        assertEq(issues[1], id2);
    }
    
    function test_GetContributorAssignedIssues() public {
        vm.prank(creator1);
        uint256 id1 = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        vm.prank(creator1);
        uint256 id2 = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/2",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(id1);
        
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(id2);
        
        uint256[] memory issues = tracker.getContributorAssignedIssues(contributor1);
        assertEq(issues.length, 2);
    }
    
    function test_GetIssuePreviousContributors() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.warp(block.timestamp + 31 days);
        
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        vm.prank(contributor2);
        tracker.takeIssue{value: stake}(issueId);
        
        address[] memory contributors = tracker.getIssuePreviousContributors(issueId);
        assertEq(contributors.length, 2);
        assertEq(contributors[0], contributor1);
        assertEq(contributors[1], contributor2);
    }
    
    function test_IsIssueExpired() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        assertFalse(tracker.isIssueExpired(issueId));
        
        vm.warp(block.timestamp + 8 days);
        
        assertTrue(tracker.isIssueExpired(issueId));
    }
    
    function test_GetContractBalance() public {
        assertEq(tracker.getContractBalance(), 0);
        
        vm.prank(creator1);
        tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        assertEq(tracker.getContractBalance(), MIN_BOUNTY);
    }
    
    // ============ Owner Function Tests ============
    
    function test_UpdateAIAgentAddress() public {
        address newAIAgent = makeAddr("newAIAgent");
        
        tracker.updateAIAgentAddress(newAIAgent);
        
        assertEq(tracker.AI_AGENT_ADDRESS(), newAIAgent);
    }
    
    function test_UpdateAIAgentAddress_RevertIf_NotOwner() public {
        address newAIAgent = makeAddr("newAIAgent");
        
        vm.prank(creator1);
        vm.expectRevert();
        tracker.updateAIAgentAddress(newAIAgent);
    }
    
    function test_UpdateAIAgentAddress_RevertIf_InvalidAddress() public {
        vm.expectRevert("Invalid AI agent address");
        tracker.updateAIAgentAddress(address(0));
    }
    
    // ============ Complex Scenario Tests ============
    
    function test_CompleteWorkflow() public {
        // Creator creates issue
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Implement feature X",
            DecentralizedIssueTracker.Difficulty.MEDIUM,
            0, 0, 0, 40
        );
        
        // Contributor takes issue
        uint256 stake = (MIN_BOUNTY * 15) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // AI grades the work
        vm.prank(aiAgent);
        tracker.gradeIssueByAI(issueId, 90);
        
        // Contributor submits progress claims
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 50);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 100);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        // Creator completes issue
        uint256 balanceBefore = contributor1.balance;
        
        vm.prank(creator1);
        tracker.completeIssue(issueId);
        
        uint256 balanceAfter = contributor1.balance;
        assertEq(balanceAfter - balanceBefore, MIN_BOUNTY + stake);
    }
    
    function test_MultipleContributorsSequential() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Hard problem",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        // First contributor attempts
        uint256 stake1 = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake1}(issueId);
        
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 30);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        // Deadline expires
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        // Second contributor takes it
        uint256 stake2 = (MIN_BOUNTY * 10) / 100;
        uint256 remainingBounty = MIN_BOUNTY - (MIN_BOUNTY * 30) / 100 + stake1;
        
        vm.prank(contributor2);
        tracker.takeIssue{value: stake2}(issueId);
        
        vm.prank(contributor2);
        tracker.submitIssuePercentageClaim(issueId, 100);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        uint256 balanceBefore = contributor2.balance;
        
        vm.prank(creator1);
        tracker.completeIssue(issueId);
        
        uint256 balanceAfter = contributor2.balance;
        assertEq(balanceAfter - balanceBefore, remainingBounty + stake2);
    }
    
    function test_IncreaseBountyWhileAssigned() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // Creator increases bounty
        uint256 additionalBounty = 0.1 ether;
        vm.prank(creator1);
        tracker.increaseBounty{value: additionalBounty}(issueId);
        
        // Complete and verify total payout
        uint256 balanceBefore = contributor1.balance;
        
        vm.prank(creator1);
        tracker.completeIssue(issueId);
        
        uint256 balanceAfter = contributor1.balance;
        assertEq(balanceAfter - balanceBefore, MIN_BOUNTY + additionalBounty + stake);
    }
    
    function test_AIFeeDistribution() public {
        uint256 aiBalanceBefore = aiAgent.balance;
        
        vm.prank(creator1);
        tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 aiBalanceAfter = aiAgent.balance;
        assertEq(aiBalanceAfter - aiBalanceBefore, AI_FEE);
    }
    
    // ============ Edge Case Tests ============
    
    function test_ZeroPercentageCompletion_StakeForfeited() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 1 // Even 1% required
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.warp(block.timestamp + 8 days);
        
        (,,,, uint256 bountyBefore,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        (,,,, uint256 bountyAfter,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(bountyAfter, bountyBefore + stake);
    }
    
    function test_ExactMinimumStake() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 minStake = (MIN_BOUNTY * 5) / 100;
        
        vm.prank(contributor1);
        tracker.takeIssue{value: minStake}(issueId);
        
        assertEq(tracker.contributorStakes(contributor1), minStake);
    }
    
    function test_ExactMaximumStake() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 maxStake = (MIN_BOUNTY * 20) / 100;
        
        vm.prank(contributor1);
        tracker.takeIssue{value: maxStake}(issueId);
        
        assertEq(tracker.contributorStakes(contributor1), maxStake);
    }
    
    function test_RevertIf_BountyDepleted() public {
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 0
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        // Claim 100% completion
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, 100);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        // Expire and claim full bounty
        vm.warp(block.timestamp + 8 days);
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        // Try to take depleted issue
        vm.prank(contributor2);
        vm.expectRevert("Issue bounty has been depleted");
        tracker.takeIssue{value: stake}(issueId);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_CreateIssueWithVariousBounties(uint256 bounty) public {
        bounty = bound(bounty, AI_FEE + 1, 1000 ether);
        
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: bounty}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        (,,,, uint256 issueBounty,,,,,,,,,,,,,,,) = tracker.getIssueInfo(issueId);
        assertEq(issueBounty, bounty - AI_FEE);
    }
    
    function testFuzz_StakeAmounts(uint8 percentageStake) public {
        percentageStake = uint8(bound(percentageStake, 5, 20));
        
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 50
        );
        
        uint256 stake = (MIN_BOUNTY * percentageStake) / 100;
        
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        assertEq(tracker.contributorStakes(contributor1), stake);
    }
    
    function testFuzz_PercentageCompletion(uint8 percentage) public {
        percentage = uint8(bound(percentage, 1, 100));
        
        vm.prank(creator1);
        uint256 issueId = tracker.createIssue{value: MIN_BOUNTY + AI_FEE}(
            "https://github.com/test/issue/1",
            "Test",
            DecentralizedIssueTracker.Difficulty.EASY,
            0, 0, 0, 0
        );
        
        uint256 stake = (MIN_BOUNTY * 10) / 100;
        vm.prank(contributor1);
        tracker.takeIssue{value: stake}(issueId);
        
        vm.prank(contributor1);
        tracker.submitIssuePercentageClaim(issueId, percentage);
        
        vm.prank(creator1);
        tracker.submitIssuePercentageClaimResponse(issueId, true);
        
        vm.warp(block.timestamp + 8 days);
        
        uint256 balanceBefore = contributor1.balance;
        vm.prank(contributor1);
        tracker.claimExpiredIssue(issueId);
        
        uint256 balanceAfter = contributor1.balance;
        uint256 expectedBounty = (MIN_BOUNTY * percentage) / 100;
        assertEq(balanceAfter - balanceBefore, expectedBounty + stake);
    }
}