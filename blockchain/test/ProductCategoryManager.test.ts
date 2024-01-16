/* eslint-disable import/no-extraneous-dependencies */
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('ProductCategoryManager', () => {
    let productCategoryManagerContract: Contract;
    let admin: SignerWithAddress, other: SignerWithAddress;

    beforeEach(async () => {
        [admin, other] = await ethers.getSigners();

        const ProductCategoryManager = await ethers.getContractFactory('ProductCategoryManager');
        productCategoryManagerContract = await ProductCategoryManager.deploy();
        await productCategoryManagerContract.deployed();
    });

    describe('Registration', () => {
        it('should register two ProductCategories', async () => {
            const previousProductCategoryCounter = await productCategoryManagerContract.getProductCategoriesCounter();
            expect(previousProductCategoryCounter).to.be.equal(0);
            const tx = await productCategoryManagerContract.registerProductCategory('testProductCategory', 85, 'firstProductCategory');
            await tx.wait();

            let currentProductCategoryCounter = await productCategoryManagerContract.getProductCategoriesCounter();
            expect(currentProductCategoryCounter).to.be.equal(1);

            const registeredProductCategory = await productCategoryManagerContract.getProductCategory(1);
            expect(registeredProductCategory[0]).to.be.equal(BigNumber.from(1));
            expect(registeredProductCategory[1]).to.be.equal('testProductCategory');
            expect(registeredProductCategory[2]).to.be.equal(BigNumber.from(85));
            expect(registeredProductCategory[3]).to.be.equal('firstProductCategory');
            expect(registeredProductCategory[4]).to.be.equal(true);
            expect(await productCategoryManagerContract.getProductCategoryExists(1)).to.be.equal(true);
            expect(tx).to.emit(productCategoryManagerContract, 'ProductCategoryRegistered').withArgs(registeredProductCategory.id, registeredProductCategory.name, registeredProductCategory.quality);

            const tx2 = await productCategoryManagerContract.registerProductCategory('testProductCategory2', 90, 'secondProductCategory');
            await tx2.wait();
            currentProductCategoryCounter = await productCategoryManagerContract.getProductCategoriesCounter();
            expect(currentProductCategoryCounter).to.be.equal(2);
            const registeredProductCategory2 = await productCategoryManagerContract.getProductCategory(2);

            expect(tx2).to.emit(productCategoryManagerContract, 'ProductCategoryRegistered').withArgs(registeredProductCategory2.id, registeredProductCategory2.name, registeredProductCategory2.quality);
        });
    });

    describe('Roles', () => {
        it('should add and remove admin roles', async () => {
            await productCategoryManagerContract.connect(admin).addAdmin(other.address);
            expect(await productCategoryManagerContract.hasRole(await productCategoryManagerContract.ADMIN_ROLE(), other.address)).to.equal(true);
            await productCategoryManagerContract.connect(admin).removeAdmin(other.address);
            expect(await productCategoryManagerContract.hasRole(await productCategoryManagerContract.ADMIN_ROLE(), other.address)).to.equal(false);
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(productCategoryManagerContract.connect(other).addAdmin(admin.address)).to.be.revertedWith('ProductCategoryManager: Caller is not the admin');
        });
    });
});
