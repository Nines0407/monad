// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAgentWallet} from "./IAgentWallet.sol";

interface ISessionKeyManager {
    struct SessionKeyPermissions {
        uint256 maxAmount;
        address[] allowedRecipients;
        bytes4[] allowedFunctions;
        uint48 expiry;
        bool requireApproval;
    }

    struct SessionKeyMetadata {
        uint48 creationTime;
        uint48 lastUsed;
        uint32 usageCount;
        bool revoked;
    }

    event SessionKeyRegistered(address indexed wallet, address indexed sessionKey, uint48 expiry);
    event SessionKeyRevoked(address indexed wallet, address indexed sessionKey);
    event SessionKeyUsed(address indexed wallet, address indexed sessionKey, uint256 amount);

    function registerSessionKey(
        address wallet,
        address sessionKey,
        SessionKeyPermissions calldata permissions
    ) external;

    function revokeSessionKey(address wallet, address sessionKey) external;

    function isSessionKeyValid(
        address wallet,
        address sessionKey,
        uint256 amount,
        address recipient,
        bytes4 functionSelector
    ) external view returns (bool);

    function rotateSessionKeys(address wallet, address[] calldata oldKeys, address[] calldata newKeys) external;

    function getPermissions(address wallet, address sessionKey) external view returns (SessionKeyPermissions memory);

    function getMetadata(address wallet, address sessionKey) external view returns (SessionKeyMetadata memory);
}

contract SessionKeyManager is ISessionKeyManager {
    // wallet => sessionKey => permissions
    mapping(address => mapping(address => SessionKeyPermissions)) private _permissions;
    mapping(address => mapping(address => SessionKeyMetadata)) private _metadata;

    modifier onlyWalletOwner(address wallet) {
        // In reality, this should check wallet ownership
        require(msg.sender == wallet, "not wallet owner");
        _;
    }

    function registerSessionKey(
        address wallet,
        address sessionKey,
        SessionKeyPermissions calldata permissions
    ) external override onlyWalletOwner(wallet) {
        require(permissions.expiry > block.timestamp, "expiry in past");
        require(_permissions[wallet][sessionKey].expiry == 0, "key already registered");

        _permissions[wallet][sessionKey] = permissions;
        _metadata[wallet][sessionKey] = SessionKeyMetadata({
            creationTime: uint48(block.timestamp),
            lastUsed: 0,
            usageCount: 0,
            revoked: false
        });

        emit SessionKeyRegistered(wallet, sessionKey, permissions.expiry);
    }

    function revokeSessionKey(address wallet, address sessionKey) external override onlyWalletOwner(wallet) {
        require(_permissions[wallet][sessionKey].expiry != 0, "key not found");
        _metadata[wallet][sessionKey].revoked = true;
        emit SessionKeyRevoked(wallet, sessionKey);
    }

    function isSessionKeyValid(
        address wallet,
        address sessionKey,
        uint256 amount,
        address recipient,
        bytes4 functionSelector
    ) external view override returns (bool) {
        SessionKeyPermissions storage permissions = _permissions[wallet][sessionKey];
        SessionKeyMetadata storage metadata = _metadata[wallet][sessionKey];

        if (permissions.expiry == 0) return false;
        if (metadata.revoked) return false;
        if (permissions.expiry < block.timestamp) return false;
        if (amount > permissions.maxAmount) return false;

        // Check recipient whitelist
        if (permissions.allowedRecipients.length > 0) {
            bool recipientAllowed = false;
            for (uint i = 0; i < permissions.allowedRecipients.length; i++) {
                if (permissions.allowedRecipients[i] == recipient) {
                    recipientAllowed = true;
                    break;
                }
            }
            if (!recipientAllowed) return false;
        }

        // Check function selector whitelist
        if (permissions.allowedFunctions.length > 0) {
            bool functionAllowed = false;
            for (uint i = 0; i < permissions.allowedFunctions.length; i++) {
                if (permissions.allowedFunctions[i] == functionSelector) {
                    functionAllowed = true;
                    break;
                }
            }
            if (!functionAllowed) return false;
        }

        return true;
    }

    function rotateSessionKeys(
        address wallet,
        address[] calldata oldKeys,
        address[] calldata newKeys
    ) external override onlyWalletOwner(wallet) {
        require(oldKeys.length == newKeys.length, "length mismatch");
        for (uint i = 0; i < oldKeys.length; i++) {
            revokeSessionKey(wallet, oldKeys[i]);
            // Register new key with same permissions (simplified)
            SessionKeyPermissions storage oldPerm = _permissions[wallet][oldKeys[i]];
            _permissions[wallet][newKeys[i]] = oldPerm;
            _metadata[wallet][newKeys[i]] = SessionKeyMetadata({
                creationTime: uint48(block.timestamp),
                lastUsed: 0,
                usageCount: 0,
                revoked: false
            });
            emit SessionKeyRegistered(wallet, newKeys[i], oldPerm.expiry);
        }
    }

    function getPermissions(
        address wallet,
        address sessionKey
    ) external view override returns (SessionKeyPermissions memory) {
        return _permissions[wallet][sessionKey];
    }

    function getMetadata(
        address wallet,
        address sessionKey
    ) external view override returns (SessionKeyMetadata memory) {
        return _metadata[wallet][sessionKey];
    }
}