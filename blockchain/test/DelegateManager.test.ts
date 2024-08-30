import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { DelegateManager, RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

describe('DelegateManager', () => {
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
            { name: 'delegateCredentialIdHash', type: 'bytes32' }
        ]
    };

    before(async () => {
        [admin, delegator, delegate, other] = await ethers.getSigners();
    });

    beforeEach(async () => {
        revocationRegistryContractFake = await smock.fake(ContractName.REVOCATION_REGISTRY);
        revocationRegistryContractFake.revoked.returns(0);
        const DelegateManager = await ethers.getContractFactory(ContractName.DELEGATE_MANAGER);
        delegateManagerContract = await DelegateManager.deploy(domain.name, domain.version, domain.chainId, revocationRegistryContractFake.address);
        await delegateManagerContract.deployed();
        domain.verifyingContract = delegateManagerContract.address;
    });

    it('should have been deployed', async () => {
        expect(delegateManagerContract.address).to.properAddress;
    });

    describe('Delegators management', () => {
        it('should revert if adding a delegate when caller is not a delegator', async () => {
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.false;
        });

        it('should add a delegator, then revoke the role', async () => {
            await delegateManagerContract.connect(admin).addDelegator(delegator.address);
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.true;

            await delegateManagerContract.connect(admin).removeDelegator(delegator.address);
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.false;
        });

        it('should not be able to determine if a role is delegator if caller is not an admin', async () => {
            await expect(delegateManagerContract.connect(other).isDelegator(delegate.address)).to.be.revertedWith(
                'DelegateManager: Caller is not the admin'
            );
        });
    });

    describe('hasValidRole', () => {
        const credentialHash = ethers.utils.formatBytes32String('test');

        beforeEach(async () => {
            await delegateManagerContract.connect(admin).addDelegator(delegator.address);
        });

        const createRoleProof = async (delegateAddress: string, role: string, delegateCredentialIdHash: string): Promise<RoleProofStruct> => {
            const signature = await delegator._signTypedData(domain, types, {
                delegateAddress,
                role,
                delegateCredentialIdHash
            });
            return {
                signedProof: signature,
                delegator: delegator.address,
                delegateCredentialIdHash
            };
        };

        it('should return true when caller is a delegate with a valid proof', async () => {
            const roleProof = await createRoleProof(delegate.address, 'Role1', credentialHash);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.true;
        });

        it('should return false if delegate address is different from the one in the signature', async () => {
            const roleProof = await createRoleProof(other.address, 'Role1', credentialHash);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
        });

        it('should return false if claimed role is different from the one in the signature', async () => {
            const roleProof = await createRoleProof(other.address, 'Role42', credentialHash);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
        });

        it('should return false if claimed jwt hash is different from the one in the signature', async () => {
            const roleProof = await createRoleProof(other.address, 'Role1', ethers.utils.formatBytes32String('different'));

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
        });

        it('should return false if signer is not the delegator', async () => {
            const signature = await other._signTypedData(domain, types, {
                delegateAddress: delegate.address,
                role: 'Role1',
                delegateCredentialIdHash: credentialHash
            });
            const roleProof: RoleProofStruct = {
                signedProof: signature,
                delegator: other.address,
                delegateCredentialIdHash: credentialHash
            };

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
        });

        it('should return false if delegator is not a valid delegator', async () => {
            await delegateManagerContract.connect(admin).removeDelegator(delegator.address);
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.false;
            const roleProof = await createRoleProof(other.address, 'Role1', credentialHash);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
        });

        it('should return false if caller is not the delegate', async () => {
            const roleProof = await createRoleProof(delegate.address, 'Role1', credentialHash);

            expect(await delegateManagerContract.connect(other).hasValidRole(roleProof, 'Role1')).to.be.false;
        });

        it("should return false if delegate's credential was revoked", async () => {
            revocationRegistryContractFake.revoked.returns(42);
            const roleProof = await createRoleProof(other.address, 'Role1', credentialHash);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
        });
    });
});
