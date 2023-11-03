/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

describe('TransformationManager', () => {
    let transformationManagerContract: Contract;
    let materialManagerContract: Contract;
    let owner: SignerWithAddress, admin: SignerWithAddress, address1: SignerWithAddress;

    let materialsCounter: number;

    beforeEach(async () => {
        [owner, admin, address1] = await ethers.getSigners();

        const MaterialManager = await ethers.getContractFactory('MaterialManager');
        materialManagerContract = await MaterialManager.deploy([admin.address]);

        const TransformationManager = await ethers.getContractFactory('TransformationManager');
        transformationManagerContract = await TransformationManager.deploy([admin.address], materialManagerContract.address);
        await transformationManagerContract.deployed();
    });

    const addMaterials = async (inputIds: number[], outputId: number): Promise<number> => {
        await (await materialManagerContract.registerMaterial(address1.address, `testMaterial${inputIds[0]}`)).wait();
        await (await materialManagerContract.registerMaterial(address1.address, `testMaterial${inputIds[1]}`)).wait();
        await (await materialManagerContract.registerMaterial(address1.address, `testMaterial${outputId}`)).wait();
        return (await materialManagerContract.getMaterialsCounter()).toNumber();
    };

    describe('registerTransformation', () => {
        it('should register a Transformation', async () => {
            const previousTransformationCounter = await transformationManagerContract.getTransformationsCounter();
            expect(previousTransformationCounter).to.be.equal(0);
            materialsCounter = await addMaterials([1, 2], 3);
            const tx = await transformationManagerContract.registerTransformation(address1.address, 'testTransformation', [materialsCounter - 2, materialsCounter - 1], materialsCounter);
            await tx.wait();

            const currentTransformationCounter = await transformationManagerContract.getTransformationsCounter();
            expect(currentTransformationCounter).to.be.equal(1);
            const transformationIds = await transformationManagerContract.getTransformationIds(address1.address);
            expect(currentTransformationCounter).to.equal(transformationIds.length);
            const registeredTransformation = await transformationManagerContract.getTransformation(1);

            const expectedInputMaterials = [
                [BigNumber.from(1), 'testMaterial1', address1.address, true],
                [BigNumber.from(2), 'testMaterial2', address1.address, true],
            ];
            const expectedTransformation = {
                id: BigNumber.from(1), name: 'testTransformation', inputMaterials: expectedInputMaterials, outputMaterialId: 3,
            };
            const expectedResourceWithOwner = { ...expectedTransformation, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(registeredTransformation[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });
        });

        it('should emit TransformationRegistered event', async () => {
            materialsCounter = await addMaterials([1, 2], 3);
            await expect(transformationManagerContract.registerTransformation(address1.address, 'testTransformation', [materialsCounter - 2, materialsCounter - 1], materialsCounter))
                .to.emit(transformationManagerContract, 'TransformationRegistered')
                .withArgs(1, address1.address);
        });

        it('should register a Transformation - FAIL(Material does not exist)', async () => {
            await expect(transformationManagerContract.registerTransformation(address1.address, 'testTransformation', [10, materialsCounter - 1], materialsCounter))
                .to.be.revertedWith('Material does not exist');
        });
    });

    describe('updateTransformation', () => {
        it('should update a Transformation', async () => {
            materialsCounter = await addMaterials([1, 2], 3);
            await (await transformationManagerContract.registerTransformation(address1.address, 'testTransformation', [materialsCounter - 2, materialsCounter - 1], materialsCounter)).wait();

            materialsCounter = await addMaterials([4, 5], 6);
            const tx = await transformationManagerContract.updateTransformation(1, 'testTransformation_updated', [materialsCounter - 2, materialsCounter - 1], materialsCounter);
            await tx.wait();

            const currentTransformationCounter = await transformationManagerContract.getTransformationsCounter();
            expect(currentTransformationCounter).to.be.equal(1);
            const updatedResource = await transformationManagerContract.getTransformation(1);

            const expectedInputMaterials = [
                [BigNumber.from(4), 'testMaterial4', address1.address, true],
                [BigNumber.from(5), 'testMaterial5', address1.address, true],
            ];
            const expectedTransformation = {
                id: BigNumber.from(1), name: 'testTransformation_updated', inputMaterials: expectedInputMaterials, outputMaterialId: BigNumber.from(materialsCounter),
            };
            const expectedResourceWithOwner = { ...expectedTransformation, owner: address1.address };
            Object.keys(expectedResourceWithOwner).forEach((key) => {
                // @ts-ignore
                expect(updatedResource[key]).deep.to.equal(expectedResourceWithOwner[key]);
            });
        });

        it('should emit TransformationUpdated event', async () => {
            materialsCounter = await addMaterials([1, 2], 3);
            await expect(transformationManagerContract.updateTransformation(1, 'testTransformation_updated', [materialsCounter - 2, materialsCounter - 1], materialsCounter))
                .to.emit(transformationManagerContract, 'TransformationUpdated')
                .withArgs(1);
        });

        it('should update a Transformation - FAIL(Material does not exist)', async () => {
            await expect(transformationManagerContract.updateTransformation(1, 'testTransformation_updated', [materialsCounter - 2, 15], materialsCounter))
                .to.be.revertedWith('Material does not exist');
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await transformationManagerContract.connect(owner).addAdmin(admin.address);
            expect(await transformationManagerContract.hasRole(await transformationManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await transformationManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await transformationManagerContract.hasRole(await transformationManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(transformationManagerContract.connect(address1).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(transformationManagerContract.connect(address1).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
