/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import chai, {expect} from "chai";
import {Contract, Event} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {FakeContract, smock} from "@defi-wonderland/smock";
import {ContractName} from "../utils/constants";

describe('Shipment Manager', () => {
    chai.use(smock.matchers);
    let contract: Contract;
    let supplier: SignerWithAddress,
        commissioner: SignerWithAddress;
    let documentManagerContractFake: FakeContract;
    let escrowFakeContract: FakeContract;
    const orderQuantity = 100;
    const orderPrice = 1000;

    beforeEach(async () => {
        [supplier, commissioner] = await ethers.getSigners();

        documentManagerContractFake = await smock.fake(ContractName.DOCUMENT_MANAGER);
        escrowFakeContract = await smock.fake(ContractName.ESCROW);

        const ShipmentManagerContractFactory = await ethers.getContractFactory(ContractName.SHIPMENT_MANAGER);
        contract = await ShipmentManagerContractFactory.deploy(
            supplier.address,
            commissioner.address,
            orderQuantity,
            orderPrice,
            documentManagerContractFake.address,
            escrowFakeContract.address
        );
        await contract.deployed();
    });

    const addShipment = async (date: number, quantity: number, weight: number) => {
        const tx = await contract.connect(supplier).addShipment(date, quantity, weight);
        return tx.wait();
    }
    const addDocument = async (shipmentId: number, documentType: number, externalUrl: string, contextHash: string) => {
        const tx = await contract.connect(supplier).addDocument(shipmentId, documentType, externalUrl, contextHash);
        return tx.wait();
    }
    const approveDocument = async (shipmentId: number, documentId: number) => {
        const tx = await contract.connect(commissioner).approveDocument(shipmentId, documentId);
        return tx.wait();
    }

    describe('Getters', () => {
        it('should get shipment count', async () => {
            expect(await contract.getShipmentCounter()).to.equal(0);
            await addShipment(1, 1, 1);
            expect(await contract.getShipmentCounter()).to.equal(1);
        });
        it('should get shipment by id', async () => {
            await addShipment(1, 2, 3);
            const [id, date, quantity, weight] = await contract.getShipment(1);
            expect(id).to.equal(1);
            expect(date).to.equal(1);
            expect(quantity).to.equal(2);
            expect(weight).to.equal(3);

            await expect(contract.getShipment(2)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
        });
        it('should get documents ids', async () => {
            documentManagerContractFake.registerDocument.returns(123);
            await addShipment(1, 2, 3);
            await addDocument(1, 1, 'url', 'hash');
            const documentsIds = await contract.getDocumentsIds(1);
            expect(documentsIds).to.have.length(1);
            expect(documentsIds[0]).to.equal(123);

            await expect(contract.getDocumentsIds(2)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
        });
        it('should get document info', async () => {
            documentManagerContractFake.registerDocument.returns(123);
            await addShipment(1, 2, 3);
            await addDocument(1, 1, 'url', 'hash');
            const documentInfo = await contract.getDocumentInfo(1, 123);
            expect(documentInfo.id).to.equal(123);
            expect(documentInfo.dType).to.equal(1);
            expect(documentInfo.status).to.equal(0);
            expect(documentInfo.uploader).to.equal(supplier.address);
            expect(documentInfo.exists).to.equal(true);

            await expect(contract.getDocumentsIds(2)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.getDocumentInfo(1, 124)).to.be.revertedWith('ShipmentManager: Document does not exist');
        });
        it('should get documents ids by document type', async () => {
            await addShipment(1, 2, 3);
            documentManagerContractFake.registerDocument.returns(12);
            await addDocument(1, 1, 'url', 'hash');
            documentManagerContractFake.registerDocument.returns(34);
            await addDocument(1, 1, 'url', 'hash');
            documentManagerContractFake.registerDocument.returns(56);
            await addDocument(1, 2, 'url', 'hash');
            documentManagerContractFake.registerDocument.returns(78);
            await addDocument(1, 2, 'url', 'hash');
            let documentsIds = await contract.getDocumentsIdsByType(1, 1);
            expect(documentsIds).to.have.length(2);
            expect(documentsIds[0]).to.equal(12);
            expect(documentsIds[1]).to.equal(34);
            documentsIds = await contract.getDocumentsIdsByType(1, 2);
            expect(documentsIds).to.have.length(2);
            expect(documentsIds[0]).to.equal(56);
            expect(documentsIds[1]).to.equal(78);

            await expect(contract.getDocumentsIdsByType(2, 1)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
        });
        it('should get shipment status - ShipmentStatus.SHIPPING', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(0);
            expect(await contract.getShipmentStatus(1)).to.equal(0);

            await expect(contract.getShipmentStatus(2)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
        });
        it('should get shipment status - ShipmentStatus.TRANSPORTATION', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(1);
            escrowFakeContract.getTotalDepositedAmount.returns(20);
            expect(await contract.getShipmentStatus(1)).to.equal(1);

            escrowFakeContract.getTotalDepositedAmount.returns(19);
            expect(await contract.getShipmentStatus(1)).to.equal(0);
        });
        it('should get shipment status - ShipmentStatus.ONBOARDED', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(1);
            escrowFakeContract.getTotalDepositedAmount.returns(20);
            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(1, 0, 'url', 'hash');
            await approveDocument(1, 1);
            documentManagerContractFake.registerDocument.returns(2);
            await addDocument(1, 1, 'url', 'hash');
            await approveDocument(1, 2);
            documentManagerContractFake.registerDocument.returns(3);
            await addDocument(1, 2, 'url', 'hash');
            await approveDocument(1, 3);
            documentManagerContractFake.registerDocument.returns(4);
            await addDocument(1, 3, 'url', 'hash');
            await approveDocument(1, 4);
            expect(await contract.getShipmentStatus(1)).to.equal(2);
        });
        it('should get shipment status - ShipmentStatus.ARBITRATION', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(1);
            escrowFakeContract.getTotalDepositedAmount.returns(20);
            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(1, 0, 'url', 'hash');
            await approveDocument(1, 1);
            documentManagerContractFake.registerDocument.returns(2);
            await addDocument(1, 1, 'url', 'hash');
            await approveDocument(1, 2);
            documentManagerContractFake.registerDocument.returns(3);
            await addDocument(1, 2, 'url', 'hash');
            await approveDocument(1, 3);
            documentManagerContractFake.registerDocument.returns(4);
            await addDocument(1, 3, 'url', 'hash');
            await approveDocument(1, 4);

            await contract.connect(commissioner).startShipmentArbitration(1);
            expect(await contract.getShipmentStatus(1)).to.equal(3);
        });
        it('should get shipment status - ShipmentStatus.CONFIRMED', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(1);
            escrowFakeContract.getTotalDepositedAmount.returns(20);
            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(1, 0, 'url', 'hash');
            await approveDocument(1, 1);
            documentManagerContractFake.registerDocument.returns(2);
            await addDocument(1, 1, 'url', 'hash');
            await approveDocument(1, 2);
            documentManagerContractFake.registerDocument.returns(3);
            await addDocument(1, 2, 'url', 'hash');
            await approveDocument(1, 3);
            documentManagerContractFake.registerDocument.returns(4);
            await addDocument(1, 3, 'url', 'hash');
            await approveDocument(1, 4);

            await contract.connect(commissioner).confirmShipment(1);
            expect(await contract.getShipmentStatus(1)).to.equal(4);
        });
    });
    describe('Functions', () => {
        it('should add shipment', async () => {
            const receipt = await addShipment(1, 2, 3);
            expect(await contract.getShipmentCounter()).to.equal(1);
            expect(receipt.events.find((event: Event) => event.event === 'ShipmentAdded').args[0]).to.equal(1);

            await expect(contract.connect(commissioner).addShipment(1, 2, 3)).to.be.revertedWith('ShipmentManager: Caller is not the supplier');
        });
        it('should confirm shipment', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(1);
            escrowFakeContract.getTotalDepositedAmount.returns(20);
            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(1, 0, 'url', 'hash');
            await approveDocument(1, 1);
            documentManagerContractFake.registerDocument.returns(2);
            await addDocument(1, 1, 'url', 'hash');
            await approveDocument(1, 2);
            documentManagerContractFake.registerDocument.returns(3);
            await addDocument(1, 2, 'url', 'hash');
            await approveDocument(1, 3);
            documentManagerContractFake.registerDocument.returns(4);
            await addDocument(1, 3, 'url', 'hash');
            await approveDocument(1, 4);
            const tx = await contract.connect(commissioner).confirmShipment(1);
            const receipt = await tx.wait();
            expect(await contract.getShipmentStatus(1)).to.equal(4);
            expect(receipt.events.find((event: Event) => event.event === 'ShipmentConfirmed').args[0]).to.equal(1);
        });
        it('should not confirm shipment if conditions are not met', async () => {
            await addShipment(1, 2, 3);
            await expect(contract.connect(commissioner).confirmShipment(2)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.connect(commissioner).confirmShipment(1)).to.be.revertedWith('ShipmentManager: Shipment is not onboarded');
            await expect(contract.connect(supplier).confirmShipment(1)).to.be.revertedWith('ShipmentManager: Caller is not the commissioner');
        });
        it('should start shipment arbitration', async () => {
            await addShipment(1, 2, 3);
            escrowFakeContract.getState.returns(1);
            escrowFakeContract.getTotalDepositedAmount.returns(20);
            documentManagerContractFake.registerDocument.returns(1);
            await addDocument(1, 0, 'url', 'hash');
            await approveDocument(1, 1);
            documentManagerContractFake.registerDocument.returns(2);
            await addDocument(1, 1, 'url', 'hash');
            await approveDocument(1, 2);
            documentManagerContractFake.registerDocument.returns(3);
            await addDocument(1, 2, 'url', 'hash');
            await approveDocument(1, 3);
            documentManagerContractFake.registerDocument.returns(4);
            await addDocument(1, 3, 'url', 'hash');
            await approveDocument(1, 4);
            const tx = await contract.connect(commissioner).startShipmentArbitration(1);
            const receipt = await tx.wait();
            expect(await contract.getShipmentStatus(1)).to.equal(3);
            expect(receipt.events.find((event: Event) => event.event === 'ShipmentArbitrationStarted').args[0]).to.equal(1);
        });
        it('should not start shipment arbitration if conditions are not met', async () => {
            await addShipment(1, 2, 3);
            await expect(contract.connect(commissioner).startShipmentArbitration(2)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.connect(commissioner).startShipmentArbitration(1)).to.be.revertedWith('ShipmentManager: Shipment is not onboarded');
            await expect(contract.connect(supplier).startShipmentArbitration(1)).to.be.revertedWith('ShipmentManager: Caller is not the commissioner');

        });
        it('should add document', async () => {
            await addShipment(1, 2, 3);
            documentManagerContractFake.registerDocument.returns(123);
            const receipt = await addDocument(1, 1, 'url', 'hash');
            expect(receipt.events.find((event: Event) => event.event === 'DocumentAdded').args[0]).to.equal(1);

            await expect(contract.connect(supplier).addDocument(2, 1, 'url', 'hash')).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.connect(commissioner).addDocument(1, 1, 'url', 'hash')).to.be.revertedWith('ShipmentManager: Caller is not the supplier');
        });
        it('should update document', async () => {
            await addShipment(1, 2, 3);
            documentManagerContractFake.registerDocument.returns(123);
            await addDocument(1, 1, 'url', 'hash');
            documentManagerContractFake.updateDocument.returns(123);
            const tx = await contract.connect(supplier).updateDocument(1, 123, 'url', 'hash');
            const receipt = await tx.wait();
            expect(receipt.events.find((event: Event) => event.event === 'DocumentUpdated').args[0]).to.equal(1);

            await expect(contract.connect(supplier).updateDocument(2, 1, 'url', 'hash')).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.connect(supplier).updateDocument(1, 1, 'url', 'hash')).to.be.revertedWith('ShipmentManager: Document does not exist');
            await expect(contract.connect(commissioner).updateDocument(1, 1, 'url', 'hash')).to.be.revertedWith('ShipmentManager: Caller is not the supplier');
            await expect(contract.connect(commissioner).updateDocument(1, 2, 'url', 'hash')).to.be.revertedWith('ShipmentManager: Caller is not the supplier');
        });
        it('should approve document', async () => {
            await addShipment(1, 2, 3);
            documentManagerContractFake.registerDocument.returns(123);
            await addDocument(1, 1, 'url', 'hash');
            const receipt = await approveDocument(1, 123);
            expect(receipt.events.find((event: Event) => event.event === 'DocumentApproved').args[0]).to.equal(1);

            await expect(contract.connect(commissioner).approveDocument(2, 123)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.connect(commissioner).approveDocument(1, 1)).to.be.revertedWith('ShipmentManager: Document does not exist');
            await expect(contract.connect(supplier).approveDocument(1, 123)).to.be.revertedWith('ShipmentManager: Caller is not the commissioner');
        });
        it('should reject document', async () => {
            await addShipment(1, 2, 3);
            documentManagerContractFake.registerDocument.returns(123);
            await addDocument(1, 1, 'url', 'hash');
            const tx = await contract.connect(commissioner).rejectDocument(1, 123);
            const receipt = await tx.wait();
            expect(receipt.events.find((event: Event) => event.event === 'DocumentRejected').args[0]).to.equal(1);

            await expect(contract.connect(commissioner).rejectDocument(2, 123)).to.be.revertedWith('ShipmentManager: Shipment does not exist');
            await expect(contract.connect(commissioner).rejectDocument(1, 1)).to.be.revertedWith('ShipmentManager: Document does not exist');
            await expect(contract.connect(supplier).rejectDocument(1, 123)).to.be.revertedWith('ShipmentManager: Caller is not the commissioner');
        });
    });
});
