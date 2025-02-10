// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SafeVaultFactory} from "../src/SafeVaultFactory.sol";

contract SafeVaultFactoryScript is Script {
    SafeVaultFactory public safeVaultFactory;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        safeVaultFactory = new SafeVaultFactory();

        vm.stopBroadcast();
    }
}
