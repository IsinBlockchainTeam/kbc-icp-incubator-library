/* eslint-disable import/no-extraneous-dependencies */
import chai, { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { MaterialManager } from '../typechain-types';

describe('Trade.sol', () => {
    chai.use(smock.matchers);
    let productCategoryManagerContractFake: FakeContract;
    let materialManagerContractFake: FakeContract;
    let documentManagerContractFake: FakeContract;
    const documentTypes = [1];

    let basicTradeContract: Contract;
    let admin: SignerWithAddress, supplier: SignerWithAddress,
        customer: SignerWithAddress, commissioner: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com';
    const name: string = 'Test Trade';

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1),
    } as MaterialManager.MaterialStructOutput;

    before(async () => {
        [admin, supplier, customer, commissioner] = await ethers.getSigners();
        productCategoryManagerContractFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerContractFake.getProductCategoryExists.returns((value: number) => value <= 10);
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((value: number) => value <= 10);
        materialManagerContractFake.getMaterial.returns(materialStruct);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
    });

    beforeEach(async () => {
        const BasicTrade = await ethers.getContractFactory('BasicTrade');
        basicTradeContract = await BasicTrade.deploy(1, productCategoryManagerContractFake.address, materialManagerContractFake.address,
            documentManagerContractFake.address, supplier.address, customer.address, commissioner.address, externalUrl, name);
        await basicTradeContract.deployed();
    });

    describe('Trade status', () => {
        // it('should compute the trade status - FAIL (Trade: There are no documents related to this trade)', async () => {
        //     documentManagerContractFake.getDocumentsCounter.returns(0);
        //     await expect(basicTradeContract.connect(supplier).getTradeStatus()).to.be.revertedWith('Trade: There are no documents related to this trade');
        // });

        it('should compute the trade status - CONTRACTING', async () => {
            documentManagerContractFake.getDocumentsCounter.returns(0);
            expect(await basicTradeContract.connect(supplier)
                .getTradeStatus())
                .to
                .equal(2);
        });

        it('should compute the trade status - FAIL (Trade: There are no documents with correct document type)', async () => {
            documentManagerContractFake.getDocumentsCounter.returns(2);
            await expect(basicTradeContract.connect(customer)
                .getTradeStatus())
                .to
                .be
                .revertedWith('Trade: There are no documents with correct document type');
        });
    });

    describe('Documents', () => {
        it('should add a document', async () => {
            await basicTradeContract.addLine(1);
            await basicTradeContract.assignMaterial(1, 2);
            await basicTradeContract.addDocument(1, documentTypes[0], 'https://www.test.com', 'content_hash');
            expect(documentManagerContractFake.registerDocument)
                .to
                .have
                .callCount(1);
            expect(documentManagerContractFake.registerDocument)
                .to
                .have
                .calledWith('https://www.test.com', 'content_hash');
        });
    });

    describe('Admins', () => {
        it('should add an admin and later remove it', async () => {
            await basicTradeContract.connect(admin).addAdmin(supplier.address);
            await expect(basicTradeContract.connect(supplier).addAdmin(customer.address)).to.not.be.reverted;

            await basicTradeContract.connect(admin).removeAdmin(supplier.address);
            await expect(basicTradeContract.connect(supplier).addAdmin(commissioner.address)).to.be.revertedWith('Trade: Caller is not an admin');
        });
    });
});
