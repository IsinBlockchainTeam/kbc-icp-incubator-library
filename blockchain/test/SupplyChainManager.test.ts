/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('SupplyChainManager', () => {
    let supplyChainManagerContract: Contract;
    let address1: SignerWithAddress;

    beforeEach(async () => {
        [, address1] = await ethers.getSigners();

        const SupplyChainManager = await ethers.getContractFactory('SupplyChainManager');
        supplyChainManagerContract = await SupplyChainManager.deploy();
        await supplyChainManagerContract.deployed();
    });

    describe('Registration', () => {
        it('should register a Material', async () => {
            const previousMaterialCounter = await supplyChainManagerContract.getMaterialsCounter();
            expect(previousMaterialCounter).to.be.equal(0);
            const tx = await supplyChainManagerContract.registerMaterial(address1.address, 'testMaterial');
            await tx.wait();

            const currentMaterialCounter = await supplyChainManagerContract.getMaterialsCounter();
            expect(currentMaterialCounter).to.be.equal(1);
            const materialIds = await supplyChainManagerContract.getMaterialIds(address1.address);
            expect(currentMaterialCounter).to.equal(materialIds.length);

            const registeredMaterial = await supplyChainManagerContract.getMaterial(1);

            const expectedMaterial = { id: BigNumber.from(1), name: 'testMaterial' };
            const expectedResourceWithOwner = { ...expectedMaterial, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(registeredMaterial[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });

            await expect(tx).to.emit(supplyChainManagerContract, 'ResourceRegistered').withArgs('material', address1.address, 1);
        });
    });

    describe('Update', () => {
        it('should update a Material', async () => {
            await (await supplyChainManagerContract.registerMaterial(address1.address, 'testMaterial')).wait();
            const tx = await supplyChainManagerContract.updateMaterial(1, 'testMaterial_updated');
            await tx.wait();

            const currentMaterialCounter = await supplyChainManagerContract.getMaterialsCounter();
            expect(currentMaterialCounter).to.be.equal(1);
            const updatedResource = await supplyChainManagerContract.getMaterial(1);

            const expectedMaterial = { id: BigNumber.from(1), name: 'testMaterial_updated' };
            const expectedResourceWithOwner = { ...expectedMaterial, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(updatedResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });

            await expect(tx).to.emit(supplyChainManagerContract, 'ResourceUpdated').withArgs('material', 1);
        });
    });
});
