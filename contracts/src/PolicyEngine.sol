// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAgentWallet} from "./IAgentWallet.sol";

interface IPolicyEngine {
    enum PolicyType {
        AMOUNT_LIMIT,
        RECIPIENT_WHITELIST,
        RECIPIENT_BLACKLIST,
        TOKEN_RESTRICTION,
        TIME_WINDOW,
        MANUAL_APPROVAL,
        RISK_SCORE
    }

    struct Policy {
        PolicyType policyType;
        bytes data;
        uint256 priority;
        bool active;
    }

    struct EvaluationResult {
        bool allowed;
        string reason;
        Policy[] violatedPolicies;
    }

    event PolicyAdded(address indexed wallet, uint256 policyId, PolicyType policyType);
    event PolicyRemoved(address indexed wallet, uint256 policyId);
    event PolicyEvaluated(address indexed wallet, bool allowed, string reason);

    function evaluate(
        address wallet,
        uint256 amount,
        address recipient,
        address token,
        bytes calldata data
    ) external returns (EvaluationResult memory);

    function addPolicy(address wallet, Policy calldata policy) external returns (uint256 policyId);

    function removePolicy(address wallet, uint256 policyId) external;

    function checkCompliance(address wallet, bytes32 txHash) external view returns (bool);

    function getViolations(
        address wallet,
        uint256 amount,
        address recipient,
        address token,
        bytes calldata data
    ) external view returns (Policy[] memory);
}

contract PolicyEngine is IPolicyEngine {
    // wallet => policyId => Policy
    mapping(address => mapping(uint256 => Policy)) private _policies;
    mapping(address => uint256) private _policyCount;

    // wallet => txHash => compliance status
    mapping(address => mapping(bytes32 => bool)) private _compliance;

    modifier onlyWalletOwner(address wallet) {
        require(msg.sender == wallet, "not wallet owner");
        _;
    }

    function evaluate(
        address wallet,
        uint256 amount,
        address recipient,
        address token,
        bytes calldata data
    ) external override returns (EvaluationResult memory) {
        Policy[] memory violatedPolicies = new Policy[](10); // max 10 violations
        uint256 violationCount = 0;

        // Iterate through all policies
        for (uint256 i = 0; i < _policyCount[wallet]; i++) {
            Policy storage policy = _policies[wallet][i];
            if (!policy.active) continue;

            bool passes = _checkPolicy(policy, amount, recipient, token, data);
            if (!passes) {
                violatedPolicies[violationCount] = policy;
                violationCount++;
            }
        }

        // Prepare result
        bool allowed = violationCount == 0;
        string memory reason = allowed ? "approved" : "policy violation";

        // Trim violatedPolicies array
        Policy[] memory finalViolations = new Policy[](violationCount);
        for (uint256 i = 0; i < violationCount; i++) {
            finalViolations[i] = violatedPolicies[i];
        }

        emit PolicyEvaluated(wallet, allowed, reason);

        return EvaluationResult({
            allowed: allowed,
            reason: reason,
            violatedPolicies: finalViolations
        });
    }

    function _checkPolicy(
        Policy storage policy,
        uint256 amount,
        address recipient,
        address token,
        bytes calldata data
    ) internal view returns (bool) {
        if (policy.policyType == PolicyType.AMOUNT_LIMIT) {
            uint256 limit = abi.decode(policy.data, (uint256));
            return amount <= limit;
        } else if (policy.policyType == PolicyType.RECIPIENT_WHITELIST) {
            address[] memory whitelist = abi.decode(policy.data, (address[]));
            for (uint256 i = 0; i < whitelist.length; i++) {
                if (whitelist[i] == recipient) return true;
            }
            return false;
        } else if (policy.policyType == PolicyType.RECIPIENT_BLACKLIST) {
            address[] memory blacklist = abi.decode(policy.data, (address[]));
            for (uint256 i = 0; i < blacklist.length; i++) {
                if (blacklist[i] == recipient) return false;
            }
            return true;
        } else if (policy.policyType == PolicyType.TIME_WINDOW) {
            (uint256 start, uint256 end) = abi.decode(policy.data, (uint256, uint256));
            return block.timestamp >= start && block.timestamp <= end;
        }
        // TODO: Implement other policy types
        return true;
    }

    function addPolicy(address wallet, Policy calldata policy) external override onlyWalletOwner(wallet) returns (uint256) {
        uint256 policyId = _policyCount[wallet];
        _policies[wallet][policyId] = policy;
        _policyCount[wallet]++;
        emit PolicyAdded(wallet, policyId, policy.policyType);
        return policyId;
    }

    function removePolicy(address wallet, uint256 policyId) external override onlyWalletOwner(wallet) {
        require(policyId < _policyCount[wallet], "invalid policy id");
        delete _policies[wallet][policyId];
        emit PolicyRemoved(wallet, policyId);
    }

    function checkCompliance(address wallet, bytes32 txHash) external view override returns (bool) {
        return _compliance[wallet][txHash];
    }

    function getViolations(
        address wallet,
        uint256 amount,
        address recipient,
        address token,
        bytes calldata data
    ) external view override returns (Policy[] memory) {
        // Similar to evaluate but view-only
        Policy[] memory violatedPolicies = new Policy[](_policyCount[wallet]);
        uint256 violationCount = 0;

        for (uint256 i = 0; i < _policyCount[wallet]; i++) {
            Policy storage policy = _policies[wallet][i];
            if (!policy.active) continue;

            bool passes = _checkPolicy(policy, amount, recipient, token, data);
            if (!passes) {
                violatedPolicies[violationCount] = policy;
                violationCount++;
            }
        }

        // Trim array
        Policy[] memory result = new Policy[](violationCount);
        for (uint256 i = 0; i < violationCount; i++) {
            result[i] = violatedPolicies[i];
        }
        return result;
    }
}