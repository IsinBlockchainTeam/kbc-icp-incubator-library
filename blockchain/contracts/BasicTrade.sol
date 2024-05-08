// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";

contract BasicTrade is Trade {
    string private _name;

    constructor(uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress,
        address supplier, address customer, address commissioner, string memory externalUrl, string memory metadataHash, string memory name)
    Trade(tradeId, productCategoryAddress, materialManagerAddress, documentManagerAddress, supplier, customer, commissioner, externalUrl, metadataHash) {
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

    function addLine(uint256 productCategoryId) public onlyAdminOrContractPart returns (uint256) {
        uint256 tradeLineId =  _addLine(productCategoryId);
        emit TradeLineAdded(tradeLineId);
        return tradeLineId;
    }

    function updateLine(uint256 id, uint256 productCategoryId) public onlyAdminOrContractPart {
        _updateLine(id, productCategoryId);
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
