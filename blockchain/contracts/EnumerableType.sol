// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

error EnumTypeAlreadyAvailable();
error EnumTypeNotFound();

contract EnumerableType is AccessControl {

    // enumerable type => (index+1) of the enumerable array (if 0 it not exists)
    mapping(string => uint256) types;
    string[] public typesList;

    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function contains(string memory name) public view returns(bool){
        return _getEnumerableTypeIndex(name) != 0;
    }

    function add(string memory name) public onlyRole(DEFAULT_ADMIN_ROLE){
        if(contains(name)){
            revert EnumTypeAlreadyAvailable();
        }

        typesList.push(name);
        types[name] = typesList.length;
    }

    function remove(string memory name) public onlyRole(DEFAULT_ADMIN_ROLE){
        _removeFromList(name);
        delete types[name];
    }

    function getTypeListLength() public view returns(uint256){
        return typesList.length;
    }

    function _removeFromList(string memory name) private {
        if(!contains(name)){
            revert EnumTypeNotFound();
        }
        uint256 enumIndex = _getEnumerableTypeIndex(name) - 1;
        typesList[enumIndex] = typesList[typesList.length - 1];
        typesList.pop();
    }

    function _getEnumerableTypeIndex(string memory name) public view returns(uint256){
        return types[name];
    }

}
