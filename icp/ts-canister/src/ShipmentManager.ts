import {IDL, update, StableBTreeMap} from 'azle';
import {
    DocumentEvaluationStatus,
    DocumentInfo,
    DocumentType,
    EvaluationStatus,
    Phase,
    Shipment
} from './models/Shipment';
import { OnlyEditor, OnlyViewer } from './decorators/roles';
import { Address } from './models/Address';
import { RoleProof } from './models/Proof';
import { validateAddress, validateInterestedParty } from './validation';

class ShipmentManager {
    shipments = StableBTreeMap<bigint, Shipment>(0);

    @update([RoleProof], IDL.Vec(Shipment))
    @OnlyViewer
    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        return this.shipments.values().filter(shipment => {
            const interestedParties = [shipment.supplier, shipment.commissioner];
            return interestedParties.includes(companyAddress);
        });
    }

    @update([RoleProof, IDL.Nat], Shipment)
    @OnlyViewer
    async getShipment(roleProof: RoleProof, id: bigint): Promise<Shipment> {
        const result = this.shipments.get(id);
        if(result) {
            const interestedParties = [result.supplier, result.commissioner];
            const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
            if(!interestedParties.includes(companyAddress))
                throw new Error('Access denied');
            return result;
        }
        throw new Error('Shipment not found');
    }

    @update([RoleProof, Address, Address, Address, IDL.Bool], Shipment)
    @OnlyEditor
    async createShipment(
        roleProof: RoleProof,
        supplier: Address,
        commissioner: Address,
        escrowAddress: Address,
        sampleApprovalRequired: boolean
    ): Promise<Shipment> {
        if(supplier === commissioner)
            throw new Error('Supplier and commissioner must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Commissioner', commissioner);
        validateAddress('Escrow address', escrowAddress);
        const interestedParties = [supplier, commissioner];
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        validateInterestedParty('Caller', companyAddress, interestedParties);

        const id = this.shipments.keys().length;
        const shipment: Shipment = {
            id,
            supplier,
            commissioner,
            escrowAddress,
            sampleEvaluationStatus: { NOT_EVALUATED: null },
            detailsEvaluationStatus: { NOT_EVALUATED: null },
            qualityEvaluationStatus: { NOT_EVALUATED: null },
            fundsStatus: { NOT_LOCKED: null },
            detailsSet: false,
            sampleApprovalRequired,
            shipmentNumber: 0,
            expirationDate: 0,
            fixingDate: 0,
            targetExchange: '',
            differentialApplied: 0,
            price: 0,
            quantity: 0,
            containersNumber: 0,
            netWeight: 0,
            grossWeight: 0,
            documents: [],
        };
        this.shipments.insert(BigInt(id), shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat], Phase)
    @OnlyViewer
    async getShipmentPhase(roleProof: RoleProof, id: bigint): Promise<Phase> {
        const shipment = this.shipments.get(id);
        if(shipment) {
            if(!await this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase1RequiredDocuments()))
                return { PHASE_1: null };
            if(shipment.sampleApprovalRequired && !('APPROVED' in shipment.sampleEvaluationStatus))
                return { PHASE_1: null };

            if(!await this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase2RequiredDocuments()))
                return { PHASE_2: null };
            if(!('APPROVED' in shipment.detailsEvaluationStatus))
                return { PHASE_2: null };

            if(!await this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase3RequiredDocuments()))
                return { PHASE_3: null };
            if('NOT_LOCKED' in shipment.fundsStatus)
                return { PHASE_3: null };

            if(!await this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase4RequiredDocuments()))
                return { PHASE_4: null };

            if(!await this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase5RequiredDocuments()))
                return { PHASE_5: null };
            if('NOT_EVALUATED' in shipment.qualityEvaluationStatus)
                return { PHASE_5: null };

            if('APPROVED' in shipment.qualityEvaluationStatus)
                return { CONFIRMED: null };

            return { ARBITRATION: null };
        }
        throw new Error('Shipment not found');
    }

    private async areDocumentsUploadedAndApproved(roleProof: RoleProof, id: bigint, requiredDocuments: DocumentType[]): Promise<boolean> {
        for (const documentType of requiredDocuments) {
            const document = await this.getDocumentsByType(roleProof, id, documentType);
            if(document.length === 0 || !('APPROVED' in document[0].evaluationStatus))
                return false;
        }
        return true;
    }

    @update([RoleProof, IDL.Nat, DocumentType], IDL.Opt(IDL.Vec(DocumentInfo)))
    @OnlyViewer
    async getDocumentsByType(roleProof: RoleProof, id: bigint, documentType: DocumentType): Promise<DocumentInfo[] | []> {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        const documentTuple = shipment.documents.find(([type]) => Object.keys(documentType)[0] in type);
        return documentTuple ? documentTuple[1] : [];
    }

    // @update([RoleProof, IDL.Nat, DocumentType], IDL.Opt(DocumentInfo))
    // @OnlyViewer
    // async getTypedDocument(roleProof: RoleProof, id: bigint, documentType: DocumentType): Promise<[DocumentInfo] | []> {
    //     const shipment = this.shipments.get(id);
    //     if(!shipment)
    //         throw new Error('Shipment not found');
    //     const documentTuple = shipment.typedDocuments.find(([type]) => type === documentType);
    //     return documentTuple ? [documentTuple[1]] : [];
    // }


    @update([RoleProof, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], Shipment)
    @OnlyEditor
    async setShipmentDetails(
        roleProof: RoleProof,
        id: bigint,
        shipmentNumber: number,
        expirationDate: number,
        fixingDate: number,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        if('PHASE_2' in await this.getShipmentPhase(roleProof, id))
            throw new Error('Shipment in wrong phase');
        if('APPROVED' in shipment.detailsEvaluationStatus)
            throw new Error('Details already approved');

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

        this.shipments.insert(id, shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    async evaluateSample(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        if(!('PHASE_1' in await this.getShipmentPhase(roleProof, id)))
            throw new Error('Shipment in wrong phase');

        if(!('NOT_EVALUATED' in shipment.sampleEvaluationStatus))
            throw new Error('Sample already evaluated');
        shipment.sampleEvaluationStatus = evaluationStatus;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    async evaluateShipmentDetails(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        shipment.detailsEvaluationStatus = evaluationStatus;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat, EvaluationStatus], Shipment)
    @OnlyEditor
    async evaluateQuality(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        shipment.qualityEvaluationStatus = evaluationStatus;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat, IDL.Nat], Shipment)
    @OnlyEditor
    async depositFunds(roleProof: RoleProof, id: bigint, amount: number): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        if(!('PHASE_3' in await this.getShipmentPhase(roleProof, id)))
            throw new Error('Shipment in wrong phase');
        if(!('NOT_LOCKED' in shipment.fundsStatus))
            throw new Error('Funds already locked');

        // TODO: Call escrow "deposit" method
        // _escrow.deposit(amount, _msgSender());
        // uint256 totalLockedFunds = _escrow.getLockedAmount();
        // uint256 requiredAmount = _price;
        // if(_escrow.getTotalDepositedAmount() >= totalLockedFunds + requiredAmount) {
        //     _escrow.lockFunds(requiredAmount);
        //     _fundsStatus = FundsStatus.LOCKED;
        // }

        return shipment;
    }

    @update([RoleProof, IDL.Nat], IDL.Vec(IDL.Tuple(DocumentType, IDL.Vec(DocumentInfo))))
    @OnlyViewer
    async getDocuments(roleProof: RoleProof, id: bigint) {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        return shipment.documents;
    }

    @update([RoleProof, IDL.Nat, DocumentType, IDL.Text], Shipment)
    @OnlyEditor
    async addDocument(roleProof: RoleProof, id: bigint, documentType: DocumentType, externalUrl: string): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        const documents = await this.getDocumentsByType(roleProof, id, documentType);
        if(!(
            'GENERIC' in documentType
            || documents.length == 0
            || !('APPROVED' in documents[0].evaluationStatus)
        ))
            throw new Error('Document of this type already approved');

        const documentInfo: DocumentInfo = {
            id: BigInt(shipment.documents.length),
            documentType,
            evaluationStatus: { NOT_EVALUATED: null },
            uploadedBy: roleProof.membershipProof.delegatorAddress as Address,
            externalUrl,
        }
        if('GENERIC' in documentType) {
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

        this.shipments.insert(id, shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat, IDL.Nat, IDL.Text], Shipment)
    @OnlyEditor
    async updateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, externalUrl: string): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        const documentTuple = shipment.documents.find(([_, docs]) => docs.find(doc => doc.id === documentId));
        if(!documentTuple)
            throw new Error('Document not found');
        const document = documentTuple[1].find(doc => doc.id === documentId);
        if(!document)
            throw new Error('Document not found');
        if('APPROVED' in document.evaluationStatus)
            throw new Error('Document already approved');
        const documentIndex = documentTuple[1].findIndex(doc => doc.id === documentId);
        documentTuple[1][documentIndex].externalUrl = externalUrl;
        documentTuple[1][documentIndex].uploadedBy = roleProof.membershipProof.delegatorAddress as Address;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    @update([RoleProof, IDL.Nat, IDL.Nat, DocumentEvaluationStatus], Shipment)
    @OnlyEditor
    async evaluateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, documentEvaluationStatus: DocumentEvaluationStatus): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if(!shipment)
            throw new Error('Shipment not found');
        const documentTuple = shipment.documents.find(([_, docs]) => docs.find(doc => doc.id === documentId));
        if(!documentTuple)
            throw new Error('Document not found');
        const document = documentTuple[1][0];
        if(document.uploadedBy === roleProof.membershipProof.delegatorAddress)
            throw new Error('Caller is the uploader');
        if('APPROVED' in document.evaluationStatus)
            throw new Error('Document already approved');
        const documentIndex = documentTuple[1].findIndex(doc => doc.id === documentId);
        documentTuple[1][documentIndex].evaluationStatus = documentEvaluationStatus;

        // TODO: Unlock funds if all required documents are approved
        // if(getPhase(roleProof) == Phase.PHASE_5 && _fundsStatus == FundsStatus.LOCKED) {
        //     _escrow.releaseFunds(_price);
        //     _fundsStatus = FundsStatus.RELEASED;
        // }

        this.shipments.insert(id, shipment);
        return shipment;
    }

    getPhase1Documents() {
        return [{
            SERVICE_GUIDE: null,
        }, {
            SENSORY_EVALUATION_ANALYSIS_REPORT: null,
        }, {
            SUBJECT_TO_APPROVAL_OF_SAMPLE: null,
        }, {
            PRE_SHIPMENT_SAMPLE: null,
        }];
    }

    getPhase1RequiredDocuments() {
        return [{
            PRE_SHIPMENT_SAMPLE: null,
        }];
    }

    getPhase2Documents() {
        return [{
            SHIPPING_INSTRUCTIONS: null,
        }, {
            SHIPPING_NOTE: null,
        }];
    }

    getPhase2RequiredDocuments() {
        return [{
            SHIPPING_INSTRUCTIONS: null,
        }, {
            SHIPPING_NOTE: null,
        }];
    }

    getPhase3Documents() {
        return [{
            BOOKING_CONFIRMATION: null,
        }, {
            CARGO_COLLECTION_ORDER: null,
        }, {
            EXPORT_INVOICE: null,
        }, {
            TRANSPORT_CONTRACT: null,
        }, {
            TO_BE_FREED_SINGLE_EXPORT_DECLARATION: null,
        }];
    }

    getPhase3RequiredDocuments() {
        return [{
            BOOKING_CONFIRMATION: null,
        }];
    }

    getPhase4Documents() {
        return [{
            EXPORT_CONFIRMATION: null,
        }, {
            FREED_SINGLE_EXPORT_DECLARATION: null,
        }, {
            CONTAINER_PROOF_OF_DELIVERY: null,
        }, {
            PHYTOSANITARY_CERTIFICATE: null,
        }, {
            BILL_OF_LADING: null,
        }, {
            ORIGIN_CERTIFICATE_ICO: null,
        }, {
            WEIGHT_CERTIFICATE: null,
        }];
    }

    getPhase4RequiredDocuments() {
        return [{
            PHYTOSANITARY_CERTIFICATE: null,
        }, {
            BILL_OF_LADING: null,
        }, {
            ORIGIN_CERTIFICATE_ICO: null,
        }];
    }

    getPhase5Documents() {
        return [];
    }

    getPhase5RequiredDocuments() {
        return [];
    }
}
export default ShipmentManager;
