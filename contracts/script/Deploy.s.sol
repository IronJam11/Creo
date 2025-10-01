// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/DecentralizedIssueTracker.sol";

contract DeployDecentralizedIssueTracker is Script {
    function run() external {
        // Load deployer account
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // The AI agent address (can be your own or any test address for now)
        address aiAgent = 0x000000000000000000000000000000000000dEaD;

        vm.startBroadcast(deployerPrivateKey);

        DecentralizedIssueTracker tracker = new DecentralizedIssueTracker(aiAgent);

        console.log("DecentralizedIssueTracker deployed at:", address(tracker));

        vm.stopBroadcast();
    }
}
