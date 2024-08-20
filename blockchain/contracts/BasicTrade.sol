// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";

contract BasicTrade is Trade {
    string private _name;

    constructor(address delegateManagerAddress, uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress, address unitManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, string memory metadataHash, string memory name) Trade(delegateManagerAddress, tradeId, productCategoryAddress, materialManagerAddress, documentManagerAddress, unitManagerAddress, supplier, customer, commissioner, externalUrl, metadataHash) {
        _name = name;
    }

    function getTrade() public view returns (uint256, address, address, address, string memory, uint256[] memory, string memory) {
        (uint256 tradeId, address supplier, address customer, address commissioner, string memory externalUrl, uint256[] memory lineIds) = _getTrade();
        return (tradeId, supplier, customer, commissioner, externalUrl, lineIds, _name);
    }

    function getTradeType() public override pure returns (TradeType) {
        return TradeType.BASIC;
    }

    function getLine(uint256 id) public view returns (Line memory) {
        return _getLine(id);
    }

    function addLine(RoleProof memory roleProof, uint256 productCategoryId, uint256 quantity, string memory unit) public onlyAdminOrContractPart atLeastEditor(roleProof) returns (uint256) {
        uint256 tradeLineId = _addLine(roleProof, productCategoryId, quantity, unit);
        emit TradeLineAdded(tradeLineId);
        return tradeLineId;
    }

    function updateLine(RoleProof memory roleProof, uint256 id, uint256 productCategoryId, uint256 quantity, string memory unit) public atLeastEditor(roleProof) onlyAdminOrContractPart {
        _updateLine(roleProof, id, productCategoryId, quantity, unit);
        emit TradeLineUpdated(id);
    }

    function assignMaterial(uint256 lineId, uint256 materialId) public onlyAdminOrContractPart {
        _assignMaterial(lineId, materialId);
        emit MaterialAssigned(lineId);
    }

    function setName(string memory name) public onlyAdminOrContractPart {
        _name = name;
    }
}
