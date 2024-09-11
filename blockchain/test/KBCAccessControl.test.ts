import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { expect } from 'chai';
import { MembershipProofStruct, RoleProofStruct } from '../typechain-types/contracts/DelegateManager';
import { FakeContract, smock } from '@defi-wonderland/smock';

describe('KBCAccessControl', () => {
    let kbcAccessControlContract: Contract;
    let delegateManagerContract: Contract;
    let revocationRegistryContractFake: FakeContract;
    let issuer: SignerWithAddress, delegator: SignerWithAddress, delegate: SignerWithAddress, other: SignerWithAddress;

    const domain = {
        name: 'Test Delegate Manager',
        version: '1.0.1',
        chainId: 31337,
        verifyingContract: ''
    };
    const membershipTypes = {
        Membership: [
            { name: 'delegatorAddress', type: 'address' },
            { name: 'delegatorCredentialIdHash', type: 'bytes32' },
            { name: 'delegatorCredentialExpiryDate', type: 'uint256' }
        ]
    };
    const roleTypes = {
        RoleDelegation: [
            { name: 'delegateAddress', type: 'address' },
            { name: 'role', type: 'string' },
            { name: 'delegateCredentialIdHash', type: 'bytes32' },
            { name: 'delegateCredentialExpiryDate', type: 'uint256' }
        ]
    };

    enum ROLES {
        VIEWER = 'Viewer',
        EDITOR = 'Editor',
        SIGNER = 'Signer'
    }

    const delegatorCredentialIdHash = ethers.utils.formatBytes32String('delegator-credential-id-hash');
    const delegateCredentialIdHash = ethers.utils.formatBytes32String('delegate-credential-id-hash');
    const TOMORROW = Math.floor(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime() / 1000);

    const checkRole = async (neededRole: ROLES, actualRole: ROLES) => {
        const membershipSignature = await issuer._signTypedData(domain, membershipTypes, {
            delegatorAddress: delegator.address,
            delegatorCredentialIdHash: delegatorCredentialIdHash,
            delegatorCredentialExpiryDate: TOMORROW
        });
        const membershipProof: MembershipProofStruct = {
            signedProof: membershipSignature,
            delegatorCredentialIdHash: delegatorCredentialIdHash,
            delegatorCredentialExpiryDate: TOMORROW,
            issuer: issuer.address
        };

        const roleSignature = await delegator._signTypedData(domain, roleTypes, {
            delegateAddress: delegate.address,
            role: actualRole,
            delegateCredentialIdHash: delegateCredentialIdHash,
            delegateCredentialExpiryDate: TOMORROW
        });
        const roleProof: RoleProofStruct = {
            signedProof: roleSignature,
            delegator: delegator.address,
            delegateCredentialIdHash: delegateCredentialIdHash,
            delegateCredentialExpiryDate: TOMORROW,
            membershipProof
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
        [issuer, delegator, delegate, other] = await ethers.getSigners();
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
