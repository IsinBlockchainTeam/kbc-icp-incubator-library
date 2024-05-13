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
let owner: SignerWithAddress;
let sender: SignerWithAddress;
let admin: SignerWithAddress;
let otherAccount: SignerWithAddress;
let tradeManager: SignerWithAddress;
let documentCounterId: BigNumber;

describe('DocumentManager', () => {
    const rawDocument = {
        externalUrl: 'externalUrl',
        contentHash: 'contentHash',
    };
    const rawDocument2 = {
        externalUrl: 'externalUr2',
        contentHash: 'contentHash2',
    };

    before(async () => {
        [owner, sender, admin, tradeManager, otherAccount] = await ethers.getSigners();

        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);

        documentManagerContract = await DocumentManager.deploy([]);
        await documentManagerContract.deployed();

        await documentManagerContract.connect(owner).addTradeManager(tradeManager.address);
    });

    describe('registerDocument, getDocumentById, getDocumentsCounter', () => {
        it('should register a document (as trade manager contract) and retrieve it', async () => {
            await documentManagerContract.connect(tradeManager).registerDocument(rawDocument.externalUrl, rawDocument.contentHash);

            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter();
            expect(documentCounterId).to.equal(1);

            const savedDocument = await documentManagerContract.connect(sender).getDocumentById(documentCounterId);
            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);
            expect(savedDocument.contentHash).to.equal(rawDocument.contentHash);
        });

        it('should emit DocumentRegistered event', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter();
            await expect(documentManagerContract.connect(owner).registerDocument(rawDocument.externalUrl, rawDocument.contentHash))
                .to.emit(documentManagerContract, 'DocumentRegistered')
                .withArgs(documentCounterId.toNumber() + 1, rawDocument.contentHash);
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
            await expect(documentManagerContract.connect(otherAccount).addAdmin(admin.address)).to.be.revertedWith('DocumentManager: Caller is not the admin');
            await expect(documentManagerContract.connect(otherAccount).removeAdmin(admin.address)).to.be.revertedWith('DocumentManager: Caller is not the admin');
        });

        it('should add and remove trade manager roles', async () => {
            await documentManagerContract.connect(owner).addTradeManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.TRADE_MANAGER_ROLE(), tradeManager.address)).to.be.true;
            await documentManagerContract.connect(owner).removeTradeManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.TRADE_MANAGER_ROLE(), tradeManager.address)).to.be.false;
        });

        it('should fail to add and remove trade manager roles if the caller is not an admin', async () => {
            await expect(documentManagerContract.connect(otherAccount).addTradeManager(tradeManager.address)).to.be.revertedWith('DocumentManager: Caller is not the admin');
            await expect(documentManagerContract.connect(otherAccount).removeTradeManager(tradeManager.address)).to.be.revertedWith('DocumentManager: Caller is not the admin');
        });
    });
});
