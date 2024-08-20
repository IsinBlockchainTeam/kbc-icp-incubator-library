/* eslint-disable import/no-extraneous-dependencies */

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';
import { KBCAccessControl } from '../typechain-types/contracts/MaterialManager';

describe('MaterialManager', () => {
    let materialManagerContract: Contract;
    let admin: SignerWithAddress, other: SignerWithAddress;
    let productCategoryManagerFake: FakeContract;
    let delegateManagerFake: FakeContract;

    const roleProof: KBCAccessControl.RoleProofStruct = {
        signedProof: '0x',
        delegator: '',
    }

    beforeEach(async () => {
        [admin, other] = await ethers.getSigners();

        roleProof.delegator = admin.address;
        productCategoryManagerFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerFake.getProductCategoryExists.returns((id: number) => id <= 10);
        delegateManagerFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerFake.hasValidRole.returns(true);
        const MaterialManager = await ethers.getContractFactory('MaterialManager');
        materialManagerContract = await MaterialManager.deploy(delegateManagerFake.address, productCategoryManagerFake.address);
        await materialManagerContract.deployed();
    });

    describe('Registration', () => {
        it('should register a Material', async () => {
            const previousMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(previousMaterialCounter).to.be.equal(0);
            const tx = await materialManagerContract.registerMaterial(roleProof, 10);
            await tx.wait();

            const currentMaterialCounter = await materialManagerContract.getMaterialsCounter();
            expect(currentMaterialCounter).to.be.equal(1);

            const registeredMaterial = await materialManagerContract.getMaterial(1);
            expect(registeredMaterial[0]).to.be.equal(BigNumber.from(1));
            expect(registeredMaterial[1]).to.be.equal(BigNumber.from(10));
            expect(registeredMaterial[2]).to.be.equal(true);
            expect(await materialManagerContract.getMaterialExists(1)).to.be.equal(true);
            await expect(tx).to.emit(materialManagerContract, 'MaterialRegistered').withArgs(registeredMaterial[0], registeredMaterial[1]);

            expect(await materialManagerContract.getMaterialIdsOfCreator(admin.address)).deep.equal([BigNumber.from(1)]);
            expect(await materialManagerContract.getMaterialIdsOfCreator(other.address)).deep.equal([]);
        });

        it('should register a Material - FAIL(MaterialManager: Product category does not exist)', async () => {
            await expect(materialManagerContract.registerMaterial(roleProof, 11)).to.be.revertedWith('MaterialManager: Product category does not exist');
        });
    });

    describe('Update', () => {
        it('should update a material', async () => {
            await materialManagerContract.registerMaterial(roleProof, 1);
            const tx = await materialManagerContract.updateMaterial(1, 2);
            await tx.wait();

            const registeredMaterial = await materialManagerContract.getMaterial(1);
            expect(registeredMaterial[0]).to.be.equal(BigNumber.from(1));
            expect(registeredMaterial[1]).to.be.equal(BigNumber.from(2));
            expect(registeredMaterial[2]).to.be.equal(true);
            await expect(tx).to.emit(materialManagerContract, 'MaterialUpdated').withArgs(registeredMaterial[0]);
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
            await expect(materialManagerContract.connect(other).addAdmin(admin.address)).to.be.revertedWith(
                'MaterialManager: Caller is not the admin'
            );
        });
    });
});
