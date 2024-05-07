// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";

contract BasicTrade is Trade {
    string private _name;

    constructor(uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress, address unitManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, string memory name) Trade(tradeId, productCategoryAddress, materialManagerAddress, documentManagerAddress, unitManagerAddress, supplier, customer, commissioner, externalUrl) {
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

    function addLine(uint256 productCategoryId, uint256 quantity, string memory unit) public onlyAdminOrContractPart returns (uint256) {
        uint256 tradeLineId = _addLine(productCategoryId, quantity, unit);
        emit TradeLineAdded(tradeLineId);
        return tradeLineId;
    }

    function updateLine(uint256 id, uint256 productCategoryId, uint256 quantity, string memory unit) public onlyAdminOrContractPart {
        _updateLine(id, productCategoryId, quantity, unit);
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
