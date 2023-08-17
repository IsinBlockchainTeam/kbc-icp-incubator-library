/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';

let documentManagerContract: Contract;
let enumerableDocumentTypeManagerContract: Contract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let otherAccount: SignerWithAddress;
let documentCounterId: BigNumber;

describe('DocumentManager', () => {
    const rawDocument = {
        name: 'Document name',
        documentType: 'documentType1',
        externalUrl: 'externalUrl',
    };
    const rawDocument2 = {
        name: 'Document name2',
        documentType: 'documentType2',
        externalUrl: 'externalUr2',
    };
    const transactionId = 2;

    beforeEach(async () => {
        [owner, admin, otherAccount] = await ethers.getSigners();

        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);
        const EnumerableDocumentTypeManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);

        enumerableDocumentTypeManagerContract = await EnumerableDocumentTypeManager.deploy();
        await enumerableDocumentTypeManagerContract.deployed();
        await enumerableDocumentTypeManagerContract.add('documentType1');
        await enumerableDocumentTypeManagerContract.add('documentType2');

        documentManagerContract = await DocumentManager.deploy([admin.address], enumerableDocumentTypeManagerContract.address);
        await documentManagerContract.deployed();
    });

    describe('registerDocument', () => {
        it('should register a document', async () => {
            await documentManagerContract.connect(owner).registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            documentCounterId = await documentManagerContract.connect(owner).getDocumentCounter(owner.address);

            const savedDocument = await documentManagerContract.connect(owner).getDocumentInfo(owner.address, transactionId, documentCounterId.toNumber());
            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.owner).to.equal(owner.address);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);
        });

        it('should register a document - FAIL (Sender is not the owner of the document)', async () => {
            await expect(documentManagerContract.connect(otherAccount).registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl))
                .to.be.revertedWith('Sender is not the owner of the document');
        });

        it('should register a document - FAIL (The document type isn\'t registered)', async () => {
            await expect(documentManagerContract.connect(owner).registerDocument(owner.address, transactionId, rawDocument.name, 'custom document type', rawDocument.externalUrl))
                .to.be.revertedWith('The document type isn\'t registered');
        });

        it('should emit DocumentRegistered event', async () => {
            documentCounterId = await documentManagerContract.connect(owner).getDocumentCounter(owner.address);
            await expect(documentManagerContract.connect(owner).registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl))
                .to.emit(documentManagerContract, 'DocumentRegistered')
                .withArgs(documentCounterId.toNumber() + 1, owner.address, transactionId);
        });

        it('should check if document exists', async () => {
            await documentManagerContract.connect(owner).registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            documentCounterId = await documentManagerContract.connect(owner).getDocumentCounter(owner.address);
            const exist = await documentManagerContract.connect(owner).documentExists(owner.address, transactionId, documentCounterId.toNumber());
            expect(exist).to.be.true;
        });

        it('should try to retrieve a document - FAIL (Document does not exist)', async () => {
            documentCounterId = await documentManagerContract.connect(owner).getDocumentCounter(owner.address);
            expect(documentManagerContract.connect(owner).getDocumentInfo(owner.address, transactionId, documentCounterId.toNumber() + 10))
                .to.be.revertedWith('Document does not exist');
        });
    });

    describe('getTransactionDocumentIds', () => {
        it('should retrieve saved document ids by owner address and relative transaction id', async () => {
            await documentManagerContract.connect(owner).registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            await documentManagerContract.connect(owner).registerDocument(owner.address, transactionId, rawDocument2.name, rawDocument2.documentType, rawDocument2.externalUrl);

            const documentIds = await documentManagerContract.connect(owner).getTransactionDocumentIds(owner.address, transactionId);
            expect(documentIds.length).to.equal(2);

            let savedDocument = await documentManagerContract.connect(owner).getDocumentInfo(owner.address, transactionId, documentIds[0].toNumber());
            expect(savedDocument.id).to.equal(documentIds[0]);
            expect(savedDocument.owner).to.equal(owner.address);
            expect(savedDocument.transactionId).to.equal(transactionId);
            expect(savedDocument.name).to.equal(rawDocument.name);
            expect(savedDocument.documentType).to.equal(rawDocument.documentType);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);

            savedDocument = await documentManagerContract.connect(owner).getDocumentInfo(owner.address, transactionId, documentIds[1].toNumber());
            expect(savedDocument.id).to.equal(documentIds[1]);
            expect(savedDocument.owner).to.equal(owner.address);
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
    });
});
