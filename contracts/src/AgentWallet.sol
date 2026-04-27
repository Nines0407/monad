// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseAccount} from "openzeppelin-contracts/contracts/account/BaseAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";
import {ISessionKeyManager} from "./SessionKeyManager.sol";
import {IPolicyEngine} from "./PolicyEngine.sol";

contract AgentWallet is BaseAccount {
    IEntryPoint private immutable _entryPoint;
    address private immutable _owner;
    ISessionKeyManager private immutable _sessionKeyManager;
    IPolicyEngine private immutable _policyEngine;

    constructor(
        IEntryPoint entryPoint,
        address owner,
        ISessionKeyManager sessionKeyManager,
        IPolicyEngine policyEngine
    ) {
        _entryPoint = entryPoint;
        _owner = owner;
        _sessionKeyManager = sessionKeyManager;
        _policyEngine = policyEngine;
    }

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal
        view
        override
        returns (uint256 validationData)
    {
        // Try session key validation first
        (address sessionKey, bytes memory signature) = _extractSessionKeyAndSignature(userOp.signature);
        if (sessionKey != address(0)) {
            // Verify session key is valid for this wallet
            bool isValid = _sessionKeyManager.isSessionKeyValid(
                address(this),
                sessionKey,
                userOp.callGasLimit, // amount approximation; should extract actual amount from calldata
                userOp.to,
                bytes4(userOp.callData)
            );
            if (isValid) {
                // Verify signature
                if (_verifySignature(sessionKey, userOpHash, signature)) {
                    return 0; // validation passed
                }
            }
        }
        
        // Fallback to owner validation
        if (_verifySignature(_owner, userOpHash, userOp.signature)) {
            return 0;
        }
        
        return SIG_VALIDATION_FAILED;
    }

    function _extractSessionKeyAndSignature(bytes memory signature) internal pure returns (address, bytes memory) {
        // Format: first 20 bytes = session key address, remaining bytes = signature
        if (signature.length < 20) {
            return (address(0), signature);
        }
        address sessionKey;
        assembly {
            sessionKey := mload(add(signature, 20))
        }
        bytes memory actualSignature = new bytes(signature.length - 20);
        for (uint256 i = 0; i < actualSignature.length; i++) {
            actualSignature[i] = signature[i + 20];
        }
        return (sessionKey, actualSignature);
    }
    
    function _verifySignature(address signer, bytes32 hash, bytes memory signature) internal pure returns (bool) {
        // Simplified signature verification - in production use proper ecrecover
        // For now, assume signature is 65 bytes ECDSA
        if (signature.length != 65) return false;
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        address recovered = ecrecover(hash, v, r, s);
        return recovered == signer;
    }

    function executeUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override {
        require(msg.sender == address(entryPoint()), "only entry point");
        _validateSignature(userOp, userOpHash);
        // TODO: Implement execution logic
        // Pay prefund
        if (missingAccountFunds > 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "prefund failed");
        }
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        // TODO: Implement validation with session keys and policy engine
        return _validateSignature(userOp, userOpHash);
    }

    // Emergency pause/resume functionality
    bool private _paused;

    modifier whenNotPaused() {
        require(!_paused, "paused");
        _;
    }

    function pause() external {
        require(msg.sender == _owner, "only owner");
        _paused = true;
    }

    function resume() external {
        require(msg.sender == _owner, "only owner");
        _paused = false;
    }
}