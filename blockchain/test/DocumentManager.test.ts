/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import chai, { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';

chai.use(smock.matchers);

let documentManagerContract: Contract;
let enumerableDocumentTypeManagerContractFake: FakeContract;
let enumerableTransactionTypeContractFake: FakeContract;
let owner: SignerWithAddress;
let sender: SignerWithAddress;
let admin: SignerWithAddress;
let otherAccount: SignerWithAddress;
let tradeManager: SignerWithAddress;
let documentCounterId: BigNumber;

describe('DocumentManager', () => {
    const documentTypes = ['documentType1', 'documentType2'];
    const transactionTypes = ['trade', 'transformation'];
    const rawDocument = {
        name: 'Document name',
        documentType: documentTypes[0],
        externalUrl: 'externalUrl',
    };
    const rawDocument2 = {
        name: 'Document name2',
        documentType: documentTypes[1],
        externalUrl: 'externalUr2',
    };
    const transactionId = 2;
    const transactionLineId = 4;

    before(async () => {
        [owner, sender, admin, tradeManager, otherAccount] = await ethers.getSigners();

        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);

        enumerableDocumentTypeManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableDocumentTypeManagerContractFake.contains.returns((value: string) => documentTypes.includes(value[0]));

        enumerableTransactionTypeContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableTransactionTypeContractFake.contains.returns((value: string) => transactionTypes.includes(value[0]));

        documentManagerContract = await DocumentManager.deploy([], enumerableDocumentTypeManagerContractFake.address, enumerableTransactionTypeContractFake.address);
        await documentManagerContract.deployed();

        await documentManagerContract.connect(owner).addOrderManager(tradeManager.address);
    });

    describe('registerDocument', () => {
        it('should register a document (as trade manager contract)', async () => {
            await documentManagerContract.connect(tradeManager).registerDocument(transactionId, transactionTypes[0], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, transactionLineId);

            expect(enumerableDocumentTypeManagerContractFake.contains).to.be.called;
            expect(enumerableDocumentTypeManagerContractFake.contains).to.be.calledWith(rawDocument.documentType);
            expect(enumerableTransactionTypeContractFake.contains).to.be.called;
            expect(enumerableTransactionTypeContractFake.contains).to.be.calledWith(transactionTypes[0]);

            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[0]);

            const savedDocument = await documentManagerContract.connect(sender).getDocument(transactionId, transactionTypes[0], documentCounterId.toNumber());
            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);
            expect(savedDocument.transactionLineId).to.equal(transactionLineId);
        });

        it('should register a document - FAIL (Sender has no permissions)', async () => {
            await expect(documentManagerContract.connect(sender).registerDocument(transactionId, transactionTypes[0], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, transactionLineId))
                .to.be.revertedWith('Sender has no permissions');
        });

        it('should register a document - FAIL (The transaction type specified isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).registerDocument(transactionId, 'custom type', rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, transactionLineId))
                .to.be.revertedWith('The transaction type specified isn\'t registered');
        });

        it('should register a document - FAIL (The document type isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[0], rawDocument.name, 'custom document type', rawDocument.externalUrl, transactionLineId))
                .to.be.revertedWith('The document type isn\'t registered');
        });

        it('should emit DocumentRegistered event', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[0]);
            await expect(documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[0], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, transactionLineId))
                .to.emit(documentManagerContract, 'DocumentRegistered')
                .withArgs(documentCounterId.toNumber() + 1, transactionId);
        });

        it('should try to retrieve a document - FAIL (Document does not exist)', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[0]);
            expect(documentManagerContract.connect(sender).getDocument(transactionId, transactionTypes[0], documentCounterId.toNumber() + 10))
                .to.be.revertedWith('Document does not exist');
        });

        it('should try to retrieve a document - FAIL (The transaction type specified isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).getDocument(transactionId, 'custom type', documentCounterId.toNumber() + 10))
                .to.be.revertedWith('The transaction type specified isn\'t registered');
        });
    });

    describe('documentExists', () => {
        before(async () => {
            await documentManagerContract.connect(tradeManager).registerDocument(transactionId, transactionTypes[0], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, transactionLineId);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[0]);
        });

        it('should check if document exists', async () => {
            const exist = await documentManagerContract.connect(sender).documentExists(transactionId, transactionTypes[0], documentCounterId.toNumber());
            expect(exist).to.be.true;
        });

        it('should check if document exists - FAIL (The transaction type specified isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(sender).documentExists(transactionId, 'custom type', documentCounterId.toNumber()))
                .to.be.revertedWith('The transaction type specified isn\'t registered');
        });
    });

    describe('getTransactionDocumentIds', () => {
        it('should retrieve saved document ids by owner address and relative transaction id', async () => {
            await documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[1], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, transactionLineId);
            await documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[1], rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl, transactionLineId);

            const documentsCounter = await documentManagerContract.connect(owner).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[1]);
            expect(documentsCounter).to.equal(2);

            let savedDocument = await documentManagerContract.connect(owner).getDocument(transactionId, transactionTypes[1], documentsCounter.toNumber() - 1);
            expect(savedDocument.id).to.equal(documentsCounter.toNumber() - 1);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);

            savedDocument = await documentManagerContract.connect(owner).getDocument(transactionId, transactionTypes[1], documentsCounter.toNumber());
            expect(savedDocument.id).to.equal(documentsCounter.toNumber());
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument2.name);
            expect(savedDocument.documentType).to.equal(rawDocument2.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument2.externalUrl);
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await documentManagerContract.connect(owner).addAdmin(admin.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await documentManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(documentManagerContract.connect(otherAccount).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(documentManagerContract.connect(otherAccount).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });

        it('should add and remove order manager roles', async () => {
            await documentManagerContract.connect(owner).addOrderManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.ORDER_MANAGER_ROLE(), tradeManager.address)).to.be.true;
            await documentManagerContract.connect(owner).removeOrderManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.ORDER_MANAGER_ROLE(), tradeManager.address)).to.be.false;
        });

        it('should fail to add and remove order manager roles if the caller is not an admin', async () => {
            await expect(documentManagerContract.connect(otherAccount).addOrderManager(tradeManager.address)).to.be.revertedWith('Caller is not the admin');
            await expect(documentManagerContract.connect(otherAccount).removeOrderManager(tradeManager.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
