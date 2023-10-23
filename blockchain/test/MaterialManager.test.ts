/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('MaterialManager', () => {
    let materialManagerContract: Contract;
    let owner: SignerWithAddress, admin: SignerWithAddress, address1: SignerWithAddress;

    beforeEach(async () => {
        [owner, admin, address1] = await ethers.getSigners();

        const MaterialManager = await ethers.getContractFactory('MaterialManager');
        materialManagerContract = await MaterialManager.deploy([admin.address]);
        await materialManagerContract.deployed();
    });

    describe('Registration', () => {
        it('should register a Material', async () => {
            const previousMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(previousMaterialCounter).to.be.equal(0);
            const tx = await materialManagerContract.registerMaterial(address1.address, 'testMaterial');
            await tx.wait();

            const currentMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(currentMaterialCounter).to.be.equal(1);
            const materialIds = await materialManagerContract.getMaterialIds(address1.address);
            expect(currentMaterialCounter).to.equal(materialIds.length);

            const registeredMaterial = await materialManagerContract.getMaterial(1);

            const expectedMaterial = { id: BigNumber.from(1), name: 'testMaterial' };
            const expectedResourceWithOwner = { ...expectedMaterial, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(registeredMaterial[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });

            await expect(tx).to.emit(materialManagerContract, 'MaterialRegistered').withArgs(1, address1.address);
        });
    });

    describe('Update', () => {
        it('should update a Material', async () => {
            await (await materialManagerContract.registerMaterial(address1.address, 'testMaterial')).wait();
            const tx = await materialManagerContract.updateMaterial(1, 'testMaterial_updated');
            await tx.wait();

            const currentMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(currentMaterialCounter).to.be.equal(1);
            const updatedResource = await materialManagerContract.getMaterial(1);

            const expectedMaterial = { id: BigNumber.from(1), name: 'testMaterial_updated' };
            const expectedResourceWithOwner = { ...expectedMaterial, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(updatedResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });

            await expect(tx).to.emit(materialManagerContract, 'MaterialUpdated').withArgs(1);
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await materialManagerContract.connect(owner).addAdmin(admin.address);
            expect(await materialManagerContract.hasRole(await materialManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await materialManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await materialManagerContract.hasRole(await materialManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(materialManagerContract.connect(address1).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(materialManagerContract.connect(address1).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
