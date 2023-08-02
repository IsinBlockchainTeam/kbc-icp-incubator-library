/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';

let contractManagerContract: Contract;
let relationshipManagerContract: Contract;
let enumerableFiatManagerContract: Contract;
let enumerableProductCategoryManagerContract: Contract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let companyA: SignerWithAddress;
let companyB: SignerWithAddress;
let otherAccount: SignerWithAddress;
let relationshipCounterId: BigNumber;
let relationshipLineCounterId: BigNumber;
let contractCounterId: BigNumber;
let contractLineCounterId: BigNumber;

describe('RelationshipManager', () => {
    const rawRelationship = {
        validFrom: new Date().getTime(),
        validUntil: new Date("2030-10-10").getTime()
    };

    before(async () => {
        [owner, admin, companyA, companyB, otherAccount] = await ethers.getSigners();

        const RelationshipManager = await ethers.getContractFactory(ContractName.RELATIONSHIP_MANAGER);

        relationshipManagerContract = await RelationshipManager.deploy([admin.address]);
        await relationshipManagerContract.deployed();
    });

    describe('registerRelationship', () => {
        it('should register an relationship', async () => {
            await relationshipManagerContract.connect(companyB).registerRelationship(companyA.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil);
            relationshipCounterId = await relationshipManagerContract.connect(companyB).getRelationshipCounter();

            const savedRelationship = await relationshipManagerContract.connect(companyB).getRelationshipInfo(relationshipCounterId);
            expect(savedRelationship.companyA).to.equal(companyA.address);
            expect(savedRelationship.companyB).to.equal(companyB.address);
            expect(savedRelationship.validFrom).to.equal(rawRelationship.validFrom);
            expect(savedRelationship.validUntil).to.equal(rawRelationship.validUntil);
        });

        it('should register a relationship without valid until date', async () => {

        })

        it('should emit RelationshipRegistered event', async () => {
            relationshipCounterId = await relationshipManagerContract.connect(companyB).getRelationshipCounter();
            await expect(relationshipManagerContract.connect(companyB).registerRelationship(companyA.address, companyB.address, rawRelationship.validFrom, rawRelationship.validUntil))
                .to.emit(relationshipManagerContract, 'RelationshipRegistered')
                .withArgs(relationshipCounterId.toNumber() + 1, companyA.address, companyB.address);
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
