/* eslint-disable import/no-extraneous-dependencies */
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';
import { RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

describe('ProductCategoryManager', () => {
    let productCategoryManagerContract: Contract;
    let admin: SignerWithAddress, other: SignerWithAddress;
    let delegateManagerContractFake: FakeContract;

    const roleProof: RoleProofStruct = {
        signedProof: '0x',
        delegator: '',
        delegateCredentialIdHash: ethers.utils.formatBytes32String('delegateCredentialIdHash')
    };

    beforeEach(async () => {
        [admin, other] = await ethers.getSigners();

        roleProof.delegator = admin.address;
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        const ProductCategoryManager = await ethers.getContractFactory('ProductCategoryManager');
        productCategoryManagerContract = await ProductCategoryManager.deploy(delegateManagerContractFake.address);
        await productCategoryManagerContract.deployed();
    });

    describe('Registration', () => {
        it('should register two ProductCategories', async () => {
            const previousProductCategoryCounter = await productCategoryManagerContract.getProductCategoriesCounter(roleProof);
            expect(previousProductCategoryCounter).to.be.equal(0);
            const tx = await productCategoryManagerContract.registerProductCategory(roleProof, 'testProductCategory', 85, 'firstProductCategory');
            await tx.wait();

            let currentProductCategoryCounter = await productCategoryManagerContract.getProductCategoriesCounter(roleProof);
            expect(currentProductCategoryCounter).to.be.equal(1);

            const registeredProductCategory = await productCategoryManagerContract.getProductCategory(roleProof, 1);
            expect(registeredProductCategory[0]).to.be.equal(BigNumber.from(1));
            expect(registeredProductCategory[1]).to.be.equal('testProductCategory');
            expect(registeredProductCategory[2]).to.be.equal(BigNumber.from(85));
            expect(registeredProductCategory[3]).to.be.equal('firstProductCategory');
            expect(registeredProductCategory[4]).to.be.equal(true);
            expect(await productCategoryManagerContract.getProductCategoryExists(roleProof, 1)).to.be.equal(true);
            expect(tx)
                .to.emit(productCategoryManagerContract, 'ProductCategoryRegistered')
                .withArgs(registeredProductCategory.id, registeredProductCategory.name, registeredProductCategory.quality);

            const tx2 = await productCategoryManagerContract.registerProductCategory(roleProof, 'testProductCategory2', 90, 'secondProductCategory');
            await tx2.wait();
            currentProductCategoryCounter = await productCategoryManagerContract.getProductCategoriesCounter(roleProof);
            expect(currentProductCategoryCounter).to.be.equal(2);
            const registeredProductCategory2 = await productCategoryManagerContract.getProductCategory(roleProof, 2);

            expect(tx2)
                .to.emit(productCategoryManagerContract, 'ProductCategoryRegistered')
                .withArgs(registeredProductCategory2.id, registeredProductCategory2.name, registeredProductCategory2.quality);
        });
    });

    describe('Update', () => {
        it('should update a material', async () => {
            await productCategoryManagerContract.registerProductCategory(roleProof, 'testProductCategory', 85, 'firstProductCategory');
            const tx = await productCategoryManagerContract.updateProductCategory(roleProof, 1, 'testProductCategory2', 90, 'secondProductCategory');
            await tx.wait();

            const registeredProductCategory = await productCategoryManagerContract.getProductCategory(roleProof, 1);
            expect(registeredProductCategory[0]).to.be.equal(BigNumber.from(1));
            expect(registeredProductCategory[1]).to.be.equal('testProductCategory2');
            expect(registeredProductCategory[2]).to.be.equal(BigNumber.from(90));
            expect(registeredProductCategory[3]).to.be.equal('secondProductCategory');
            expect(registeredProductCategory[4]).to.be.equal(true);
            expect(tx).to.emit(productCategoryManagerContract, 'ProductCategoryUpdated').withArgs(registeredProductCategory.id);
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
            await expect(productCategoryManagerContract.connect(other).addAdmin(admin.address)).to.be.revertedWith(
                'ProductCategoryManager: Caller is not the admin'
            );
        });
    });
});
