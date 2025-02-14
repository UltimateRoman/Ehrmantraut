// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { ECDSAServiceManagerBase } from "@eigenlayer-middleware/src/unaudited/ECDSAServiceManagerBase.sol";
import { ECDSAStakeRegistry } from "@eigenlayer-middleware/src/unaudited/ECDSAStakeRegistry.sol";
import { IServiceManager } from "@eigenlayer-middleware/src/interfaces/IServiceManager.sol";
import { ECDSAUpgradeable } from "@openzeppelin-upgrades/contracts/utils/cryptography/ECDSAUpgradeable.sol";
import { IERC1271Upgradeable } from "@openzeppelin-upgrades/contracts/interfaces/IERC1271Upgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@eigenlayer/contracts/interfaces/IRewardsCoordinator.sol";
import { ISafeVaultServiceManager } from "./ISafeVaultServiceManager.sol";

contract SafeVaultServiceManager is ECDSAServiceManagerBase, ISafeVaultServiceManager {
    using ECDSAUpgradeable for bytes32;

    uint32 public latestTaskNum;

    mapping(uint32 => bytes32) public allTaskHashes;

    mapping(address => mapping(uint32 => bytes)) public allTaskResponses;

    modifier onlyOperator() {
        require(
            ECDSAStakeRegistry(stakeRegistry).operatorRegistered(msg.sender),
            "Operator must be the caller"
        );
        _;
    }

    constructor(
        address _avsDirectory,
        address _stakeRegistry,
        address _rewardsCoordinator,
        address _delegationManager

    )
        ECDSAServiceManagerBase(
            _avsDirectory,
            _stakeRegistry,
            _rewardsCoordinator,
            _delegationManager
        )
    {}

    function initialize(
        address initialOwner,
        address _rewardsInitiator
    ) external initializer {
        __ServiceManagerBase_init(initialOwner, _rewardsInitiator);
    }

    function createNewTask(
        string memory proof
    ) external returns (Task memory) {
        Task memory newTask;
        newTask.proof = proof;
        newTask.taskCreatedBlock = uint32(block.number);

        allTaskHashes[latestTaskNum] = keccak256(abi.encode(newTask));
        emit NewTaskCreated(latestTaskNum, newTask);
        latestTaskNum = latestTaskNum + 1;

        return newTask;
    }

    function respondToTask(
        Task calldata task,
        uint32 referenceTaskIndex,
        bytes memory signature
    ) external {
        require(
            keccak256(abi.encode(task)) == allTaskHashes[referenceTaskIndex],
            "supplied task does not match the one recorded in the contract"
        );
        require(
            allTaskResponses[msg.sender][referenceTaskIndex].length == 0,
            "Operator has already responded to the task"
        );

        bytes32 messageHash = keccak256(abi.encodePacked(task.proof));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        bytes4 magicValue = IERC1271Upgradeable.isValidSignature.selector;
        if (!(magicValue == ECDSAStakeRegistry(stakeRegistry).isValidSignature(ethSignedMessageHash,signature))){
            revert();
        }

        allTaskResponses[msg.sender][referenceTaskIndex] = signature;

        emit TaskResponded(referenceTaskIndex, task, msg.sender);
    }
}