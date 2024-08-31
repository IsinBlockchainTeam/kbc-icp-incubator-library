/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import chai, { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ContractName } from '../utils/constants';
import { RoleProofStruct } from '../typechain-types/contracts/DelegateManager';

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
        contentHash: 'contentHash'
    };
    const rawDocument2 = {
        externalUrl: 'externalUr2',
        contentHash: 'contentHash2'
    };

    let delegateManagerContractFake: FakeContract;
    const roleProof: RoleProofStruct = {
        signedProof: '0x',
        delegator: '',
        delegateCredentialIdHash: ethers.utils.formatBytes32String('delegateCredentialIdHash'),
        delegateCredentialExpiryDate: 0,
        membershipProof: {
            signedProof: '0x',
            delegatorCredentialIdHash: ethers.utils.formatBytes32String('delegatorCredentialIdHash'),
            delegatorCredentialExpiryDate: 0,
            issuer: ''
        }
    };

    beforeEach(async () => {
        [owner, sender, admin, tradeManager, otherAccount] = await ethers.getSigners();

        roleProof.delegator = admin.address;
        roleProof.membershipProof.issuer = admin.address;
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        const DocumentManager = await ethers.getContractFactory(ContractName.DOCUMENT_MANAGER);
        documentManagerContract = await DocumentManager.deploy(delegateManagerContractFake.address, []);
        await documentManagerContract.deployed();

        await documentManagerContract.connect(owner).addTradeManager(tradeManager.address);
    });

    describe('registerDocument, getDocumentById, getDocumentsCounter', () => {
        it('should register a document (as trade manager contract) and retrieve it', async () => {
            await documentManagerContract
                .connect(tradeManager)
                .registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address);

            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            expect(documentCounterId).to.equal(1);

            const savedDocument = await documentManagerContract.connect(sender).getDocumentById(roleProof, documentCounterId);
            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.externalUrl).to.equal(rawDocument.externalUrl);
            expect(savedDocument.contentHash).to.equal(rawDocument.contentHash);
            expect(savedDocument.uploadedBy).to.equal(sender.address);
        });

        it('should emit DocumentRegistered event', async () => {
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            await expect(
                documentManagerContract.connect(owner).registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address)
            )
                .to.emit(documentManagerContract, 'DocumentRegistered')
                .withArgs(documentCounterId.toNumber() + 1, rawDocument.contentHash);
        });
    });

    describe('updateDocument', () => {
        it('should update a document', async () => {
            await documentManagerContract
                .connect(sender)
                .registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            await documentManagerContract
                .connect(sender)
                .updateDocument(roleProof, documentCounterId, rawDocument2.externalUrl, rawDocument2.contentHash, sender.address);
            const savedDocument = await documentManagerContract.connect(tradeManager).getDocumentById(roleProof, documentCounterId);

            expect(savedDocument.id).to.equal(documentCounterId);
            expect(savedDocument.externalUrl).to.equal(rawDocument2.externalUrl);
            expect(savedDocument.contentHash).to.equal(rawDocument2.contentHash);
            expect(savedDocument.uploadedBy).to.equal(sender.address);
        });

        it('should emit DocumentUpdated event', async () => {
            await documentManagerContract
                .connect(sender)
                .registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            await expect(
                documentManagerContract
                    .connect(sender)
                    .updateDocument(roleProof, documentCounterId, rawDocument.externalUrl, rawDocument.contentHash, sender.address)
            )
                .to.emit(documentManagerContract, 'DocumentUpdated')
                .withArgs(documentCounterId.toNumber(), rawDocument.contentHash);
        });

        it('should update a document - FAIL(DocumentManager: Document does not exist)', async () => {
            await documentManagerContract
                .connect(sender)
                .registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            await expect(
                documentManagerContract
                    .connect(sender)
                    .updateDocument(roleProof, 50, rawDocument2.externalUrl, rawDocument2.contentHash, sender.address)
            ).to.be.revertedWith('DocumentManager: Document does not exist');
        });

        it("should update a document - FAIL(DocumentManager: Can't update the uploader)", async () => {
            await documentManagerContract
                .connect(sender)
                .registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            await expect(
                documentManagerContract
                    .connect(sender)
                    .updateDocument(roleProof, documentCounterId, rawDocument2.externalUrl, rawDocument2.contentHash, otherAccount.address)
            ).to.be.revertedWith("DocumentManager: Can't update the uploader");
        });

        it('should update a document - FAIL(DocumentManager: Caller is not the uploader)', async () => {
            await documentManagerContract
                .connect(sender)
                .registerDocument(roleProof, rawDocument.externalUrl, rawDocument.contentHash, sender.address);
            documentCounterId = await documentManagerContract.connect(sender).getDocumentsCounter(roleProof);
            await expect(
                documentManagerContract
                    .connect(otherAccount)
                    .updateDocument(roleProof, documentCounterId, rawDocument2.externalUrl, rawDocument2.contentHash, sender.address)
            ).to.be.revertedWith('DocumentManager: Caller is not the uploader');
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
            await expect(documentManagerContract.connect(otherAccount).addAdmin(admin.address)).to.be.revertedWith(
                'DocumentManager: Caller is not the admin'
            );
            await expect(documentManagerContract.connect(otherAccount).removeAdmin(admin.address)).to.be.revertedWith(
                'DocumentManager: Caller is not the admin'
            );
        });

        it('should add and remove trade manager roles', async () => {
            await documentManagerContract.connect(owner).addTradeManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.TRADE_MANAGER_ROLE(), tradeManager.address)).to.be.true;
            await documentManagerContract.connect(owner).removeTradeManager(tradeManager.address);
            expect(await documentManagerContract.hasRole(await documentManagerContract.TRADE_MANAGER_ROLE(), tradeManager.address)).to.be.false;
        });

        it('should fail to add and remove trade manager roles if the caller is not an admin', async () => {
            await expect(documentManagerContract.connect(otherAccount).addTradeManager(tradeManager.address)).to.be.revertedWith(
                'DocumentManager: Caller is not the admin'
            );
            await expect(documentManagerContract.connect(otherAccount).removeTradeManager(tradeManager.address)).to.be.revertedWith(
                'DocumentManager: Caller is not the admin'
            );
        });
    });
});
