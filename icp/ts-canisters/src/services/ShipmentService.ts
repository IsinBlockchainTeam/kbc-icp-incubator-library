import { StableBTreeMap } from 'azle';
import { ic } from 'azle/experimental';
import {
    FundStatusEnum,
    Phase,
    PhaseEnum,
    Shipment,
    EvaluationStatus,
    EvaluationStatusEnum,
    DocumentInfo,
    DocumentType,
    DocumentTypeEnum
} from '../models/types';
import { validateAddress } from '../utils/validation';
import { ethCallContract, ethSendContractTransaction, getAddress } from '../utils/rpc';
import escrowManagerAbi from '../../eth-abi/EscrowManager.json';
import escrowAbi from '../../eth-abi/Escrow.json';
import { StableMemoryId } from '../utils/stableMemory';
import AuthenticationService from './AuthenticationService';
import { ShipmentDownPaymentAddressNotFound } from '../models/errors';
import { Evm } from '../constants/evm';
import { HasInterestedParties } from './interfaces/HasInterestedParties';
import { ZeroAddress } from 'ethers';

class ShipmentService implements HasInterestedParties {
    private static _instance: ShipmentService;

    private _shipments = StableBTreeMap<bigint, Shipment>(StableMemoryId.SHIPMENTS);

    private constructor() {}
    static get instance() {
        if (!ShipmentService._instance) {
            ShipmentService._instance = new ShipmentService();
        }
        return ShipmentService._instance;
    }

    getInterestedParties(entityId: bigint): string[] {
        const result = this.getShipment(entityId);
        return [result.supplier, result.commissioner];
    }

    getSupplier(entityId: bigint): string {
        return this.getShipment(entityId).supplier;
    }

    getCommissioner(entityId: bigint): string {
        return this.getShipment(entityId).commissioner;
    }

    getShipments(): Shipment[] {
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        return this._shipments.values().filter((shipment) => {
            const interestedParties = [shipment.supplier, shipment.commissioner];
            return interestedParties.includes(delegatorAddress);
        });
    }

    getShipment(id: bigint): Shipment {
        const result = this._shipments.get(id);
        if (!result) {
            throw new Error('Shipment not found');
        }
        return result;
    }

    async createShipment(
        supplier: string,
        commissioner: string,
        sampleApprovalRequired: boolean,
        duration: bigint,
        tokenAddress: string
    ): Promise<Shipment> {
        if (supplier === commissioner) throw new Error('Supplier and commissioner must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Commissioner', commissioner);

        const id = BigInt(this._shipments.keys().length);
        const shipment: Shipment = {
            id,
            supplier,
            commissioner,
            escrowAddress: [],
            sampleEvaluationStatus: { NOT_EVALUATED: null },
            detailsEvaluationStatus: { NOT_EVALUATED: null },
            qualityEvaluationStatus: { NOT_EVALUATED: null },
            fundsStatus: { NOT_LOCKED: null },
            detailsSet: false,
            sampleApprovalRequired,
            shipmentNumber: 0n,
            expirationDate: 0n,
            fixingDate: 0n,
            targetExchange: '',
            differentialApplied: 0n,
            price: 0n,
            quantity: 0n,
            containersNumber: 0n,
            netWeight: 0n,
            grossWeight: 0n,
            documents: []
        };

        const escrowManagerAddress: string = Evm.ESCROW_MANAGER_ADDRESS;
        await ethSendContractTransaction(escrowManagerAddress, escrowManagerAbi.abi, 'registerEscrow', [
            shipment.id,
            supplier,
            duration,
            tokenAddress
        ]);

        this._shipments.insert(BigInt(id), shipment);
        return shipment;
    }

    getShipmentPhase(id: bigint): Phase {
        const shipment = this.getShipment(id);
        if (!this.areDocumentsUploadedAndApproved(id, this.getPhase1RequiredDocuments())) return { PHASE_1: null };
        if (shipment.sampleApprovalRequired && !(EvaluationStatusEnum.APPROVED in shipment.sampleEvaluationStatus)) return { PHASE_1: null };

        if (!this.areDocumentsUploadedAndApproved(id, this.getPhase2RequiredDocuments())) return { PHASE_2: null };
        if (!(EvaluationStatusEnum.APPROVED in shipment.detailsEvaluationStatus)) return { PHASE_2: null };

        if (!this.areDocumentsUploadedAndApproved(id, this.getPhase3RequiredDocuments())) return { PHASE_3: null };
        if (FundStatusEnum.NOT_LOCKED in shipment.fundsStatus) return { PHASE_3: null };

        if (!this.areDocumentsUploadedAndApproved(id, this.getPhase4RequiredDocuments())) return { PHASE_4: null };

        if (!this.areDocumentsUploadedAndApproved(id, this.getPhase5RequiredDocuments())) return { PHASE_5: null };
        if (EvaluationStatusEnum.NOT_EVALUATED in shipment.qualityEvaluationStatus) return { PHASE_5: null };

        if (EvaluationStatusEnum.APPROVED in shipment.qualityEvaluationStatus) return { CONFIRMED: null };

        return { ARBITRATION: null };
    }

    private areDocumentsUploadedAndApproved(id: bigint, requiredDocuments: DocumentType[]): boolean {
        for (const documentType of requiredDocuments) {
            const document = this.getDocumentsByType(id, documentType);
            if (document.length === 0 || !(EvaluationStatusEnum.APPROVED in document[0].evaluationStatus)) return false;
        }
        return true;
    }

    getDocumentsByType(id: bigint, documentType: DocumentType): DocumentInfo[] {
        const shipment = this.getShipment(id);
        const documentInfos = shipment.documents.find(([type]) => Object.keys(documentType)[0] in type);
        return documentInfos ? documentInfos[1] : [];
    }

    setShipmentDetails(
        id: bigint,
        shipmentNumber: bigint,
        expirationDate: bigint,
        fixingDate: bigint,
        targetExchange: string,
        differentialApplied: bigint,
        price: bigint,
        quantity: bigint,
        containersNumber: bigint,
        netWeight: bigint,
        grossWeight: bigint
    ): Shipment {
        const shipment = this.getShipment(id);
        if (!(PhaseEnum.PHASE_2 in this.getShipmentPhase(id))) throw new Error('Shipment in wrong phase');
        if (EvaluationStatusEnum.APPROVED in shipment.detailsEvaluationStatus) throw new Error('Details already approved');

        shipment.shipmentNumber = shipmentNumber;
        shipment.expirationDate = expirationDate;
        shipment.fixingDate = fixingDate;
        shipment.targetExchange = targetExchange;
        shipment.differentialApplied = differentialApplied;
        shipment.price = price;
        shipment.quantity = quantity;
        shipment.containersNumber = containersNumber;
        shipment.netWeight = netWeight;
        shipment.grossWeight = grossWeight;
        shipment.detailsSet = true;

        this._shipments.insert(id, shipment);
        return shipment;
    }

    evaluateSample(id: bigint, evaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.getShipment(id);
        if (!(PhaseEnum.PHASE_1 in this.getShipmentPhase(id))) throw new Error('Shipment in wrong phase');

        if (EvaluationStatusEnum.APPROVED in shipment.sampleEvaluationStatus) throw new Error('Sample already approved');
        shipment.sampleEvaluationStatus = evaluationStatus;

        this._shipments.insert(id, shipment);
        return shipment;
    }

    evaluateShipmentDetails(id: bigint, evaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.getShipment(id);
        if (!(PhaseEnum.PHASE_2 in this.getShipmentPhase(id))) throw new Error('Shipment in wrong phase');
        if (!shipment.detailsSet) throw new Error('Details not set');
        if (EvaluationStatusEnum.APPROVED in shipment.detailsEvaluationStatus) throw new Error('Details already approved');
        shipment.detailsEvaluationStatus = evaluationStatus;

        this._shipments.insert(id, shipment);
        return shipment;
    }

    evaluateQuality(id: bigint, evaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.getShipment(id);
        if (!(PhaseEnum.PHASE_5 in this.getShipmentPhase(id))) throw new Error('Shipment in wrong phase');
        if (EvaluationStatusEnum.APPROVED in shipment.qualityEvaluationStatus) throw new Error('Quality already approved');
        shipment.qualityEvaluationStatus = evaluationStatus;

        this._shipments.insert(id, shipment);
        return shipment;
    }

    async determineEscrowAddress(id: bigint): Promise<Shipment> {
        const shipment = this.getShipment(id);

        if (shipment.escrowAddress.length > 0) throw new ShipmentDownPaymentAddressNotFound();

        const escrowManagerAddress: string = Evm.ESCROW_MANAGER_ADDRESS;
        const escrowAddress = await ethCallContract(escrowManagerAddress, escrowManagerAbi.abi, 'getEscrowByShipmentId', [shipment.id]);

        if (escrowAddress === ZeroAddress) throw new Error('Unable to determine escrow address');
        shipment.escrowAddress = [escrowAddress];

        this._shipments.insert(id, shipment);
        return shipment;
    }

    async depositFunds(id: bigint, amount: bigint): Promise<Shipment> {
        const shipment = this.getShipment(id);
        if (!(PhaseEnum.PHASE_3 in this.getShipmentPhase(id))) throw new Error('Shipment in wrong phase');
        if (!(FundStatusEnum.NOT_LOCKED in shipment.fundsStatus)) throw new Error('Funds already locked');

        if (shipment.escrowAddress.length === 0) {
            const escrowManagerAddress: string = Evm.ESCROW_MANAGER_ADDRESS;
            const escrowAddress = await ethCallContract(escrowManagerAddress, escrowManagerAbi.abi, 'getEscrowByShipmentId', [shipment.id]);
            shipment.escrowAddress = [escrowAddress];
        }

        const callerAddress = await getAddress(ic.caller());
        console.log('callerAddress', callerAddress);
        const escrowAddress = shipment.escrowAddress[0];
        console.log('escrowAddress', escrowAddress);

        await ethSendContractTransaction(escrowAddress, escrowAbi.abi, 'deposit', [amount, callerAddress]);

        this._shipments.insert(id, shipment);
        return shipment;
    }

    async lockFunds(id: bigint): Promise<Shipment> {
        const shipment = this.getShipment(id);
        if (!(PhaseEnum.PHASE_3 in this.getShipmentPhase(id))) throw new Error('Shipment in wrong phase');
        if (!(FundStatusEnum.NOT_LOCKED in shipment.fundsStatus)) throw new Error('Funds already locked');

        if (shipment.escrowAddress.length === 0) {
            const escrowManagerAddress: string = Evm.ESCROW_MANAGER_ADDRESS;
            const escrowAddress = await ethCallContract(escrowManagerAddress, escrowManagerAbi.abi, 'getEscrowByShipmentId', [shipment.id]);
            shipment.escrowAddress = [escrowAddress];
        }

        const escrowAddress = shipment.escrowAddress[0];
        const totalLockedFunds = await ethCallContract(escrowAddress, escrowAbi.abi, 'getLockedAmount', []);
        const requiredAmount = shipment.price;
        const totalDepositedAmount = await ethCallContract(escrowAddress, escrowAbi.abi, 'getTotalDepositedAmount', []);
        if (totalDepositedAmount >= totalLockedFunds + requiredAmount) {
            await ethSendContractTransaction(escrowAddress, escrowAbi.abi, 'lockFunds', [requiredAmount]);
            shipment.fundsStatus = { LOCKED: null };
            console.log('funds locked');
        }

        this._shipments.insert(id, shipment);
        return shipment;
    }

    async unlockFunds(id: bigint): Promise<Shipment> {
        const shipment = this.getShipment(id);
        if (PhaseEnum.PHASE_5 in this.getShipmentPhase(id) && FundStatusEnum.LOCKED in shipment.fundsStatus) {
            const escrowAddress = shipment.escrowAddress[0];
            if (!escrowAddress) throw new Error('DownPayment.sol address not found');
            await ethSendContractTransaction(escrowAddress, escrowAbi.abi, 'releaseFunds', [shipment.price]);
            shipment.fundsStatus = { RELEASED: null };
            console.log('funds released');
        }

        this._shipments.insert(id, shipment);
        return shipment;
    }

    getDocuments(id: bigint): Array<[DocumentType, DocumentInfo[]]> {
        const shipment = this.getShipment(id);
        return shipment.documents;
    }

    getDocument(id: bigint, documentId: bigint): DocumentInfo {
        const shipment = this.getShipment(id);
        const document = shipment.documents.flatMap(([_, docs]) => docs).find((doc) => doc.id === documentId);
        if (!document) throw new Error('Document not found');
        return document;
    }

    async addDocument(id: bigint, documentType: DocumentType, externalUrl: string): Promise<Shipment> {
        const shipment = this.getShipment(id);
        const documents = this.getDocumentsByType(id, documentType);
        if (!(DocumentTypeEnum.GENERIC in documentType || documents.length == 0 || !(EvaluationStatusEnum.APPROVED in documents[0].evaluationStatus)))
            throw new Error('Document of this type already approved');
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const documentInfo: DocumentInfo = {
            id: BigInt(shipment.documents.length),
            documentType,
            evaluationStatus: { NOT_EVALUATED: null },
            uploadedBy: delegatorAddress,
            externalUrl
        };
        if (DocumentTypeEnum.GENERIC in documentType) {
            const genericDocuments = shipment.documents.find(([type]) => 'GENERIC' in type);
            genericDocuments ? genericDocuments[1].push(documentInfo) : shipment.documents.push([documentType, [documentInfo]]);
        } else {
            const documentTupleIndex = shipment.documents.findIndex(([type]) => Object.keys(documentType)[0] in type);
            if (documentTupleIndex !== -1) {
                shipment.documents[documentTupleIndex] = [documentType, [documentInfo]];
            } else {
                shipment.documents.push([documentType, [documentInfo]]);
            }
        }

        this._shipments.insert(id, shipment);
        return shipment;
    }

    async updateDocument(id: bigint, documentId: bigint, externalUrl: string): Promise<Shipment> {
        const shipment = this.getShipment(id);
        const documentTuple = shipment.documents.find(([_, docs]) => docs.find((doc) => doc.id === documentId));
        if (!documentTuple) throw new Error('Document not found');
        const document = documentTuple[1].find((doc) => doc.id === documentId);
        if (!document) throw new Error('Document not found');
        if (EvaluationStatusEnum.APPROVED in document.evaluationStatus) throw new Error('Document already approved');
        const documentIndex = documentTuple[1].findIndex((doc) => doc.id === documentId);

        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        documentTuple[1][documentIndex].externalUrl = externalUrl;
        documentTuple[1][documentIndex].uploadedBy = delegatorAddress;

        this._shipments.insert(id, shipment);
        return shipment;
    }

    async evaluateDocument(id: bigint, documentId: bigint, documentEvaluationStatus: EvaluationStatus): Promise<Shipment> {
        const shipment = this.getShipment(id);
        const documentTuple = shipment.documents.find(([_, docs]) => docs.find((doc) => doc.id === documentId));
        if (!documentTuple) throw new Error('Document not found');
        const document = documentTuple[1][0];
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        if (document.uploadedBy === delegatorAddress) throw new Error('Caller is the uploader');
        if (EvaluationStatusEnum.APPROVED in document.evaluationStatus) throw new Error('Document already approved');
        const documentIndex = documentTuple[1].findIndex((doc) => doc.id === documentId);
        documentTuple[1][documentIndex].evaluationStatus = documentEvaluationStatus;

        console.log('phase', this.getShipmentPhase(id));
        console.log('fundStatus', shipment.fundsStatus);
        if (PhaseEnum.PHASE_5 in this.getShipmentPhase(id) && FundStatusEnum.LOCKED in shipment.fundsStatus) {
            const escrowAddress = shipment.escrowAddress[0];
            if (!escrowAddress) throw new Error('DownPayment.sol address not found');
            await ethSendContractTransaction(escrowAddress, escrowAbi.abi, 'releaseFunds', [shipment.price]);
            shipment.fundsStatus = { RELEASED: null };
            console.log('funds released');
        }

        this._shipments.insert(id, shipment);
        return shipment;
    }

    getUploadableDocuments(phase: Phase): DocumentType[] {
        if (PhaseEnum.PHASE_1 in phase) {
            return this.getPhase1Documents();
        }
        if (PhaseEnum.PHASE_2 in phase) {
            return this.getPhase2Documents();
        }
        if (PhaseEnum.PHASE_3 in phase) {
            return this.getPhase3Documents();
        }
        if (PhaseEnum.PHASE_4 in phase) {
            return this.getPhase4Documents();
        }
        return this.getPhase5Documents();
    }

    getRequiredDocuments(phase: Phase): DocumentType[] {
        if (PhaseEnum.PHASE_1 in phase) {
            return this.getPhase1RequiredDocuments();
        }
        if (PhaseEnum.PHASE_2 in phase) {
            return this.getPhase2RequiredDocuments();
        }
        if (PhaseEnum.PHASE_3 in phase) {
            return this.getPhase3RequiredDocuments();
        }
        if (PhaseEnum.PHASE_4 in phase) {
            return this.getPhase4RequiredDocuments();
        }
        return this.getPhase5RequiredDocuments();
    }

    getPhase1Documents() {
        return [
            {
                SERVICE_GUIDE: null
            },
            {
                SENSORY_EVALUATION_ANALYSIS_REPORT: null
            },
            {
                SUBJECT_TO_APPROVAL_OF_SAMPLE: null
            },
            {
                PRE_SHIPMENT_SAMPLE: null
            }
        ];
    }

    getPhase1RequiredDocuments() {
        return [
            {
                PRE_SHIPMENT_SAMPLE: null
            }
        ];
    }

    getPhase2Documents() {
        return [
            {
                SHIPPING_INSTRUCTIONS: null
            },
            {
                SHIPPING_NOTE: null
            }
        ];
    }

    getPhase2RequiredDocuments() {
        return [
            {
                SHIPPING_INSTRUCTIONS: null
            },
            {
                SHIPPING_NOTE: null
            }
        ];
    }

    getPhase3Documents() {
        return [
            {
                BOOKING_CONFIRMATION: null
            },
            {
                CARGO_COLLECTION_ORDER: null
            },
            {
                EXPORT_INVOICE: null
            },
            {
                TRANSPORT_CONTRACT: null
            },
            {
                TO_BE_FREED_SINGLE_EXPORT_DECLARATION: null
            }
        ];
    }

    getPhase3RequiredDocuments() {
        return [
            {
                BOOKING_CONFIRMATION: null
            }
        ];
    }

    getPhase4Documents() {
        return [
            {
                EXPORT_CONFIRMATION: null
            },
            {
                FREED_SINGLE_EXPORT_DECLARATION: null
            },
            {
                CONTAINER_PROOF_OF_DELIVERY: null
            },
            {
                PHYTOSANITARY_CERTIFICATE: null
            },
            {
                BILL_OF_LADING: null
            },
            {
                ORIGIN_CERTIFICATE_ICO: null
            },
            {
                WEIGHT_CERTIFICATE: null
            }
        ];
    }

    getPhase4RequiredDocuments() {
        return [
            {
                PHYTOSANITARY_CERTIFICATE: null
            },
            {
                BILL_OF_LADING: null
            },
            {
                ORIGIN_CERTIFICATE_ICO: null
            }
        ];
    }

    getPhase5Documents() {
        return [];
    }

    getPhase5RequiredDocuments() {
        return [];
    }
}

export default ShipmentService;
