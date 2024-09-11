// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DelegateManager.sol";

abstract contract KBCAccessControl {
    DelegateManager internal _delegateManager;

    constructor(address delegateManagerAddress) {
        require(delegateManagerAddress != address(0), "KBCAccessControl: delegate manager address is the zero address");
        _delegateManager = DelegateManager(delegateManagerAddress);
    }

    modifier atLeastViewer(RoleProof memory roleProof) {
        require(
            _isAtLeastViewer(roleProof),
            "KBCAccessControl: Caller doesn't have role 'Viewer' or higher");
        _;
    }

    modifier atLeastEditor(RoleProof memory roleProof) {
        require(
            _isAtLeastEditor(roleProof),
            "KBCAccessControl: Caller doesn't have role 'Editor' or higher");
        _;
    }

    modifier atLeastSigner(RoleProof memory roleProof) {
        require(
            _isAtLeastSigner(roleProof),
            "KBCAccessControl: Caller doesn't have role 'Signer'");
        _;
    }

    function _isAtLeastViewer(RoleProof memory roleProof) internal view returns(bool) {
        return _delegateManager.hasValidRole(roleProof, "Viewer")
            || _delegateManager.hasValidRole(roleProof, "Editor")
            || _delegateManager.hasValidRole(roleProof, "Signer");
    }

    function _isAtLeastEditor(RoleProof memory roleProof) internal view returns(bool) {
        return _delegateManager.hasValidRole(roleProof, "Editor")
            || _delegateManager.hasValidRole(roleProof, "Signer");
    }

    function _isAtLeastSigner(RoleProof memory roleProof) internal view returns(bool) {
        return _delegateManager.hasValidRole(roleProof, "Signer");
    }
}
