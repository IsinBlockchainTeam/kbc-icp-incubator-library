// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./KBCAccessControl.sol";

contract KBCAccessControlTester is KBCAccessControl {
    constructor(address delegateManagerAddress) KBCAccessControl(delegateManagerAddress) {}

    function testAtLeastViewer(RoleProof memory roleProof) public atLeastViewer(roleProof) view returns (bool) {
        return true;
    }

    function testAtLeastEditor(RoleProof memory roleProof) public atLeastEditor(roleProof) view returns (bool) {
        return true;
    }

    function testAtLeastSigner(RoleProof memory roleProof) public atLeastSigner(roleProof) view returns (bool) {
        return true;
    }
}
