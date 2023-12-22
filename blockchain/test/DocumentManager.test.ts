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
let enumerableTransactionTypeContractFake: FakeContract;
let owner: SignerWithAddress;
let sender: SignerWithAddress;
let admin: SignerWithAddress;
let otherAccount: SignerWithAddress;
let tradeManager: SignerWithAddress;
let documentCounterId: BigNumber;

describe('DocumentManager', () => {
    const documentTypes = [0, 1];
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
    const transactionId = BigNumber.from(2);

    before(async () => {
        [owner, sender, admin, tradeManager, otherAccount] = await ethers.getSigners();

        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);

        enumerableTransactionTypeContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableTransactionTypeContractFake.contains.returns((value: string) => transactionTypes.includes(value[0]));

        documentManagerContract = await DocumentManager.deploy([], enumerableTransactionTypeContractFake.address);
        await documentManagerContract.deployed();

        await documentManagerContract.connect(owner).addTradeManager(tradeManager.address);
    });

    describe('registerDocument', () => {
        it('should register a document (as trade manager contract)', async () => {
            await documentManagerContract.connect(tradeManager).registerDocument(transactionId, transactionTypes[0], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

            expect(enumerableTransactionTypeContractFake.contains).to.be.called;
            expect(enumerableTransactionTypeContractFake.contains).to.be.calledWith(transactionTypes[0]);

            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[0]);
            expect(documentCounterId).to.equal(1);

            const savedDocuments = await documentManagerContract.connect(sender).getDocumentsByDocumentType(transactionId, transactionTypes[0], rawDocument.documentType);
            const savedDocument = savedDocuments[0];
            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);
        });

        it('should register a document - FAIL (The transaction type specified isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).registerDocument(transactionId, 'custom type', rawDocument.name, rawDocument.documentType, rawDocument.externalUrl))
                .to.be.revertedWith('The transaction type specified isn\'t registered');
        });

        it('should emit DocumentRegistered event', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[0]);
            await expect(documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[0], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl))
                .to.emit(documentManagerContract, 'DocumentRegistered')
                .withArgs(documentCounterId.toNumber() + 1, transactionId);
        });

        it('should try to retrieve a document - FAIL (The transaction type specified isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).getDocumentsByDocumentType(transactionId, 'custom type', rawDocument.documentType))
                .to.be.revertedWith('The transaction type specified isn\'t registered');
        });
    });

    describe('getTransactionDocumentIds', () => {
        it('should retrieve saved document ids by owner address and relative transaction id', async () => {
            await documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[1], rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            await documentManagerContract.connect(owner).registerDocument(transactionId, transactionTypes[1], rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);

            const documentsCounter = await documentManagerContract.connect(owner).getDocumentsCounterByTransactionIdAndType(transactionId, transactionTypes[1]);
            expect(documentsCounter).to.equal(2);

            const savedDocuments1 = await documentManagerContract.connect(owner).getDocumentsByDocumentType(transactionId, transactionTypes[1], rawDocument.documentType);
            const savedDocuments2 = await documentManagerContract.connect(owner).getDocumentsByDocumentType(transactionId, transactionTypes[1], rawDocument2.documentType);

            const savedDocument1 = savedDocuments1[savedDocuments1.length - 1];
            expect(savedDocument1.id).to.equal(documentsCounter.toNumber() - 1);
            expect(savedDocument1.transactionId).to.equal(transactionId);
            expect(savedDocument1.name).to.equal(rawDocument.name);
            expect(savedDocument1.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument1.externalUrl).to.equal(rawDocument.externalUrl);

            const savedDocument2 = savedDocuments2[savedDocuments2.length - 1];
            expect(savedDocument2.id).to.equal(documentsCounter.toNumber());
            expect(savedDocument2.transactionId).to.equal(transactionId);
            expect(savedDocument2.name).to.equal(rawDocument2.name);
            expect(savedDocument2.documentType).to.equal(rawDocument2.documentType);
            expect(savedDocument2.externalUrl).to.equal(rawDocument2.externalUrl);
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

        it('should add and remove trade manager roles', async () => {
            await documentManagerContract.connect(owner).addTradeManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.TRADE_MANAGER_ROLE(), tradeManager.address)).to.be.true;
            await documentManagerContract.connect(owner).removeTradeManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.TRADE_MANAGER_ROLE(), tradeManager.address)).to.be.false;
        });

        it('should fail to add and remove trade manager roles if the caller is not an admin', async () => {
            await expect(documentManagerContract.connect(otherAccount).addTradeManager(tradeManager.address)).to.be.revertedWith('Caller is not the admin');
            await expect(documentManagerContract.connect(otherAccount).removeTradeManager(tradeManager.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
