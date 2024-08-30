import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { MembershipProofStruct, RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

describe('DelegateManager', () => {
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
            { name: 'delegatorCredentialIdHash', type: 'bytes32' }
        ]
    };
    const roleTypes = {
        RoleDelegation: [
            { name: 'delegateAddress', type: 'address' },
            { name: 'role', type: 'string' },
            { name: 'delegateCredentialIdHash', type: 'bytes32' }
        ]
    };

    before(async () => {
        [issuer, delegator, delegate, other] = await ethers.getSigners();
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

    it('should return revocation registry address', async () => {
        expect(await delegateManagerContract.getRevocationRegistry()).to.equal(revocationRegistryContractFake.address);
    });

    describe('hasValidRole', () => {
        const delegatorCredentialIdHash = ethers.utils.formatBytes32String('delegator-credential-id-hash');
        const delegateCredentialIdHash = ethers.utils.formatBytes32String('delegate-credential-id-hash');

        const createMembershipProof = async (delegatorAddress: string, delegatorCredentialIdHash: string): Promise<MembershipProofStruct> => {
            const signature = await issuer._signTypedData(domain, membershipTypes, {
                delegatorAddress,
                delegatorCredentialIdHash
            });
            return {
                signedProof: signature,
                delegatorCredentialIdHash,
                issuer: issuer.address
            };
        };

        const createRoleProof = async (
            delegateAddress: string,
            role: string,
            delegateCredentialIdHash: string,
            membershipProof: MembershipProofStruct
        ): Promise<RoleProofStruct> => {
            const signature = await delegator._signTypedData(domain, roleTypes, {
                delegateAddress,
                role,
                delegateCredentialIdHash
            });
            return {
                signedProof: signature,
                delegator: delegator.address,
                delegateCredentialIdHash,
                membershipProof: membershipProof
            };
        };

        it('should return true when caller is a delegate with a valid proof from a valid delegator', async () => {
            const membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash);
            const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, membershipProof);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.true;
        });

        describe('role proof failure cases', () => {
            let membershipProof: MembershipProofStruct;

            before(async () => {
                membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash);
            });

            it('should return false if delegate address is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(other.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if claimed role is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(other.address, 'Role42', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if claimed delegateCredentialIdHash hash is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(other.address, 'Role1', ethers.utils.formatBytes32String('different'), membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if signer is not the delegator', async () => {
                const signature = await other._signTypedData(domain, roleTypes, {
                    delegateAddress: delegate.address,
                    role: 'Role1',
                    delegateCredentialIdHash: delegateCredentialIdHash
                });
                const roleProof: RoleProofStruct = {
                    signedProof: signature,
                    delegator: other.address,
                    delegateCredentialIdHash: delegateCredentialIdHash,
                    membershipProof
                };

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if caller is not the delegate', async () => {
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(other).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it("should return false if delegate's credential was revoked", async () => {
                revocationRegistryContractFake.revoked.returns(42);
                const roleProof = await createRoleProof(other.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });
        });

        describe('membership proof failure cases', () => {
            it('should return false if member address is different from the one in the signature', async () => {
                const membershipProof = await createMembershipProof(other.address, delegatorCredentialIdHash);
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if memberCredentialIdHash is different from the one in the signature', async () => {
                const signature = await other._signTypedData(domain, membershipTypes, {
                    delegatorAddress: delegator.address,
                    delegatorCredentialIdHash: ethers.utils.formatBytes32String('different')
                });
                const membershipProof: MembershipProofStruct = {
                    signedProof: signature,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    issuer: issuer.address
                };
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if signer is not the issuer', async () => {
                const signature = await other._signTypedData(domain, membershipTypes, {
                    delegatorAddress: delegator.address,
                    delegatorCredentialIdHash: delegatorCredentialIdHash
                });
                const membershipProof: MembershipProofStruct = {
                    signedProof: signature,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    issuer: issuer.address
                };
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if membership credential was revoked', async () => {
                revocationRegistryContractFake.revoked.returns(42);
                const membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash);
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });
        });
    });
});
