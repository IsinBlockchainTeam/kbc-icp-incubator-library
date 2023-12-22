// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";

contract BasicTrade is Trade {
    string private _name;

    constructor(uint256 tradeId, address productCategoryAddress, address documentManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, string memory name) Trade(tradeId, productCategoryAddress, documentManagerAddress, supplier, customer, commissioner, externalUrl) {
        _name = name;
    }

    function getTradeType() public override view returns (TradeType) {
        return TradeType.BASIC;
    }

    function getBasicTrade() public view returns (uint256, address, address, address, string memory, uint256[] memory, string memory) {
        return (_tradeId, _supplier, _customer, _commissioner, _externalUrl, _lineIds, _name);
    }

    function setName(string memory name) public onlyAdminOrContractPart {
        _name = name;
    }
}