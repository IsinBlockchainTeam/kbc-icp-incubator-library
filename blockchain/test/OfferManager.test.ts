/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName, PRODUCT_CATEGORY } from '../utils/constants';

describe('OfferManager', () => {
    let offerManagerContract: Contract;
    let enumerableProductCategoryManagerContractFake: FakeContract;
    let owner: SignerWithAddress, admin: SignerWithAddress, company1: SignerWithAddress;

    const categories = [PRODUCT_CATEGORY.ARABIC_85, PRODUCT_CATEGORY.EXCELSA_88];

    beforeEach(async () => {
        [owner, admin, company1] = await ethers.getSigners();

        enumerableProductCategoryManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableProductCategoryManagerContractFake.contains.returns((value: string) => categories.includes(value[0] as PRODUCT_CATEGORY));

        const OfferManager = await ethers.getContractFactory('OfferManager');
        offerManagerContract = await OfferManager.deploy([admin.address], enumerableProductCategoryManagerContractFake.address);

        await offerManagerContract.deployed();
    });

    describe('registerOffer', () => {
        it('should register an Offer', async () => {
            const previousOffersCounter = await offerManagerContract.getLastId();
            expect(previousOffersCounter).to.be.equal(0);
            const tx = await offerManagerContract.registerOffer(company1.address, categories[0]);
            await tx.wait();

            const currentOfferCounter = await offerManagerContract.getLastId();
            expect(currentOfferCounter).to.be.equal(1);
            const offerIds = await offerManagerContract.getOfferIdsByCompany(company1.address);
            expect(currentOfferCounter).to.equal(offerIds.length);

            const registeredOffer = await offerManagerContract.getOffer(1);
            expect(registeredOffer.id).to.equal(1);
            expect(registeredOffer.owner).to.equal(company1.address);
            expect(registeredOffer.productCategory).to.equal(categories[0]);
        });

        it('should emit OfferRegistered event', async () => {
            await expect(offerManagerContract.registerOffer(company1.address, categories[0]))
                .to.emit(offerManagerContract, 'OfferRegistered')
                .withArgs(1, company1.address);
        });

        it('should register an Offer - FAIL(The product category specified isn\'t registered)', async () => {
            await expect(offerManagerContract.registerOffer(company1.address, 'customCategory'))
                .to.be.revertedWith('The product category specified isn\'t registered');
        });
    });

    describe('updateOffer', () => {
        it('should update an Offer', async () => {
            await (await offerManagerContract.registerOffer(company1.address, categories[0])).wait();

            await (await offerManagerContract.updateOffer(1, categories[1])).wait();

            const currentOfferCounter = await offerManagerContract.getLastId();
            expect(currentOfferCounter).to.be.equal(1);

            const updatedOffer = await offerManagerContract.getOffer(1);
            expect(updatedOffer.id).to.equal(1);
            expect(updatedOffer.owner).to.equal(company1.address);
            expect(updatedOffer.productCategory).to.equal(categories[1]);
        });

        it('should emit OfferUpdated event', async () => {
            await (await offerManagerContract.registerOffer(company1.address, categories[0])).wait();
            await expect(offerManagerContract.updateOffer(1, categories[1]))
                .to.emit(offerManagerContract, 'OfferUpdated')
                .withArgs(1, company1.address);
        });

        it('should update a AssetOperation - FAIL(The product category specified isn\'t registered)', async () => {
            await expect(offerManagerContract.updateOffer(1, 'customCategory'))
                .to.be.revertedWith('The product category specified isn\'t registered');
        });
    });

    describe('deleteOffer', () => {
        it('should delete an Offer', async () => {
            await (await offerManagerContract.registerOffer(company1.address, categories[0])).wait();

            let currentOfferCounter = await offerManagerContract.getLastId();
            expect(currentOfferCounter).to.be.equal(1);
            let companyOffersIds = await offerManagerContract.getOfferIdsByCompany(company1.address);
            expect(companyOffersIds.length).to.equal(currentOfferCounter);

            await offerManagerContract.deleteOffer(1);
            currentOfferCounter = await offerManagerContract.getLastId();
            companyOffersIds = await offerManagerContract.getOfferIdsByCompany(company1.address);

            expect(currentOfferCounter).to.equal(1);
            expect(companyOffersIds.length).to.equal(0);
        });

        it('should emit OfferDeleted event', async () => {
            await (await offerManagerContract.registerOffer(company1.address, categories[0])).wait();
            await expect(offerManagerContract.deleteOffer(1))
                .to.emit(offerManagerContract, 'OfferDeleted')
                .withArgs(1, company1.address);
        });

        it('should update a AssetOperation - FAIL(The product category specified isn\'t registered)', async () => {
            await expect(offerManagerContract.updateOffer(1, 'customCategory'))
                .to.be.revertedWith('The product category specified isn\'t registered');
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await offerManagerContract.connect(owner).addAdmin(admin.address);
            expect(await offerManagerContract.hasRole(await offerManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await offerManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await offerManagerContract.hasRole(await offerManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(offerManagerContract.connect(company1).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(offerManagerContract.connect(company1).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
