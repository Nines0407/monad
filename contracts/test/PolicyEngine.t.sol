// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PolicyEngine} from "../src/PolicyEngine.sol";

contract PolicyEngineTest is Test {
    PolicyEngine public engine;
    address public wallet = address(0x111);

    function setUp() public {
        engine = new PolicyEngine();
    }

    function test_AddPolicy() public {
        vm.prank(wallet);
        PolicyEngine.Policy memory policy = PolicyEngine.Policy({
            policyType: PolicyEngine.PolicyType.AMOUNT_LIMIT,
            data: abi.encode(uint256(100 ether)),
            priority: 1,
            active: true
        });
        uint256 policyId = engine.addPolicy(wallet, policy);

        // Verify policy added
        // (No getter in interface, but we can test via evaluate)
    }

    function test_Evaluate_AmountLimit_Pass() public {
        vm.prank(wallet);
        PolicyEngine.Policy memory policy = PolicyEngine.Policy({
            policyType: PolicyEngine.PolicyType.AMOUNT_LIMIT,
            data: abi.encode(uint256(100 ether)),
            priority: 1,
            active: true
        });
        engine.addPolicy(wallet, policy);

        PolicyEngine.EvaluationResult memory result = engine.evaluate(wallet, 50 ether, address(0x222), address(0), "");
        assertTrue(result.allowed);
    }

    function test_Evaluate_AmountLimit_Fail() public {
        vm.prank(wallet);
        PolicyEngine.Policy memory policy = PolicyEngine.Policy({
            policyType: PolicyEngine.PolicyType.AMOUNT_LIMIT,
            data: abi.encode(uint256(100 ether)),
            priority: 1,
            active: true
        });
        engine.addPolicy(wallet, policy);

        PolicyEngine.EvaluationResult memory result = engine.evaluate(wallet, 150 ether, address(0x222), address(0), "");
        assertFalse(result.allowed);
        assertEq(result.violatedPolicies.length, 1);
    }

    function test_Evaluate_RecipientWhitelist() public {
        address[] memory whitelist = new address[](2);
        whitelist[0] = address(0x222);
        whitelist[1] = address(0x333);

        vm.prank(wallet);
        PolicyEngine.Policy memory policy = PolicyEngine.Policy({
            policyType: PolicyEngine.PolicyType.RECIPIENT_WHITELIST,
            data: abi.encode(whitelist),
            priority: 1,
            active: true
        });
        engine.addPolicy(wallet, policy);

        // Whitelisted recipient should pass
        PolicyEngine.EvaluationResult memory result1 = engine.evaluate(wallet, 1 ether, address(0x222), address(0), "");
        assertTrue(result1.allowed);

        // Non-whitelisted recipient should fail
        PolicyEngine.EvaluationResult memory result2 = engine.evaluate(wallet, 1 ether, address(0x444), address(0), "");
        assertFalse(result2.allowed);
    }

    function test_RemovePolicy() public {
        vm.prank(wallet);
        PolicyEngine.Policy memory policy = PolicyEngine.Policy({
            policyType: PolicyEngine.PolicyType.AMOUNT_LIMIT,
            data: abi.encode(uint256(100 ether)),
            priority: 1,
            active: true
        });
        uint256 policyId = engine.addPolicy(wallet, policy);

        vm.prank(wallet);
        engine.removePolicy(wallet, policyId);

        // Policy should no longer affect evaluation
        PolicyEngine.EvaluationResult memory result = engine.evaluate(wallet, 150 ether, address(0x222), address(0), "");
        assertTrue(result.allowed); // No active policies
    }
}