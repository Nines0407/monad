// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SessionKeyManager} from "../src/SessionKeyManager.sol";

contract SessionKeyManagerTest is Test {
    SessionKeyManager public manager;
    address public wallet = address(0x111);
    address public sessionKey = address(0x222);

    function setUp() public {
        manager = new SessionKeyManager();
    }

    function test_RegisterSessionKey() public {
        vm.prank(wallet);
        SessionKeyManager.SessionKeyPermissions memory perms = SessionKeyManager.SessionKeyPermissions({
            maxAmount: 100 ether,
            allowedRecipients: new address[](0),
            allowedFunctions: new bytes4[](0),
            expiry: uint48(block.timestamp + 1 days),
            requireApproval: false
        });
        manager.registerSessionKey(wallet, sessionKey, perms);

        SessionKeyManager.SessionKeyPermissions memory retrieved = manager.getPermissions(wallet, sessionKey);
        assertEq(retrieved.maxAmount, 100 ether);
        assertEq(retrieved.expiry, perms.expiry);
    }

    function test_IsSessionKeyValid_ValidKey() public {
        vm.prank(wallet);
        SessionKeyManager.SessionKeyPermissions memory perms = SessionKeyManager.SessionKeyPermissions({
            maxAmount: 100 ether,
            allowedRecipients: new address[](0),
            allowedFunctions: new bytes4[](0),
            expiry: uint48(block.timestamp + 1 days),
            requireApproval: false
        });
        manager.registerSessionKey(wallet, sessionKey, perms);

        bool valid = manager.isSessionKeyValid(wallet, sessionKey, 1 ether, address(0x333), bytes4(0));
        assertTrue(valid);
    }

    function test_IsSessionKeyValid_ExceedsAmount() public {
        vm.prank(wallet);
        SessionKeyManager.SessionKeyPermissions memory perms = SessionKeyManager.SessionKeyPermissions({
            maxAmount: 1 ether,
            allowedRecipients: new address[](0),
            allowedFunctions: new bytes4[](0),
            expiry: uint48(block.timestamp + 1 days),
            requireApproval: false
        });
        manager.registerSessionKey(wallet, sessionKey, perms);

        bool valid = manager.isSessionKeyValid(wallet, sessionKey, 2 ether, address(0x333), bytes4(0));
        assertFalse(valid);
    }

    function test_RevokeSessionKey() public {
        vm.prank(wallet);
        SessionKeyManager.SessionKeyPermissions memory perms = SessionKeyManager.SessionKeyPermissions({
            maxAmount: 100 ether,
            allowedRecipients: new address[](0),
            allowedFunctions: new bytes4[](0),
            expiry: uint48(block.timestamp + 1 days),
            requireApproval: false
        });
        manager.registerSessionKey(wallet, sessionKey, perms);

        vm.prank(wallet);
        manager.revokeSessionKey(wallet, sessionKey);

        SessionKeyManager.SessionKeyMetadata memory metadata = manager.getMetadata(wallet, sessionKey);
        assertTrue(metadata.revoked);
    }
}