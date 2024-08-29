import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { expect } from 'chai';
import { RoleProofStruct } from '../typechain-types/contracts/DelegateManager';
import { FakeContract, smock } from '@defi-wonderland/smock';

describe('KBCAccessControl', () => {
    let kbcAccessControlContract: Contract;
    let delegateManagerContract: Contract;
    let revocationRegistryContractFake: FakeContract;
    let admin: SignerWithAddress, delegator: SignerWithAddress, delegate: SignerWithAddress, other: SignerWithAddress;

    const domain = {
        name: 'Test Delegate Manager',
        version: '1.0.1',
        chainId: 31337,
        verifyingContract: ''
    };
    const types = {
        RoleDelegation: [
            { name: 'delegateAddress', type: 'address' },
            { name: 'role', type: 'string' },
            { name: 'jwtHash', type: 'bytes32' }
        ]
    };

    enum ROLES {
        VIEWER = 'Viewer',
        EDITOR = 'Editor',
        SIGNER = 'Signer'
    }

    const credentialHash = ethers.utils.formatBytes32String('test');

    const checkRole = async (neededRole: ROLES, actualRole: ROLES) => {
        await delegateManagerContract.connect(admin).addDelegator(delegator.address);

        const message = {
            delegateAddress: delegate.address,
            role: actualRole,
            jwtHash: credentialHash
        };
        const signature = await delegator._signTypedData(domain, types, message);
        const roleProof: RoleProofStruct = {
            signedProof: signature,
            delegator: delegator.address,
            jwtHash: credentialHash
        };
        switch (neededRole) {
            case ROLES.VIEWER:
                return kbcAccessControlContract.connect(delegate).testAtLeastViewer(roleProof);
            case ROLES.EDITOR:
                return kbcAccessControlContract.connect(delegate).testAtLeastEditor(roleProof);
            case ROLES.SIGNER:
                return kbcAccessControlContract.connect(delegate).testAtLeastSigner(roleProof);
        }
    };

    before(async () => {
        [admin, delegator, delegate, other] = await ethers.getSigners();
    });

    beforeEach(async () => {
        revocationRegistryContractFake = await smock.fake(ContractName.REVOCATION_REGISTRY);
        revocationRegistryContractFake.revoked.returns(0);
        const DelegateManager = await ethers.getContractFactory(ContractName.DELEGATE_MANAGER);
        delegateManagerContract = await DelegateManager.deploy(domain.name, domain.version, domain.chainId, revocationRegistryContractFake.address);
        const KBCAccessControl = await ethers.getContractFactory('KBCAccessControlTester');
        kbcAccessControlContract = await KBCAccessControl.deploy(delegateManagerContract.address);
        await kbcAccessControlContract.deployed();
        domain.verifyingContract = delegateManagerContract.address;
    });

    it('should have been deployed', async () => {
        expect(kbcAccessControlContract.address).to.properAddress;
    });

    it('atLeastViewer', async () => {
        expect(await checkRole(ROLES.VIEWER, ROLES.VIEWER)).to.be.true;
        expect(await checkRole(ROLES.VIEWER, ROLES.EDITOR)).to.be.true;
        expect(await checkRole(ROLES.VIEWER, ROLES.SIGNER)).to.be.true;
    });

    it('atLeastEditor', async () => {
        await expect(checkRole(ROLES.EDITOR, ROLES.VIEWER)).to.be.revertedWith("KBCAccessControl: Caller doesn't have role 'Editor' or higher");
        expect(await checkRole(ROLES.EDITOR, ROLES.EDITOR)).to.be.true;
        expect(await checkRole(ROLES.EDITOR, ROLES.SIGNER)).to.be.true;
    });

    it('atLeastSigner', async () => {
        await expect(checkRole(ROLES.SIGNER, ROLES.VIEWER)).to.be.revertedWith("KBCAccessControl: Caller doesn't have role 'Signer'");
        await expect(checkRole(ROLES.SIGNER, ROLES.EDITOR)).to.be.revertedWith("KBCAccessControl: Caller doesn't have role 'Signer'");
        expect(await checkRole(ROLES.SIGNER, ROLES.SIGNER)).to.be.true;
    });
});
