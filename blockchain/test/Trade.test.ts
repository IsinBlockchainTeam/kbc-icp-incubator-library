/* eslint-disable import/no-extraneous-dependencies */
import chai, { expect } from 'chai';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { MaterialManager } from '../typechain-types';
import { KBCAccessControl } from '../typechain-types/contracts/MaterialManager';

describe('Trade.sol', () => {
    chai.use(smock.matchers);
    let delegateManagerContractFake: FakeContract;
    let productCategoryManagerContractFake: FakeContract;
    let materialManagerContractFake: FakeContract;
    let documentManagerContractFake: FakeContract;
    let unitManagerContractFake: FakeContract;
    const documentTypes = [0, 1, 2];

    const roleProof: KBCAccessControl.RoleProofStruct = {
        signedProof: '0x',
        delegator: ''
    };

    // these contracts are used as implementation of the trade, when used as parent class
    let basicTradeContract: Contract;
    let orderTradeContract: Contract;

    let admin: SignerWithAddress,
        supplier: SignerWithAddress,
        customer: SignerWithAddress,
        arbiter: SignerWithAddress,
        commissioner: SignerWithAddress;
    let KBCShipmentLibraryFake: FakeContract;
    const externalUrl: string = 'https://www.test.com';
    const metadataHash: string = 'metadata_hash';
    const now = new Date();
    const paymentDeadline = new Date(now.getDate() + 1);
    const documentDeliveryDeadline = new Date(paymentDeadline.getDate() + 1);
    const shippingDeadline = new Date(documentDeliveryDeadline.getDate() + 1);
    const deliveryDeadline = new Date(shippingDeadline.getDate() + 1);
    const name: string = 'Test Trade';

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(1)
    } as MaterialManager.MaterialStructOutput;

    before(async () => {
        [admin, supplier, customer, arbiter, commissioner] = await ethers.getSigners();
        roleProof.delegator = admin.address;
    });

    beforeEach(async () => {
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        productCategoryManagerContractFake = await smock.fake(ContractName.PRODUCT_CATEGORY_MANAGER);
        productCategoryManagerContractFake.getProductCategoryExists.returns(true);
        materialManagerContractFake = await smock.fake(ContractName.MATERIAL_MANAGER);
        materialManagerContractFake.getMaterialExists.returns(true);
        materialManagerContractFake.getMaterial.returns(materialStruct);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        unitManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        unitManagerContractFake.contains.returns(true);
        KBCShipmentLibraryFake = await smock.fake(ContractName.KBC_SHIPMENT_LIBRARY);
        const BasicTrade = await ethers.getContractFactory('BasicTrade');
        const OrderTrade = await ethers.getContractFactory('OrderTrade', {
            libraries: {
                KBCShipmentLibrary: KBCShipmentLibraryFake.address
            }
        });
        basicTradeContract = await BasicTrade.deploy(
            roleProof,
            1,
            delegateManagerContractFake.address,
            productCategoryManagerContractFake.address,
            materialManagerContractFake.address,
            documentManagerContractFake.address,
            unitManagerContractFake.address,
            supplier.address,
            customer.address,
            commissioner.address,
            externalUrl,
            metadataHash,
            name
        );
        await basicTradeContract.deployed();
        orderTradeContract = await OrderTrade.deploy(
            roleProof,
            1,
            delegateManagerContractFake.address,
            productCategoryManagerContractFake.address,
            materialManagerContractFake.address,
            documentManagerContractFake.address,
            unitManagerContractFake.address,
            supplier.address,
            customer.address,
            commissioner.address,
            externalUrl,
            metadataHash,
            paymentDeadline.getTime(),
            documentDeliveryDeadline.getTime(),
            arbiter.address,
            shippingDeadline.getTime(),
            deliveryDeadline.getTime(),
            500,
            ethers.Wallet.createRandom().address,
            ethers.Wallet.createRandom().address,
            ethers.Wallet.createRandom().address
        );
        await orderTradeContract.deployed();
    });

    it('should get the trade type', async () => {
        expect(await basicTradeContract.getTradeType(roleProof)).to.equal(0);
        expect(await orderTradeContract.getTradeType(roleProof)).to.equal(1);
    });

    describe('Documents', () => {
        beforeEach(() => {
            documentManagerContractFake.registerDocument.reset();
            documentManagerContractFake.registerDocument.returns(1);
        });

        it('should add a document', async () => {
            await basicTradeContract.connect(supplier).addDocument(roleProof, documentTypes[1], 'https://www.test.com', 'content_hash');
            expect(documentManagerContractFake.registerDocument).to.have.callCount(1);
            expect(documentManagerContractFake.registerDocument).to.have.calledWith(
                roleProof,
                'https://www.test.com',
                'content_hash',
                supplier.address
            );
        });

        it('should update a document', async () => {
            await basicTradeContract.connect(supplier).updateDocument(roleProof, 1, 'https://www.test-updated.com', 'content_hash-updated');
            expect(documentManagerContractFake.updateDocument).to.have.callCount(1);
            expect(documentManagerContractFake.updateDocument).to.have.calledWith(
                roleProof,
                BigNumber.from(1),
                'https://www.test-updated.com',
                'content_hash-updated',
                supplier.address
            );
        });

        // it("should add a document - FAIL (Trade: Line doesn't exist)", async () => {
        //     await expect(basicTradeContract.addDocument(1, documentTypes[0], 'https://www.test.com', 'content_hash'))
        //         .to
        //         .be
        //         .revertedWith('Trade: Line does not exist');
        // });
        //
        // it("should add a document - FAIL (Trade: Material doesn't exist)", async () => {
        //     await basicTradeContract.addLine(1);
        //     await expect(basicTradeContract.addDocument(1, documentTypes[0], 'https://www.test.com', 'content_hash'))
        //         .to
        //         .be
        //         .revertedWith('Trade: A material must be assigned before adding a document for a line');
        // });

        it('should get document ids by type', async () => {
            await basicTradeContract.connect(supplier).addDocument(roleProof, documentTypes[1], 'https://www.test.com', 'content_hash');
            expect(await basicTradeContract.getDocumentIdsByType(roleProof, documentTypes[1])).to.deep.equal([BigNumber.from(1)]);
        });

        it('should get document ids', async () => {
            await basicTradeContract.connect(supplier).addDocument(roleProof, documentTypes[1], 'https://www.test.com', 'content_hash');
            expect(await basicTradeContract.getAllDocumentIds(roleProof)).to.deep.equal([BigNumber.from(0), BigNumber.from(1)]);
        });

        it('should validate document', async () => {
            await basicTradeContract.connect(supplier).addDocument(roleProof, documentTypes[1], 'https://www.test.com', 'content_hash');
            const documentIds = await basicTradeContract.getAllDocumentIds(roleProof);
            await basicTradeContract.validateDocument(roleProof, documentIds[documentIds.length - 1], 1);

            expect(await basicTradeContract.getDocumentStatus(roleProof, documentIds[documentIds.length - 1])).to.equal(1);
        });

        it('should validate document - FAIL (Trade: Document does not exist)', async () => {
            await expect(basicTradeContract.connect(supplier).validateDocument(roleProof, 40, 1)).to.be.revertedWith(
                'Trade: Document does not exist'
            );
        });

        it('should validate document - FAIL (Trade: Document status must be different from NOT_EVALUATED)', async () => {
            await basicTradeContract.connect(supplier).addDocument(roleProof, documentTypes[1], 'https://www.test.com', 'content_hash');
            const documentIds = await basicTradeContract.getAllDocumentIds(roleProof);
            await expect(basicTradeContract.validateDocument(roleProof, documentIds[documentIds.length - 1], 0)).to.be.revertedWith(
                'Trade: Document status must be different from NOT_EVALUATED'
            );
        });
    });
});
