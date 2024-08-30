/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

describe('RelationshipManager', () => {
    let relationshipManagerContract: Contract;
    let delegateManagerContractFake: FakeContract;
    let owner: SignerWithAddress;
    let admin: SignerWithAddress;
    let companyA: SignerWithAddress;
    let companyB: SignerWithAddress;
    let otherAccount: SignerWithAddress;
    let relationshipCounterId: BigNumber;

    const rawRelationship = {
        validFrom: new Date().getTime(),
        validUntil: new Date('2030-10-10').getTime()
    };

    const roleProof: RoleProofStruct = {
        signedProof: '0x',
        delegator: '',
        delegateCredentialIdHash: ethers.utils.formatBytes32String('delegateCredentialIdHash'),
        membershipProof: {
            signedProof: '0x',
            delegatorCredentialIdHash: ethers.utils.formatBytes32String('delegatorCredentialIdHash'),
            issuer: ''
        }
    };

    beforeEach(async () => {
        [owner, admin, companyA, companyB, otherAccount] = await ethers.getSigners();

        roleProof.delegator = owner.address;
        roleProof.membershipProof.issuer = owner.address;
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        const RelationshipManager = await ethers.getContractFactory(ContractName.RELATIONSHIP_MANAGER);

        relationshipManagerContract = await RelationshipManager.deploy(delegateManagerContractFake.address, [admin.address]);
        await relationshipManagerContract.deployed();
    });

    describe('registerRelationship', () => {
        it('should register a relationship', async () => {
            await relationshipManagerContract
                .connect(companyB)
                .registerRelationship(roleProof, companyA.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil);
            relationshipCounterId = await relationshipManagerContract.connect(companyB).getRelationshipCounter(roleProof);

            const savedRelationship = await relationshipManagerContract.connect(companyB).getRelationshipInfo(roleProof, relationshipCounterId);
            expect(savedRelationship.companyA).to.equal(companyA.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);
        });

        it('should register a relationship - FAIL (Sender is not one of the two entities involved in the relationship)', async () => {
            await expect(
                relationshipManagerContract
                    .connect(otherAccount)
                    .registerRelationship(roleProof, companyA.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil)
            ).to.be.revertedWith('Sender is not one of the two entities involved in the relationship');
        });

        it("should register a relationship - FAIL (Fields 'companyA' and 'companyB' must be different)", async () => {
            await expect(
                relationshipManagerContract
                    .connect(companyA)
                    .registerRelationship(roleProof, companyA.address, companyA.address, rawRelationship.validFrom, rawRelationship.validUntil)
            ).to.be.revertedWith("Fields 'companyA' and 'companyB' must be different");
        });

        it('should emit RelationshipRegistered event', async () => {
            relationshipCounterId = await relationshipManagerContract.connect(companyB).getRelationshipCounter(roleProof);
            await expect(
                relationshipManagerContract
                    .connect(companyB)
                    .registerRelationship(roleProof, companyA.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil)
            )
                .to.emit(relationshipManagerContract, 'RelationshipRegistered')
                .withArgs(relationshipCounterId.toNumber() + 1, companyA.address, companyB.address);
        });
    });

    describe('getRelationshipIdsByCompany', () => {
        it('should retrieve saved relationship ids by same company address', async () => {
            await relationshipManagerContract
                .connect(companyB)
                .registerRelationship(roleProof, companyA.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil);
            await relationshipManagerContract
                .connect(companyB)
                .registerRelationship(roleProof, otherAccount.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil);
            relationshipCounterId = await relationshipManagerContract.connect(companyB).getRelationshipCounter(roleProof);

            const relationshipIds = await relationshipManagerContract.connect(companyB).getRelationshipIdsByCompany(roleProof, companyB.address);
            expect(relationshipIds.length).to.equal(relationshipCounterId.toNumber());

            let savedRelationship = await relationshipManagerContract.connect(companyB).getRelationshipInfo(roleProof, relationshipIds[0]);
            expect(savedRelationship.companyA).to.equal(companyA.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);

            savedRelationship = await relationshipManagerContract.connect(companyB).getRelationshipInfo(roleProof, relationshipIds[1]);
            expect(savedRelationship.companyA).to.equal(otherAccount.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await relationshipManagerContract.connect(owner).addAdmin(admin.address);
            expect(await relationshipManagerContract.hasRole(await relationshipManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await relationshipManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await relationshipManagerContract.hasRole(await relationshipManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(relationshipManagerContract.connect(companyB).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(relationshipManagerContract.connect(companyB).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
