// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SafeVault is OwnableUpgradeable {
    uint256 public lastAccessTime;

    event UnlockVaultSignal(uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner) initializer public {
        __Ownable_init(owner);
    }

    function UnlockVault() external onlyOwner {
        lastAccessTime = block.timestamp;
        emit UnlockVaultSignal(lastAccessTime);
    }
}
