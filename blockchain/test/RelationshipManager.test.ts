/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';

let relationshipManagerContract: Contract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let companyA: SignerWithAddress;
let companyB: SignerWithAddress;
let otherAccount: SignerWithAddress;
let relationshipCounterId: BigNumber;

describe('RelationshipManager', () => {
    const rawRelationship = {
        validFrom: new Date().getTime(),
        validUntil: new Date('2030-10-10').getTime()
    };

    beforeEach(async () => {
        [owner, admin, companyA, companyB, otherAccount] = await ethers.getSigners();

        const RelationshipManager = await ethers.getContractFactory(
            ContractName.RELATIONSHIP_MANAGER
        );

        relationshipManagerContract = await RelationshipManager.deploy([admin.address]);
        await relationshipManagerContract.deployed();
    });

    describe('registerRelationship', () => {
        it('should register a relationship', async () => {
            await relationshipManagerContract
                .connect(companyB)
                .registerRelationship(
                    companyA.address,
                    companyB.address,
                    rawRelationship.validFrom,
                    rawRelationship.validUntil
                );
            relationshipCounterId = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipCounter();

            const savedRelationship = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipInfo(relationshipCounterId);
            expect(savedRelationship.companyA).to.equal(companyA.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);
        });

        it('should register a relationship - FAIL (Sender is not one of the two entities involved in the relationship)', async () => {
            await expect(
                relationshipManagerContract
                    .connect(otherAccount)
                    .registerRelationship(
                        companyA.address,
                        companyB.address,
                        rawRelationship.validFrom,
                        rawRelationship.validUntil
                    )
            ).to.be.revertedWith(
                'Sender is not one of the two entities involved in the relationship'
            );
        });

        it("should register a relationship - FAIL (Fields 'companyA' and 'companyB' must be different)", async () => {
            await expect(
                relationshipManagerContract
                    .connect(companyA)
                    .registerRelationship(
                        companyA.address,
                        companyA.address,
                        rawRelationship.validFrom,
                        rawRelationship.validUntil
                    )
            ).to.be.revertedWith("Fields 'companyA' and 'companyB' must be different");
        });

        it('should emit RelationshipRegistered event', async () => {
            relationshipCounterId = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipCounter();
            await expect(
                relationshipManagerContract
                    .connect(companyB)
                    .registerRelationship(
                        companyA.address,
                        companyB.address,
                        rawRelationship.validFrom,
                        rawRelationship.validUntil
                    )
            )
                .to.emit(relationshipManagerContract, 'RelationshipRegistered')
                .withArgs(relationshipCounterId.toNumber() + 1, companyA.address, companyB.address);
        });
    });

    describe('getRelationshipIdsByCompany', () => {
        it('should retrieve saved relationship ids by same company address', async () => {
            await relationshipManagerContract
                .connect(companyB)
                .registerRelationship(
                    companyA.address,
                    companyB.address,
                    rawRelationship.validFrom,
                    rawRelationship.validUntil
                );
            await relationshipManagerContract
                .connect(companyB)
                .registerRelationship(
                    otherAccount.address,
                    companyB.address,
                    rawRelationship.validFrom,
                    rawRelationship.validUntil
                );
            relationshipCounterId = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipCounter();

            const relationshipIds = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipIdsByCompany(companyB.address);
            expect(relationshipIds.length).to.equal(relationshipCounterId.toNumber());

            let savedRelationship = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipInfo(relationshipIds[0]);
            expect(savedRelationship.companyA).to.equal(companyA.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);

            savedRelationship = await relationshipManagerContract
                .connect(companyB)
                .getRelationshipInfo(relationshipIds[1]);
            expect(savedRelationship.companyA).to.equal(otherAccount.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await relationshipManagerContract.connect(owner).addAdmin(admin.address);
            expect(
                await relationshipManagerContract.hasRole(
                    await relationshipManagerContract.ADMIN_ROLE(),
                    admin.address
                )
            ).to.be.true;
            await relationshipManagerContract.connect(owner).removeAdmin(admin.address);
            expect(
                await relationshipManagerContract.hasRole(
                    await relationshipManagerContract.ADMIN_ROLE(),
                    admin.address
                )
            ).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(
                relationshipManagerContract.connect(companyB).addAdmin(admin.address)
            ).to.be.revertedWith('Caller is not the admin');
            await expect(
                relationshipManagerContract.connect(companyB).removeAdmin(admin.address)
            ).to.be.revertedWith('Caller is not the admin');
        });
    });
});
