/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

describe('OfferManager', () => {
    let offerManagerContract: Contract;
    let productCategoryManagerFake: FakeContract;
    let owner: SignerWithAddress, admin: SignerWithAddress, company1: SignerWithAddress;

    beforeEach(async () => {
        [owner, admin, company1] = await ethers.getSigners();

        productCategoryManagerFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerFake.getProductCategoryExists.returns((id: number) => id <= 10);

        const OfferManager = await ethers.getContractFactory('OfferManager');
        offerManagerContract = await OfferManager.deploy(
            [admin.address],
            productCategoryManagerFake.address
        );

        await offerManagerContract.deployed();
    });

    describe('registerSupplier', () => {
        it('should register a supplier', async () => {
            let supplierName = await offerManagerContract.getSupplierName(company1.address);
            expect(supplierName).to.be.equal('');

            const tx = await offerManagerContract.registerSupplier(company1.address, 'Company 1');
            await tx.wait();

            supplierName = await offerManagerContract.getSupplierName(company1.address);
            expect(supplierName).to.be.equal('Company 1');
        });

        it('should emit OfferSupplierRegistered event', async () => {
            await expect(offerManagerContract.registerSupplier(company1.address, 'Company 1'))
                .to.emit(offerManagerContract, 'OfferSupplierRegistered')
                .withArgs(company1.address, 'Company 1');
        });

        it("should register a supplier - FAIL(Offer's supplier already registered)", async () => {
            const tx = await offerManagerContract.registerSupplier(company1.address, 'Company 1');
            await tx.wait();

            await expect(
                offerManagerContract.registerSupplier(company1.address, 'Company 2')
            ).to.be.revertedWith("Offer's supplier already registered");
        });
    });

    describe('registerOffer', () => {
        it('should register an Offer', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();

            const previousOffersCounter = await offerManagerContract.getLastId();
            expect(previousOffersCounter).to.be.equal(0);
            const tx = await offerManagerContract.registerOffer(company1.address, 1);
            await tx.wait();

            const currentOfferCounter = await offerManagerContract.getLastId();
            expect(currentOfferCounter).to.be.equal(1);
            const offerIds = await offerManagerContract.getOfferIdsByCompany(company1.address);
            expect(currentOfferCounter).to.equal(offerIds.length);

            const registeredOffer = await offerManagerContract.getOffer(1);
            expect(registeredOffer.id).to.equal(1);
            expect(registeredOffer.owner).to.equal(company1.address);
            expect(registeredOffer.productCategoryId).to.equal(1);
        });

        it('should emit OfferRegistered event', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();

            await expect(offerManagerContract.registerOffer(company1.address, 1))
                .to.emit(offerManagerContract, 'OfferRegistered')
                .withArgs(1, company1.address);
        });

        it('should register an Offer - FAIL(OfferManager: Product category does not exist)', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();

            await expect(
                offerManagerContract.registerOffer(company1.address, 20)
            ).to.be.revertedWith('OfferManager: Product category does not exist');
        });

        it("should register an Offer - FAIL(Offer's supplier not registered)", async () => {
            await expect(
                offerManagerContract.registerOffer(company1.address, 1)
            ).to.be.revertedWith("OfferManager: Offer's supplier not registered");
        });
    });

    describe('updateSupplier', () => {
        it('should update a supplier', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();

            let supplierName = await offerManagerContract.getSupplierName(company1.address);
            expect(supplierName).to.be.equal('Company 1');

            const tx = await offerManagerContract.updateSupplier(company1.address, 'Company 2');
            await tx.wait();

            supplierName = await offerManagerContract.getSupplierName(company1.address);
            expect(supplierName).to.be.equal('Company 2');
        });

        it('should emit OfferSupplierUpdated event', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();
            await expect(offerManagerContract.updateSupplier(company1.address, 'Company 2'))
                .to.emit(offerManagerContract, 'OfferSupplierUpdated')
                .withArgs(company1.address, 'Company 2');
        });

        it("should update a supplier - FAIL(Offer's supplier not registered)", async () => {
            await expect(
                offerManagerContract.updateSupplier(company1.address, 'Company 2')
            ).to.be.revertedWith("Offer's supplier not registered");
        });
    });

    describe('updateOffer', () => {
        it('should update an Offer', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();

            await (await offerManagerContract.registerOffer(company1.address, 1)).wait();
            await (await offerManagerContract.updateOffer(1, 2)).wait();

            const currentOfferCounter = await offerManagerContract.getLastId();
            expect(currentOfferCounter).to.be.equal(1);

            const updatedOffer = await offerManagerContract.getOffer(1);
            expect(updatedOffer.id).to.equal(1);
            expect(updatedOffer.owner).to.equal(company1.address);
            expect(updatedOffer.productCategoryId).to.equal(2);
        });

        it('should emit OfferUpdated event', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();
            await (await offerManagerContract.registerOffer(company1.address, 1)).wait();
            await expect(offerManagerContract.updateOffer(1, 2))
                .to.emit(offerManagerContract, 'OfferUpdated')
                .withArgs(1, company1.address);
        });

        it('should update a AssetOperation - FAIL(OfferManager: Product category does not exist)', async () => {
            await expect(offerManagerContract.updateOffer(1, 20)).to.be.revertedWith(
                'OfferManager: Product category does not exist'
            );
        });
    });

    describe('deleteSupplier', () => {
        it('should delete a supplier', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();

            const tx = await offerManagerContract.deleteSupplier(company1.address);
            await tx.wait();

            const supplierName = await offerManagerContract.getSupplierName(company1.address);
            expect(supplierName).to.be.equal('');
        });

        it('should emit OfferSupplierDeleted event', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();
            await expect(offerManagerContract.deleteSupplier(company1.address))
                .to.emit(offerManagerContract, 'OfferSupplierDeleted')
                .withArgs(company1.address);
        });

        it("should delete a supplier - FAIL(Offer's supplier not registered)", async () => {
            await expect(offerManagerContract.deleteSupplier(company1.address)).to.be.revertedWith(
                "Offer's supplier not registered"
            );
        });

        it('should delete a supplier - FAIL(A supplier cannot be deleted if it still has active offers)', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();
            await (await offerManagerContract.registerOffer(company1.address, 1)).wait();

            await expect(offerManagerContract.deleteSupplier(company1.address)).to.be.revertedWith(
                'A supplier cannot be deleted if it still has active offers'
            );
        });
    });

    describe('deleteOffer', () => {
        it('should delete an Offer', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();
            await (await offerManagerContract.registerOffer(company1.address, 1)).wait();

            let currentOfferCounter = await offerManagerContract.getLastId();
            expect(currentOfferCounter).to.be.equal(1);
            let companyOffersIds = await offerManagerContract.getOfferIdsByCompany(
                company1.address
            );
            expect(companyOffersIds.length).to.equal(currentOfferCounter);

            await offerManagerContract.deleteOffer(1);
            currentOfferCounter = await offerManagerContract.getLastId();
            companyOffersIds = await offerManagerContract.getOfferIdsByCompany(company1.address);

            expect(currentOfferCounter).to.equal(1);
            expect(companyOffersIds.length).to.equal(0);
        });

        it('should emit OfferDeleted event', async () => {
            await (
                await offerManagerContract.registerSupplier(company1.address, 'Company 1')
            ).wait();
            await (await offerManagerContract.registerOffer(company1.address, 1)).wait();
            await expect(offerManagerContract.deleteOffer(1))
                .to.emit(offerManagerContract, 'OfferDeleted')
                .withArgs(1, company1.address);
        });

        it('should update a Transformation - FAIL(Offer does not exist)', async () => {
            await expect(offerManagerContract.updateOffer(1, 1)).to.be.revertedWith(
                'Offer does not exist'
            );
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await offerManagerContract.connect(owner).addAdmin(admin.address);
            expect(
                await offerManagerContract.hasRole(
                    await offerManagerContract.ADMIN_ROLE(),
                    admin.address
                )
            ).to.be.true;
            await offerManagerContract.connect(owner).removeAdmin(admin.address);
            expect(
                await offerManagerContract.hasRole(
                    await offerManagerContract.ADMIN_ROLE(),
                    admin.address
                )
            ).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(
                offerManagerContract.connect(company1).addAdmin(admin.address)
            ).to.be.revertedWith('Caller is not the admin');
            await expect(
                offerManagerContract.connect(company1).removeAdmin(admin.address)
            ).to.be.revertedWith('Caller is not the admin');
        });
    });
});
