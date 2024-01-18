/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

describe('AssetOperationManager', () => {
    let assertOperationManagerContract: Contract;
    let materialManagerContractFake: FakeContract;
    let admin: SignerWithAddress, other: SignerWithAddress;

    beforeEach(async () => {
        [admin, other] = await ethers.getSigners();

        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((id: number) => id <= 10);

        const AssetOperationManager = await ethers.getContractFactory('AssetOperationManager');
        assertOperationManagerContract = await AssetOperationManager.deploy(materialManagerContractFake.address);
        await assertOperationManagerContract.deployed();
    });

    describe('Register', () => {
        it('should register a AssetOperation', async () => {
            const previousAssetOperationCounter = await assertOperationManagerContract.getAssetOperationsCounter();
            expect(previousAssetOperationCounter).to.be.equal(0);
            const tx = await assertOperationManagerContract.registerAssetOperation('testTransformation', [[1], [2]], 3);
            await tx.wait();

            const currentAssetOperationCounter = await assertOperationManagerContract.getAssetOperationsCounter();
            expect(currentAssetOperationCounter).to.be.equal(1);

            const registeredTransformation = await assertOperationManagerContract.getAssetOperation(1);
            expect(registeredTransformation[0]).to.be.equal(BigNumber.from(1));
            expect(registeredTransformation[1]).to.be.equal('testTransformation');
            expect(registeredTransformation[2]).deep.equal([BigNumber.from(1), BigNumber.from(2)]);
            expect(registeredTransformation[3]).to.be.equal(BigNumber.from(3));
            expect(registeredTransformation[4]).to.be.equal(true);
            expect(await assertOperationManagerContract.getAssetOperationExists(1)).to.be.equal(true);
            await expect(tx).to.emit(assertOperationManagerContract, 'AssetOperationRegistered').withArgs(registeredTransformation[0], registeredTransformation[1], registeredTransformation[3]);
            expect(await assertOperationManagerContract.getAssetOperationType(1)).to.be.equal(1);

            expect(await assertOperationManagerContract.getAssetOperationIdsOfCreator(admin.address)).deep.equal([BigNumber.from(1)]);
            expect(await assertOperationManagerContract.getAssetOperationIdsOfCreator(other.address)).deep.equal([]);
        });

        it('should register a Consolidation', async () => {
            const tx = await assertOperationManagerContract.registerAssetOperation('testConsolidation', [[1]], [3]);
            await tx.wait();

            const registeredConsolidation = await assertOperationManagerContract.getAssetOperation(1);
            expect(registeredConsolidation[0]).to.be.equal(BigNumber.from(1));
            expect(registeredConsolidation[1]).to.be.equal('testConsolidation');
            expect(registeredConsolidation[2]).deep.equal([BigNumber.from(1)]);
            expect(registeredConsolidation[3]).to.be.equal(BigNumber.from(3));
            expect(registeredConsolidation[4]).to.be.equal(true);
            expect(await assertOperationManagerContract.getAssetOperationExists(1)).to.be.equal(true);
            await expect(tx).to.emit(assertOperationManagerContract, 'AssetOperationRegistered').withArgs(registeredConsolidation[0], registeredConsolidation[1], registeredConsolidation[3]);
            expect(await assertOperationManagerContract.getAssetOperationType(1)).to.be.equal(0);
        });

        it('should register an AssetOperation - FAIL(AssetOperationManager: Output material does not exist)', async () => {
            await expect(assertOperationManagerContract.registerAssetOperation('testTransformation', [[1], [2]], 15)).to.be.revertedWith('AssetOperationManager: Output material does not exist');
        });

        it('should register an AssetOperation - FAIL(AssetOperationManager: Input material does not exist)', async () => {
            await expect(assertOperationManagerContract.registerAssetOperation('testTransformation', [[1], [15]], 3)).to.be.revertedWith('AssetOperationManager: Input material does not exist');
        });

        it('should get AssetOperation type - FAIL(AssetOperationManager: Asset operation does not exist)', async () => {
            await expect(assertOperationManagerContract.getAssetOperationType(1)).to.be.revertedWith('AssetOperationManager: Asset operation does not exist');
        });
    });

    describe('Roles', () => {
        it('should add and remove admin roles', async () => {
            await assertOperationManagerContract.connect(admin).addAdmin(other.address);
            expect(await assertOperationManagerContract.hasRole(await assertOperationManagerContract.ADMIN_ROLE(), other.address)).to.equal(true);
            await assertOperationManagerContract.connect(admin).removeAdmin(other.address);
            expect(await assertOperationManagerContract.hasRole(await assertOperationManagerContract.ADMIN_ROLE(), other.address)).to.equal(false);
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(assertOperationManagerContract.connect(other).addAdmin(other.address)).to.be.revertedWith('AssetOperationManager: Caller is not the admin');
        });
    });
});
