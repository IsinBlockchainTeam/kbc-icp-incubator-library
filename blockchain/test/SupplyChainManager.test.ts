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

    const addInputMaterials = async (): Promise<number> => {
        let tx = await supplyChainManagerContract.registerMaterial(address1.address, 'testMaterial1');
        await tx.wait();
        tx = await supplyChainManagerContract.registerMaterial(address1.address, 'testMaterial2');
        await tx.wait();
        return (await supplyChainManagerContract.getMaterialsCounter()).toNumber();
    };

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

        it('should register a Transformation', async () => {
            const previousTransformationCounter = await supplyChainManagerContract.getTransformationsCounter();
            expect(previousTransformationCounter).to.be.equal(0);
            const materialsCounter = await addInputMaterials();
            const tx = await supplyChainManagerContract.registerTransformation(address1.address, 'testTransformation', [materialsCounter - 1, materialsCounter], materialsCounter + 1);
            await tx.wait();

            const currentTransformationCounter = await supplyChainManagerContract.getTransformationsCounter();
            expect(currentTransformationCounter).to.be.equal(1);
            const transformationIds = await supplyChainManagerContract.getTransformationIds(address1.address);
            expect(currentTransformationCounter).to.equal(transformationIds.length);
            const registeredTransformation = await supplyChainManagerContract.getTransformation(1);

            const expectedInputMaterials = [
                [BigNumber.from(materialsCounter - 1), 'testMaterial1', address1.address, true],
                [BigNumber.from(materialsCounter), 'testMaterial2', address1.address, true],
            ];
            const expectedTransformation = {
                id: BigNumber.from(1), name: 'testTransformation', inputMaterials: expectedInputMaterials, outputMaterialId: 3,
            };
            const expectedResourceWithOwner = { ...expectedTransformation, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(registeredTransformation[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });

            await expect(tx).to.emit(supplyChainManagerContract, 'ResourceRegistered').withArgs('transformation', address1.address, 1);
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

        it('should update a Transformation', async () => {
            let materialsCounter = await addInputMaterials();
            await (await supplyChainManagerContract.registerTransformation(address1.address, 'testTransformation', [materialsCounter - 1, materialsCounter], materialsCounter + 1)).wait();

            materialsCounter = await addInputMaterials();
            const tx = await supplyChainManagerContract.updateTransformation(1, 'testTransformation_updated', [materialsCounter - 1, materialsCounter], materialsCounter + 1);
            await tx.wait();

            const currentTransformationCounter = await supplyChainManagerContract.getTransformationsCounter();
            expect(currentTransformationCounter).to.be.equal(1);
            const updatedResource = await supplyChainManagerContract.getTransformation(1);

            const expectedInputMaterials = [
                [BigNumber.from(materialsCounter - 1), 'testMaterial1', address1.address, true],
                [BigNumber.from(materialsCounter), 'testMaterial2', address1.address, true],
            ];
            const expectedTransformation = {
                id: BigNumber.from(1), name: 'testTransformation_updated', inputMaterials: expectedInputMaterials, outputMaterialId: BigNumber.from(materialsCounter + 1),
            };
            const expectedResourceWithOwner = { ...expectedTransformation, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(updatedResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });

            await expect(tx).to.emit(supplyChainManagerContract, 'ResourceUpdated').withArgs('transformation', 1);
        });
    });
});
