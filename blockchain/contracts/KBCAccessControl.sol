// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DelegateManager.sol";

abstract contract KBCAccessControl {
    DelegateManager private _delegateManager;

    struct RoleProof {
        bytes signedProof;
        address delegator;
    }

    constructor(address delegateManagerAddress) {
        _delegateManager = DelegateManager(delegateManagerAddress);
    }

    modifier isViewer(RoleProof memory roleProof) {
        require(
            _delegateManager.hasValidRole(roleProof.signedProof, "Viewer", roleProof.delegator)
            || _delegateManager.hasValidRole(roleProof.signedProof, "Editor", roleProof.delegator)
            || _delegateManager.hasValidRole(roleProof.signedProof, "Signer", roleProof.delegator),
            "KBCAccessControl: Caller doesn't have 'Viewer' role");
        _;
    }

    modifier isEditor(RoleProof memory roleProof) {
        require(
            _delegateManager.hasValidRole(roleProof.signedProof, "Editor", roleProof.delegator)
            || _delegateManager.hasValidRole(roleProof.signedProof, "Signer", roleProof.delegator),
            "KBCAccessControl: Caller doesn't have 'Editor' role");
        _;
    }

    modifier isSigner(RoleProof memory roleProof) {
        require(
            _delegateManager.hasValidRole(roleProof.signedProof, "Signer", roleProof.delegator),
            "KBCAccessControl: Caller doesn't have 'Signer' role");
        _;
    }
}
