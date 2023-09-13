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
let owner: SignerWithAddress;
let sender: SignerWithAddress;
let admin: SignerWithAddress;
let otherAccount: SignerWithAddress;
let orderManager: SignerWithAddress;
let documentCounterId: BigNumber;

describe('DocumentManager', () => {
    const documentTypes = ['documentType1', 'documentType2'];
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

    beforeEach(async () => {
        [owner, sender, admin, orderManager, otherAccount] = await ethers.getSigners();

        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);
        const EnumerableDocumentTypeManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);

        enumerableDocumentTypeManagerContractFake = await smock.fake(ContractName.ENUMERABLE_TYPE_MANAGER);
        enumerableDocumentTypeManagerContractFake.contains.returns((value: string) => documentTypes.includes(value[0]));

        documentManagerContract = await DocumentManager.deploy([], enumerableDocumentTypeManagerContractFake.address);
        await documentManagerContract.deployed();

        await documentManagerContract.connect(owner).addOrderManager(orderManager.address);
    });

    describe('registerDocument', () => {
        it('should register a document (as order manager contract)', async () => {
            await documentManagerContract.connect(orderManager).registerDocument(sender.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

            expect(enumerableDocumentTypeManagerContractFake.contains).to.be.called;
            expect(enumerableDocumentTypeManagerContractFake.contains).to.be.calledWith(rawDocument.documentType);

            documentCounterId = await documentManagerContract.connect(sender).getDocumentCounter(sender.address);

            const savedDocument = await documentManagerContract.connect(sender).getDocumentInfo(sender.address, transactionId, documentCounterId.toNumber());
            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.owner).to.equal(sender.address);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);
        });

        it('should register a document - FAIL (Sender has no permissions)', async () => {
            await expect(documentManagerContract.connect(sender).registerDocument(sender.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl))
                .to.be.revertedWith('Sender has no permissions');
        });

        it('should register a document - FAIL (The document type isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).registerDocument(sender.address, transactionId, rawDocument.name, 'custom document type', rawDocument.externalUrl))
                .to.be.revertedWith('The document type isn\'t registered');
        });

        it('should emit DocumentRegistered event', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentCounter(sender.address);
            await expect(documentManagerContract.connect(owner).registerDocument(sender.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl))
                .to.emit(documentManagerContract, 'DocumentRegistered')
                .withArgs(documentCounterId.toNumber() + 1, sender.address, transactionId);
        });

        it('should check if document exists', async () => {
            await documentManagerContract.connect(owner).registerDocument(sender.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentCounter(sender.address);
            const exist = await documentManagerContract.connect(sender).documentExists(sender.address, transactionId, documentCounterId.toNumber());
            expect(exist).to.be.true;
        });

        it('should try to retrieve a document - FAIL (DocumentInfo does not exist)', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentCounter(sender.address);
            expect(documentManagerContract.connect(sender).getDocumentInfo(sender.address, transactionId, documentCounterId.toNumber() + 10))
                .to.be.revertedWith('DocumentInfo does not exist');
        });
    });

    describe('getTransactionDocumentIds', () => {
        it('should retrieve saved document ids by owner address and relative transaction id', async () => {
            await documentManagerContract.connect(owner).registerDocument(sender.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            await documentManagerContract.connect(owner).registerDocument(sender.address, transactionId, rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);

            const documentIds = await documentManagerContract.connect(sender).getTransactionDocumentIds(sender.address, transactionId);
            expect(documentIds.length).to.equal(2);

            let savedDocument = await documentManagerContract.connect(sender).getDocumentInfo(sender.address, transactionId, documentIds[0].toNumber());
            expect(savedDocument.id).to.equal(documentIds[0]);
            expect(savedDocument.owner).to.equal(sender.address);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);

            savedDocument = await documentManagerContract.connect(sender).getDocumentInfo(sender.address, transactionId, documentIds[1].toNumber());
            expect(savedDocument.id).to.equal(documentIds[1]);
            expect(savedDocument.owner).to.equal(sender.address);
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
            await documentManagerContract.connect(owner).addOrderManager(orderManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.ORDER_MANAGER_ROLE(), orderManager.address)).to.be.true;
            await documentManagerContract.connect(owner).removeOrderManager(orderManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.ORDER_MANAGER_ROLE(), orderManager.address)).to.be.false;
        });

        it('should fail to add and remove order manager roles if the caller is not an admin', async () => {
            await expect(documentManagerContract.connect(otherAccount).addOrderManager(orderManager.address)).to.be.revertedWith('Caller is not the admin');
            await expect(documentManagerContract.connect(otherAccount).removeOrderManager(orderManager.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
