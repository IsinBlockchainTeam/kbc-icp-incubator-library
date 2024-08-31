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

        const TOMORROW = Math.floor(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime() / 1000);
        const YESTERDAY = Math.floor(new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getTime() / 1000);
        const IN_TWO_DAYS = Math.floor(new Date(new Date().getTime() + 2 * 1000 * 60 * 60 * 24).getTime() / 1000);

        const createMembershipProof = async (
            delegatorAddress: string,
            delegatorCredentialIdHash: string,
            delegatorCredentialExpiryDate: number
        ): Promise<MembershipProofStruct> => {
            const signature = await issuer._signTypedData(domain, membershipTypes, {
                delegatorAddress,
                delegatorCredentialIdHash,
                delegatorCredentialExpiryDate
            });
            return {
                signedProof: signature,
                delegatorCredentialIdHash,
                delegatorCredentialExpiryDate,
                issuer: issuer.address
            };
        };

        const createRoleProof = async (
            delegateAddress: string,
            role: string,
            delegateCredentialIdHash: string,
            delegateCredentialExpiryDate: number,
            membershipProof: MembershipProofStruct
        ): Promise<RoleProofStruct> => {
            const signature = await delegator._signTypedData(domain, roleTypes, {
                delegateAddress,
                role,
                delegateCredentialIdHash,
                delegateCredentialExpiryDate
            });
            return {
                signedProof: signature,
                delegator: delegator.address,
                delegateCredentialIdHash,
                delegateCredentialExpiryDate,
                membershipProof: membershipProof
            };
        };

        it('should return true when caller is a delegate with a valid proof from a valid delegator', async () => {
            const membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash, TOMORROW);
            const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.true;
        });

        describe('role proof failure cases', () => {
            let membershipProof: MembershipProofStruct;

            before(async () => {
                membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash, TOMORROW);
            });

            it('should return false if delegate address is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(other.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if claimed role is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(other.address, 'Role42', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if claimed delegateCredentialIdHash hash is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(
                    other.address,
                    'Role1',
                    ethers.utils.formatBytes32String('different'),
                    TOMORROW,
                    membershipProof
                );

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if claimed delegateCredentialExpiryDate hash is different from the one in the signature', async () => {
                const roleProof = await createRoleProof(other.address, 'Role1', delegateCredentialIdHash, IN_TWO_DAYS, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if signer is not the delegator', async () => {
                const signature = await other._signTypedData(domain, roleTypes, {
                    delegateAddress: delegate.address,
                    role: 'Role1',
                    delegateCredentialIdHash,
                    delegateCredentialExpiryDate: TOMORROW
                });
                const roleProof: RoleProofStruct = {
                    signedProof: signature,
                    delegator: other.address,
                    delegateCredentialIdHash: delegateCredentialIdHash,
                    delegateCredentialExpiryDate: TOMORROW,
                    membershipProof
                };

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if caller is not the delegate', async () => {
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(other).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it("should return false if delegate's credential was revoked", async () => {
                revocationRegistryContractFake.revoked.returnsAtCall(0, 42);
                const roleProof = await createRoleProof(other.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it("should return false if delegate's credential has expired", async () => {
                const roleProof = await createRoleProof(other.address, 'Role1', delegateCredentialIdHash, YESTERDAY, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });
        });

        describe('membership proof failure cases', () => {
            it('should return false if member address is different from the one in the signature', async () => {
                const membershipProof = await createMembershipProof(other.address, delegatorCredentialIdHash, TOMORROW);
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if delegatorCredentialIdHash is different from the one in the signature', async () => {
                const signature = await other._signTypedData(domain, membershipTypes, {
                    delegatorAddress: delegator.address,
                    delegatorCredentialIdHash: ethers.utils.formatBytes32String('different'),
                    delegatorCredentialExpiryDate: TOMORROW
                });
                const membershipProof: MembershipProofStruct = {
                    signedProof: signature,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    delegatorCredentialExpiryDate: TOMORROW,
                    issuer: issuer.address
                };
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if delegatorCredentialExpiryDate is different from the one in the signature', async () => {
                const signature = await other._signTypedData(domain, membershipTypes, {
                    delegatorAddress: delegator.address,
                    delegatorCredentialIdHash: ethers.utils.formatBytes32String('different'),
                    delegatorCredentialExpiryDate: IN_TWO_DAYS
                });
                const membershipProof: MembershipProofStruct = {
                    signedProof: signature,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    delegatorCredentialExpiryDate: TOMORROW,
                    issuer: issuer.address
                };
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if signer is not the issuer', async () => {
                const signature = await other._signTypedData(domain, membershipTypes, {
                    delegatorAddress: delegator.address,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    delegatorCredentialExpiryDate: TOMORROW
                });
                const membershipProof: MembershipProofStruct = {
                    signedProof: signature,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    delegatorCredentialExpiryDate: TOMORROW,
                    issuer: issuer.address
                };
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if delegator credential was revoked', async () => {
                revocationRegistryContractFake.revoked.returnsAtCall(0, 42);
                const membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash, TOMORROW);
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should return false if delegator credential has expired', async () => {
                const membershipProof = await createMembershipProof(delegator.address, delegatorCredentialIdHash, YESTERDAY);
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });

            it('should fail if issuer is not the contract owner', async () => {
                const signature = await other._signTypedData(domain, membershipTypes, {
                    delegatorAddress: delegator.address,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    delegatorCredentialExpiryDate: TOMORROW
                });
                const membershipProof: MembershipProofStruct = {
                    signedProof: signature,
                    delegatorCredentialIdHash: delegatorCredentialIdHash,
                    delegatorCredentialExpiryDate: TOMORROW,
                    issuer: other.address
                };
                const roleProof = await createRoleProof(delegate.address, 'Role1', delegateCredentialIdHash, TOMORROW, membershipProof);

                expect(await delegateManagerContract.connect(delegate).hasValidRole(roleProof, 'Role1')).to.be.false;
            });
        });
    });
});
