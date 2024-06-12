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
    let enumerableUnitManagerContractFake: FakeContract;

    let tradeContract: Contract;
    let admin: SignerWithAddress,
        supplier: SignerWithAddress,
        customer: SignerWithAddress,
        commissioner: SignerWithAddress;
    const externalUrl: string = 'https://www.test.com';
    const name: string = 'Test Trade';

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1)
    } as MaterialManager.MaterialStructOutput;
    const documentTypes = [1];
    const units = ['BG', 'KGM', 'H87'];

    before(async () => {
        [admin, supplier, customer, commissioner] = await ethers.getSigners();
        productCategoryManagerContractFake = await smock.fake(
            ContractName.PRODUCT_CATEGORY_MANAGER
        );
        productCategoryManagerContractFake.getProductCategoryExists.returns(
            (value: number) => value <= 10
        );
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns((value: number) => value <= 10);
        materialManagerContractFake.getMaterial.returns(materialStruct);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        enumerableUnitManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableUnitManagerContractFake.contains.returns((value: string) =>
            units.includes(value[0])
        );
    });

    beforeEach(async () => {
        const Trade = await ethers.getContractFactory('Trade');
        tradeContract = await Trade.deploy(
            1,
            productCategoryManagerContractFake.address,
            materialManagerContractFake.address,
            documentManagerContractFake.address,
            enumerableUnitManagerContractFake.address,
            supplier.address,
            customer.address,
            commissioner.address,
            externalUrl,
            name
        );
        await tradeContract.deployed();
    });

    describe('Trade status', () => {
        // it('should compute the trade status - FAIL (Trade: There are no documents related to this trade)', async () => {
        //     documentManagerContractFake.getDocumentsCounter.returns(0);
        //     await expect(tradeContract.connect(supplier).getOrderStatus()).to.be.revertedWith('Trade: There are no documents related to this trade');
        // });

        it('should compute the trade status - CONTRACTING', async () => {
            documentManagerContractFake.getDocumentsCounter.returns(0);
            expect(await tradeContract.connect(supplier).getOrderStatus()).to.equal(3);
        });

        it('should compute the trade status - FAIL (Trade: There are no documents with correct document type)', async () => {
            documentManagerContractFake.getDocumentsCounter.returns(2);
            await expect(tradeContract.connect(customer).getOrderStatus()).to.be.revertedWith(
                'Trade: There are no documents with correct document type'
            );
        });
    });

    describe('Documents', () => {
        it('should add a document', async () => {
            await tradeContract.addDocument(
                documentTypes[0],
                'https://www.test.com',
                'content_hash'
            );
            expect(documentManagerContractFake.registerDocument).to.have.callCount(1);
            expect(documentManagerContractFake.registerDocument).to.have.calledWith(
                'https://www.test.com',
                'content_hash'
            );
        });

        // it("should add a document - FAIL (Trade: Line doesn't exist)", async () => {
        //     await expect(tradeContract.addDocument(1, documentTypes[0], 'https://www.test.com', 'content_hash'))
        //         .to
        //         .be
        //         .revertedWith('Trade: Line does not exist');
        // });
        //
        // it("should add a document - FAIL (Trade: Material doesn't exist)", async () => {
        //     await tradeContract.addLine(1);
        //     await expect(tradeContract.addDocument(1, documentTypes[0], 'https://www.test.com', 'content_hash'))
        //         .to
        //         .be
        //         .revertedWith('Trade: A material must be assigned before adding a document for a line');
        // });

        it('should get document ids by type', async () => {
            documentManagerContractFake.registerDocument.returns(1);

            await tradeContract.addDocument(
                documentTypes[0],
                'https://www.test.com',
                'content_hash'
            );
            expect(await tradeContract.getDocumentIdsByType(documentTypes[0])).to.deep.equal([
                BigNumber.from(1)
            ]);
        });

        it('should get document ids', async () => {
            documentManagerContractFake.registerDocument.returns(1);

            await tradeContract.addDocument(
                documentTypes[0],
                'https://www.test.com',
                'content_hash'
            );
            expect(await tradeContract.getAllDocumentIds()).to.deep.equal([BigNumber.from(1)]);
        });
    });

    describe('Admins', () => {
        it('should add an admin and later remove it', async () => {
            await tradeContract.connect(admin).addAdmin(supplier.address);
            await expect(tradeContract.connect(supplier).addAdmin(customer.address)).to.not.be
                .reverted;

            await tradeContract.connect(admin).removeAdmin(supplier.address);
            await expect(
                tradeContract.connect(supplier).addAdmin(commissioner.address)
            ).to.be.revertedWith('Trade: Caller is not an admin');
        });
    });
});
