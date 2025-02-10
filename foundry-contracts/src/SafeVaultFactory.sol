// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./SafeVault.sol";

contract SafeVaultFactory {
    address public immutable implementation;

    event CreatedVault(address vault, address owner);

    constructor() {
        implementation = address(new SafeVault());
    }

    function CreateVault(address owner) external {
        address clone = Clones.clone(implementation);
        SafeVault(clone).initialize(owner);
        emit CreatedVault(clone, block.timestamp);
    }
}
