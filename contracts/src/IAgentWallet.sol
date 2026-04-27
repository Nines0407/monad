// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentWallet {
    function executeUserOp(
        bytes calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external;

    function validateUserOp(
        bytes calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);

    function pause() external;
    function resume() external;
}