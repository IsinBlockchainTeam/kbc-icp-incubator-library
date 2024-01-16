/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

describe('MaterialManager', () => {
    let materialManagerContract: Contract;
    let admin: SignerWithAddress, other: SignerWithAddress;
    let productCategoryManagerFake: FakeContract;

    beforeEach(async () => {
        [admin, other] = await ethers.getSigners();

        productCategoryManagerFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerFake.getProductCategoryExists.returns((id: number) => id <= 10);
        const MaterialManager = await ethers.getContractFactory('MaterialManager');
        materialManagerContract = await MaterialManager.deploy(productCategoryManagerFake.address);
        await materialManagerContract.deployed();
    });

    describe('Registration', () => {
        it('should register a Material', async () => {
            const previousMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(previousMaterialCounter).to.be.equal(0);
            const tx = await materialManagerContract.registerMaterial(10);
            await tx.wait();

            const currentMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(currentMaterialCounter).to.be.equal(1);

            const registeredMaterial = await materialManagerContract.getMaterial(1);
            expect(registeredMaterial[0]).to.be.equal(BigNumber.from(1));
            expect(registeredMaterial[1]).to.be.equal(BigNumber.from(10));
            expect(registeredMaterial[2]).to.be.equal(true);
            expect(await materialManagerContract.getMaterialExists(1)).to.be.equal(true);
            await expect(tx).to.emit(materialManagerContract, 'MaterialRegistered').withArgs(registeredMaterial[0], registeredMaterial[1]);
        });

        it('should register a Material - FAIL(MaterialManager: Product category does not exist)', async () => {
            await expect(materialManagerContract.registerMaterial(11)).to.be.revertedWith('MaterialManager: Product category does not exist');
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await materialManagerContract.connect(admin).addAdmin(other.address);
            expect(await materialManagerContract.hasRole(await materialManagerContract.ADMIN_ROLE(), other.address)).to.equal(true);
            await materialManagerContract.connect(admin).removeAdmin(other.address);
            expect(await materialManagerContract.hasRole(await materialManagerContract.ADMIN_ROLE(), other.address)).to.equal(false);
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(materialManagerContract.connect(other).addAdmin(admin.address)).to.be.revertedWith('MaterialManager: Caller is not the admin');
        });
    });
});
