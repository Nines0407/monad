// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {AgentWallet} from "../src/AgentWallet.sol";
import {SessionKeyManager} from "../src/SessionKeyManager.sol";
import {PolicyEngine} from "../src/PolicyEngine.sol";
import {AuditLogger} from "../src/AuditLogger.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address entryPoint = vm.envAddress("ENTRY_POINT_ADDRESS");
        address owner = vm.envAddress("WALLET_OWNER");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy AuditLogger first (lowest dependency)
        AuditLogger auditLogger = new AuditLogger();
        console.log("AuditLogger deployed at:", address(auditLogger));

        // Deploy SessionKeyManager
        SessionKeyManager sessionKeyManager = new SessionKeyManager();
        console.log("SessionKeyManager deployed at:", address(sessionKeyManager));

        // Deploy PolicyEngine
        PolicyEngine policyEngine = new PolicyEngine();
        console.log("PolicyEngine deployed at:", address(policyEngine));

        // Deploy AgentWallet with entry point and owner
        AgentWallet agentWallet = new AgentWallet(IEntryPoint(entryPoint), owner);
        console.log("AgentWallet deployed at:", address(agentWallet));

        vm.stopBroadcast();
    }
}