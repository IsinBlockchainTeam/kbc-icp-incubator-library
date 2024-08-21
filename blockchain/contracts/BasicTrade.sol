// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";

contract BasicTrade is Trade {
    string private _name;

    constructor(RoleProof memory roleProof, address delegateManagerAddress, uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress, address unitManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, string memory metadataHash, string memory name) Trade(roleProof, delegateManagerAddress, tradeId, productCategoryAddress, materialManagerAddress, documentManagerAddress, unitManagerAddress, supplier, customer, commissioner, externalUrl, metadataHash) {
        _name = name;
    }

    function getTrade(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256, address, address, address, string memory, uint256[] memory, string memory) {
        (uint256 tradeId, address supplier, address customer, address commissioner, string memory externalUrl, uint256[] memory lineIds) = _getTrade();
        return (tradeId, supplier, customer, commissioner, externalUrl, lineIds, _name);
    }

    function getTradeType(RoleProof memory roleProof) public override view atLeastViewer(roleProof) returns (TradeType) {
        return TradeType.BASIC;
    }

    function getLine(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (Line memory) {
        return _getLine(roleProof, id);
    }

    function addLine(RoleProof memory roleProof, uint256 productCategoryId, uint256 quantity, string memory unit) public onlyContractPart returns (uint256) {
        uint256 tradeLineId = _addLine(roleProof, productCategoryId, quantity, unit);
        emit TradeLineAdded(tradeLineId);
        return tradeLineId;
    }

    function updateLine(RoleProof memory roleProof, uint256 id, uint256 productCategoryId, uint256 quantity, string memory unit) public onlyContractPart {
        _updateLine(roleProof, id, productCategoryId, quantity, unit);
        emit TradeLineUpdated(id);
    }

    function assignMaterial(RoleProof memory roleProof, uint256 lineId, uint256 materialId) public onlyContractPart {
        _assignMaterial(roleProof, lineId, materialId);
        emit MaterialAssigned(lineId);
    }

    function setName(string memory name) public onlyContractPart {
        _name = name;
    }
}
