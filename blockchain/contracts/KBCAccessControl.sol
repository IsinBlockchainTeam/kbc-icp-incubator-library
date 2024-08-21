// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DelegateManager.sol";

abstract contract KBCAccessControl {
    DelegateManager internal _delegateManager;

    struct RoleProof {
        bytes signedProof;
        address delegator;
    }

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
        return _delegateManager.hasValidRole(roleProof.signedProof, "Viewer", roleProof.delegator)
            || _delegateManager.hasValidRole(roleProof.signedProof, "Editor", roleProof.delegator)
            || _delegateManager.hasValidRole(roleProof.signedProof, "Signer", roleProof.delegator);
    }

    function _isAtLeastEditor(RoleProof memory roleProof) internal view returns(bool) {
        return _delegateManager.hasValidRole(roleProof.signedProof, "Editor", roleProof.delegator)
            || _delegateManager.hasValidRole(roleProof.signedProof, "Signer", roleProof.delegator);
    }

    function _isAtLeastSigner(RoleProof memory roleProof) internal view returns(bool) {
        return _delegateManager.hasValidRole(roleProof.signedProof, "Signer", roleProof.delegator);
    }
}
