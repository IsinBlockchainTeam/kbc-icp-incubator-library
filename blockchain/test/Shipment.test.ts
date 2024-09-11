/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import chai, {expect} from "chai";
import {Contract} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {FakeContract, smock} from "@defi-wonderland/smock";
import {ContractName} from "../utils/constants";
import {KBCAccessControl} from "../typechain-types/contracts/MaterialManager";

describe('Shipment', () => {
    chai.use(smock.matchers);
    let contract: Contract;
    let library: Contract;
    let admin: SignerWithAddress,
        supplier: SignerWithAddress,
        commissioner: SignerWithAddress;
    let delegateManagerContractFake: FakeContract;
    let documentManagerContractFake: FakeContract;
    let escrowContractFake: FakeContract;
    const externalUrl = 'fakeUrl';
    const price = 10;

    const phase1RequiredDocuments: number[] = [3];
    const phase2RequiredDocuments: number[] = [4, 5];
    const phase3RequiredDocuments: number[] = [6];
    const phase4RequiredDocuments: number[] = [14, 15, 16];
    const phase5RequiredDocuments: number[] = [];

    const roleProof: KBCAccessControl.RoleProofStruct = {
        signedProof: '0x',
        delegator: ''
    };

    beforeEach(async () => {
        [admin, supplier, commissioner] = await ethers.getSigners();

        roleProof.delegator = admin.address;
        delegateManagerContractFake = await smock.fake(ContractName.DELEGATE_MANAGER);
        delegateManagerContractFake.hasValidRole.returns(true);
        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        escrowContractFake = await smock.fake(ContractName.ESCROW);

        const KBCShipmentLibraryFake = await ethers.getContractFactory(ContractName.KBC_SHIPMENT_LIBRARY);
        library = await KBCShipmentLibraryFake.deploy();
        const ShipmentContractFactory = await ethers.getContractFactory(ContractName.SHIPMENT, {
            libraries: {
                KBCShipmentLibrary: library.address
            }
        });
        contract = await ShipmentContractFactory.deploy(
            roleProof,
            delegateManagerContractFake.address,
            supplier.address,
            commissioner.address,
            externalUrl,
            escrowContractFake.address,
            documentManagerContractFake.address,
            true
        );
        await contract.deployed();
    });

    const setDetails = async () => {
        const tx = await contract.connect(supplier).setDetails(
            roleProof,
            0,
            1,
            2,
            'exchange',
            3,
            price,
            4,
            5,
            6,
            7,
        );
        return tx.wait();
    }
    const addDocument = async (documentType: number, extUrl: string, contextHash: string) => {
        const tx = await contract.connect(supplier).addDocument(roleProof, documentType, extUrl, contextHash);
        return tx.wait();
    }
    const approveDocument = async (documentId: number) => {
        const tx = await contract.connect(commissioner).evaluateDocument(roleProof, documentId, 1);
        return tx.wait();
    }
    const approveSample = async () => {
        const tx = await contract.connect(commissioner).evaluateSample(roleProof, 1);
        return tx.wait();
    }
    const approveDetails = async () => {
        const tx = await contract.connect(commissioner).evaluateDetails(roleProof, 1);
        return tx.wait();
    }
    const approveQuality = async () => {
        const tx = await contract.connect(commissioner).evaluateQuality(roleProof, 1);
        return tx.wait();
    }
    const rejectQuality = async () => {
        const tx = await contract.connect(commissioner).evaluateQuality(roleProof, 2);
        return tx.wait();
    }
    const depositFunds = async (amount: number) => {
        const tx = await contract.connect(commissioner).depositFunds(roleProof, amount);
        return tx.wait();
    }

    describe('Phase independent', () => {
        it('should add document', async () => {
            const documentType = 0;
            const extUrl = 'url';
            const contextHash = 'hash';
            documentManagerContractFake.registerDocument.returns(0);
            await addDocument(documentType, extUrl, contextHash);

            expect(await contract.getDocumentsIds(roleProof, 0)).to.deep.equal([0]);

            const document = await contract.getDocumentInfo(roleProof, 0);
            expect(document.id).to.equal(0);
            expect(document.dType).to.equal(0);
            expect(document.status).to.equal(0);
            expect(document.uploader).to.equal(supplier.address);
            expect(document.exists).to.equal(true);
        });
        it('should update document', async () => {
            const documentType = 0;
            const extUrl = 'url';
            const contextHash = 'hash';
            documentManagerContractFake.registerDocument.returns(0);
            await addDocument(documentType, 'extUrl', 'contextHash');

            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(documentType, extUrl, contextHash);

            expect(await contract.getDocumentsIds(roleProof, documentType)).to.deep.equal([1]);

            const document = await contract.getDocumentInfo(roleProof, 1);
            expect(document.id).to.equal(1);
            expect(document.dType).to.equal(0);
            expect(document.status).to.equal(0);
            expect(document.uploader).to.equal(supplier.address);
            expect(document.exists).to.equal(true);
        });
        it('should update document - GENERIC', async () => {
            const documentType = 18;
            const extUrl = 'url';
            const contextHash = 'hash';
            documentManagerContractFake.registerDocument.returns(0);
            await addDocument(documentType, 'extUrl', 'contextHash');

            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(documentType, extUrl, contextHash);

            expect(await contract.getDocumentsIds(roleProof, documentType)).to.deep.equal([0, 1]);

            const document = await contract.getDocumentInfo(roleProof, 0);
            expect(document.id).to.equal(0);
            expect(document.dType).to.equal(18);
            expect(document.status).to.equal(0);
            expect(document.uploader).to.equal(supplier.address);
            expect(document.exists).to.equal(true);
        });
        it('should approve document', async () => {
            const documentType = 0;
            const extUrl = 'url';
            const contextHash = 'hash';
            documentManagerContractFake.registerDocument.returns(0);
            await addDocument(documentType, extUrl, contextHash);

            await approveDocument(0);

            const document = await contract.getDocumentInfo(roleProof, 0);
            expect(document.status).to.equal(1);
        });
        it('should not be able to re-approve document', async () => {
            const documentType = 0;
            const extUrl = 'url';
            const contextHash = 'hash';
            documentManagerContractFake.registerDocument.returns(0);
            await addDocument(documentType, extUrl, contextHash);
            await approveDocument(0);

            await expect(approveDocument(0)).to.be.revertedWith('Shipment: Document already approved');
        });
        it('should retrieve uploadable documents', async () => {
            let documentIds = await contract.getUploadableDocuments(0);
            expect(documentIds).to.deep.equal([0, 1, 2, 3]);
            documentIds = await contract.getUploadableDocuments(1);
            expect(documentIds).to.deep.equal([4, 5]);
            documentIds = await contract.getUploadableDocuments(2);
            expect(documentIds).to.deep.equal([6, 7, 8, 9, 10]);
            documentIds = await contract.getUploadableDocuments(3);
            expect(documentIds).to.deep.equal([11, 12, 13, 14, 15, 16, 17]);
            documentIds = await contract.getUploadableDocuments(4);
            expect(documentIds).to.deep.equal([]);
        });
        it('should retrieve required documents', async () => {
            let documentIds = await contract.getRequiredDocuments(0);
            expect(documentIds).to.deep.equal([3]);
            documentIds = await contract.getRequiredDocuments(1);
            expect(documentIds).to.deep.equal([4, 5]);
            documentIds = await contract.getRequiredDocuments(2);
            expect(documentIds).to.deep.equal([6]);
            documentIds = await contract.getRequiredDocuments(3);
            expect(documentIds).to.deep.equal([14, 15, 16]);
            documentIds = await contract.getRequiredDocuments(4);
            expect(documentIds).to.deep.equal([]);
        });
    });
    describe('PHASE_1', () => {
        it('should be in the PHASE_1', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(0);
        });
        it('should get initial shipment information', async () => {
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.supplier).to.equal(supplier.address);
            expect(shipment.commissioner).to.equal(commissioner.address);
            expect(shipment.externalUrl).to.equal(externalUrl);
            expect(shipment.escrow).to.equal(escrowContractFake.address);
            expect(shipment.documentManager).to.equal(documentManagerContractFake.address);
            expect(shipment.sampleEvaluationStatus).to.equal(0);
            expect(shipment.detailsEvaluationStatus).to.equal(0);
            expect(shipment.qualityEvaluationStatus).to.equal(0);
            expect(shipment.fundsStatus).to.equal(0);
            expect(shipment.detailsSet).to.equal(false);
            expect(shipment.shipmentNumber).to.equal(0);
            expect(shipment.expirationDate).to.equal(0);
            expect(shipment.fixingDate).to.equal(0);
            expect(shipment.differentialApplied).to.equal(0);
            expect(shipment.price).to.equal(0);
            expect(shipment.quantity).to.equal(0);
            expect(shipment.containersNumber).to.equal(0);
            expect(shipment.netWeight).to.equal(0);
            expect(shipment.grossWeight).to.equal(0);
        });
        it('should be able to approve sample', async () => {
            await approveSample();
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.sampleEvaluationStatus).to.equal(1);
        });
        it('should not be able to re-approve sample', async () => {
            await approveSample();
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(0);
            await expect(approveSample()).to.be.revertedWith('Shipment: Sample already approved');
        });
        it('should not be able to evaluate details', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to evaluate quality', async () => {
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to deposit funds', async () => {
            await expect(depositFunds(10)).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
    });
    describe('PHASE_2', () => {
        beforeEach(async () => {
            const documentIds = [];
            let count = 0;
            for(const documentType of phase1RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveSample();
        });
        it('should be in the PHASE_2', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(1);
        });
        it('should not be able to re-approve sample', async () => {
            await expect(approveSample()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should be able to set details', async () => {
            await setDetails();
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.detailsSet).to.equal(true);
        });
        it('should be able to approve details', async () => {
            await setDetails();
            await approveDetails();
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.detailsEvaluationStatus).to.equal(1);
        });
        it('should not be able to approve details if details are not set', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Details not set');
        });
        it('should not be able to re-approve details', async () => {
            await setDetails();
            await approveDetails();
            await expect(approveDetails()).to.be.revertedWith('Shipment: Details already approved');
        });
        it('should not be able to evaluate quality', async () => {
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to deposit funds', async () => {
            await expect(depositFunds(10)).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
    });
    describe('PHASE_3', () => {
        beforeEach(async () => {
            const documentIds = [];
            let count = 0;
            for(const documentType of phase1RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase2RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveSample();
            await setDetails();
            await approveDetails();
        });
        it('should be in the PHASE_3', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(2);
        });
        it('should not be able to re-approve sample', async () => {
            await expect(approveSample()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve details', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to evaluate quality', async () => {
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should be able to deposit funds', async () => {
            escrowContractFake.getLockedAmount.returns(0);
            await depositFunds(5);
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.fundsStatus).to.equal(0);
        });
        it('should lock funds if they are enough', async () => {
            escrowContractFake.getLockedAmount.returns(0);
            escrowContractFake.getTotalDepositedAmount.returns(10);
            await depositFunds(10);
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.fundsStatus).to.equal(1);
        });
    });
    describe('PHASE_4', () => {
        beforeEach(async () => {
            const documentIds = [];
            let count = 0;
            for(const documentType of phase1RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase2RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase3RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveSample();
            await setDetails();
            await approveDetails();
            escrowContractFake.getLockedAmount.returns(0);
            escrowContractFake.getTotalDepositedAmount.returns(10);
            await depositFunds(10);
        });
        it('should be in the PHASE_4', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(3);
        });
        it('should not be able to re-approve sample', async () => {
            await expect(approveSample()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve details', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to evaluate quality', async () => {
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to deposit funds', async () => {
            await expect(depositFunds(10)).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not have released funds', async () => {
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.fundsStatus).to.equal(1);
            expect(escrowContractFake.releaseFunds).to.have.callCount(0);
        });
    });
    describe('PHASE_5', () => {
        beforeEach(async () => {
            let documentIds = [];
            let count = 0;
            for(const documentType of phase1RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase2RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase3RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveSample();
            await setDetails();
            await approveDetails();
            escrowContractFake.getLockedAmount.returns(0);
            escrowContractFake.getTotalDepositedAmount.returns(10);
            await depositFunds(10);
            documentIds = [];
            for(const documentType of phase4RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
        });
        it('should be in the PHASE_5', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(4);
        });
        it('should have released funds', async () => {
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.fundsStatus).to.equal(2);
            expect(escrowContractFake.releaseFunds).to.have.callCount(1);
        });
        it('should not be able to re-approve sample', async () => {
            await expect(approveSample()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve details', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should be able to evaluate quality', async () => {
            await approveQuality();
            const shipment = await contract.getShipment(roleProof);
            expect(shipment.qualityEvaluationStatus).to.equal(1);
        });
        it('should not be able to re-approve quality', async () => {
            await approveQuality();
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to deposit funds', async () => {
            await expect(depositFunds(10)).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
    });
    describe('PHASE_6', () => {
        beforeEach(async () => {
            let documentIds = [];
            let count = 0;
            for(const documentType of phase1RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase2RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase3RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveSample();
            await setDetails();
            await approveDetails();
            escrowContractFake.getLockedAmount.returns(0);
            escrowContractFake.getTotalDepositedAmount.returns(10);
            await depositFunds(10);
            documentIds = [];
            for(const documentType of phase4RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase5RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveQuality();
        });
        it('should be in the PHASE_6', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(5);
        });
        it('should not be able to re-approve sample', async () => {
            await expect(approveSample()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve details', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve quality', async () => {
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to deposit funds', async () => {
            await expect(depositFunds(10)).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
    });
    describe('PHASE_7', () => {
        beforeEach(async () => {
            let documentIds = [];
            let count = 0;
            for(const documentType of phase1RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase2RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase3RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await approveSample();
            await setDetails();
            await approveDetails();
            escrowContractFake.getLockedAmount.returns(0);
            escrowContractFake.getTotalDepositedAmount.returns(10);
            await depositFunds(10);
            documentIds = [];
            for(const documentType of phase4RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentType of phase5RequiredDocuments) {
                documentManagerContractFake.registerDocument.returns(count++);
                await addDocument(documentType, 'url', 'hash');
                documentIds.push(...await contract.getDocumentsIds(roleProof, documentType));
            }
            for(const documentId of documentIds) {
                await approveDocument(documentId);
            }
            await rejectQuality();
        });
        it('should be in the PHASE_6', async () => {
            const phase = await contract.getPhase(roleProof);
            expect(phase).to.equal(6);
        });
        it('should not be able to re-approve sample', async () => {
            await expect(approveSample()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve details', async () => {
            await expect(approveDetails()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to re-approve quality', async () => {
            await expect(approveQuality()).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
        it('should not be able to deposit funds', async () => {
            await expect(depositFunds(10)).to.be.revertedWith('Shipment: Shipment in wrong phase');
        });
    });
});
