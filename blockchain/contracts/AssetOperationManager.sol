// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./MaterialManager.sol";
import "./KBCAccessControl.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract AssetOperationManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum AssetOperationType { CONSOLIDATION, TRANSFORMATION }

    event AssetOperationRegistered(uint256 indexed id, string name, uint256 outputMaterialId);
    event AssetOperationUpdated(uint256 indexed id);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "AssetOperationManager: Caller is not the admin");
        _;
    }

    struct AssetOperation {
        uint256 id;
        string name;
        uint256[] inputMaterialIds;
        uint256 outputMaterialId;
        string latitude;
        string longitude;
        string[] processTypes;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(address => uint256[]) private _assetOperationIdsOfOwner;
    mapping(uint256 => AssetOperation) private _assetOperations;

    MaterialManager private _materialManager;
    EnumerableType private _processTypeManager;

    constructor(address delegateManagerAddress, address materialManagerAddress, address processTypeManagerAddress) KBCAccessControl(delegateManagerAddress) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());

        _materialManager = MaterialManager(materialManagerAddress);
        _processTypeManager = EnumerableType(processTypeManagerAddress);
    }

    function getAssetOperationsCounter(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256) {
        return _counter.current();
    }

    function getAssetOperationExists(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (bool) {
        return _assetOperations[id].exists;
    }

    function getAssetOperationIdsOfCreator(RoleProof memory roleProof, address creator) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _assetOperationIdsOfOwner[creator];
    }

    function getAssetOperation(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (AssetOperation memory) {
        require(getAssetOperationExists(roleProof, id), "AssetOperationManager: Asset operation does not exist");
        return _assetOperations[id];
    }

    function getAssetOperationType(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (AssetOperationType) {
        require(getAssetOperationExists(roleProof, id), "AssetOperationManager: Asset operation does not exist");
        return _assetOperations[id].inputMaterialIds.length == 1 ? AssetOperationType.CONSOLIDATION : AssetOperationType.TRANSFORMATION;
    }

    function registerAssetOperation(
        RoleProof memory roleProof,
        string memory name,
        uint256[] memory inputMaterialsIds,
        uint256 outputMaterialId,
        string memory latitude,
        string memory longitude,
        string[] memory processTypes
    ) public atLeastEditor(roleProof) {
        require(_materialManager.getMaterialExists(roleProof, outputMaterialId), "AssetOperationManager: Output material does not exist");
        require(inputMaterialsIds.length > 0, "AssetOperationManager: inputMaterialsIds array must specify at least one material");
        require(processTypes.length > 0, "AssetOperationManager: At least one process type must be specified");
        for (uint256 i = 0; i < inputMaterialsIds.length; i++) {
            require(_materialManager.getMaterialExists(roleProof, inputMaterialsIds[i]), "AssetOperationManager: Input material does not exist");
        }
        for (uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "AssetOperationManager: Process type does not exist");
        }

        uint256 assetOperationId = _counter.current() + 1;
        _counter.increment();
        AssetOperation memory newAssetOperation = AssetOperation(
            assetOperationId,
            name,
            inputMaterialsIds,
            outputMaterialId,
            latitude,
            longitude,
            processTypes,
            true
        );
        _assetOperations[assetOperationId] = newAssetOperation;
        _assetOperationIdsOfOwner[_msgSender()].push(assetOperationId);
        emit AssetOperationRegistered(assetOperationId, name, outputMaterialId);
    }

    function updateAssetOperation(
        RoleProof memory roleProof,
        uint256 id,
        string memory name,
        uint256[] memory inputMaterialsIds,
        uint256 outputMaterialId,
        string memory latitude,
        string memory longitude,
        string[] memory processTypes
    ) public atLeastEditor(roleProof) {
        require(_assetOperations[id].exists, "AssetOperationManager: Asset operation does not exist");
        require(_materialManager.getMaterialExists(roleProof, outputMaterialId), "AssetOperationManager: Output material does not exist");
        require(inputMaterialsIds.length > 0, "AssetOperationManager: inputMaterialsIds array must specify at least one material");
        require(processTypes.length > 0, "AssetOperationManager: At least one process type must be specified");
        for (uint256 i = 0; i < inputMaterialsIds.length; i++) {
            require(_materialManager.getMaterialExists(roleProof, inputMaterialsIds[i]), "AssetOperationManager: Input material does not exist");
        }
        for (uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "AssetOperationManager: Process type does not exist");
        }

        _assetOperations[id].name = name;
        _assetOperations[id].inputMaterialIds = inputMaterialsIds;
        _assetOperations[id].outputMaterialId = outputMaterialId;
        _assetOperations[id].latitude = latitude;
        _assetOperations[id].longitude = longitude;
        _assetOperations[id].processTypes = processTypes;
        emit AssetOperationUpdated(id);
    }


    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
