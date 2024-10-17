import { StableBTreeMap } from 'azle';
import { FundStatusEnum, Phase, PhaseEnum, Shipment } from '../models/Shipment';
import { RoleProof } from '../models/Proof';
import { validateAddress, validateInterestedParty } from '../utils/validation';
import { ethCallContract, ethSendContractTransaction } from '../utils/rpc';
import escrowManagerAbi from '../../eth-abi/EscrowManager.json';
import { EvaluationStatus, EvaluationStatusEnum } from '../models/Evaluation';
import { DocumentInfo, DocumentType, DocumentTypeEnum } from '../models/Document';
import { StableMemoryId } from '../utils/stableMemory';
import { EVM } from '../constants/evm';

class ShipmentService {
    private static _instance: ShipmentService;

    private escrowManagerAddress: string = EVM.ESCROW_MANAGER_ADDRESS();

    private shipments = StableBTreeMap<bigint, Shipment>(StableMemoryId.SHIPMENTS);

    static get instance() {
        if (!ShipmentService._instance) {
            ShipmentService._instance = new ShipmentService();
        }
        return ShipmentService._instance;
    }

    getShipments(roleProof: RoleProof): Shipment[] {
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        return this.shipments.values().filter((shipment) => {
            const interestedParties = [shipment.supplier, shipment.commissioner];
            return interestedParties.includes(companyAddress);
        });
    }

    getShipment(roleProof: RoleProof, id: bigint): Shipment {
        const result = this.shipments.get(id);
        if (!result) {
            throw new Error('Shipment not found');
        }
        return result;
    }

    async createShipment(roleProof: RoleProof, supplier: string, commissioner: string, sampleApprovalRequired: boolean): Promise<Shipment> {
        if (supplier === commissioner) throw new Error('Supplier and commissioner must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Commissioner', commissioner);
        const interestedParties = [supplier, commissioner];
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        validateInterestedParty('Caller', companyAddress, interestedParties);

        const id = BigInt(this.shipments.keys().length);
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

        // TODO: remove this hardcoded values
        const duration = 1_000_000n;
        const tokenAddress = '0xA0BF1413F37870D386999A316696C4e4e77FC611';
        await ethSendContractTransaction(this.escrowManagerAddress, escrowManagerAbi.abi, 'registerEscrow', [
            shipment.id,
            supplier,
            duration,
            tokenAddress
        ]);

        this.shipments.insert(BigInt(id), shipment);
        return shipment;
    }

    getShipmentPhase(roleProof: RoleProof, id: bigint): Phase {
        const shipment = this.shipments.get(id);
        if (shipment) {
            if (!this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase1RequiredDocuments())) return { PHASE_1: null };
            if (shipment.sampleApprovalRequired && !(EvaluationStatusEnum.APPROVED in shipment.sampleEvaluationStatus)) return { PHASE_1: null };

            if (!this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase2RequiredDocuments())) return { PHASE_2: null };
            if (!(EvaluationStatusEnum.APPROVED in shipment.detailsEvaluationStatus)) return { PHASE_2: null };

            if (!this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase3RequiredDocuments())) return { PHASE_3: null };
            if (FundStatusEnum.NOT_LOCKED in shipment.fundsStatus) return { PHASE_3: null };

            if (!this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase4RequiredDocuments())) return { PHASE_4: null };

            if (!this.areDocumentsUploadedAndApproved(roleProof, id, this.getPhase5RequiredDocuments())) return { PHASE_5: null };
            if (EvaluationStatusEnum.NOT_EVALUATED in shipment.qualityEvaluationStatus) return { PHASE_5: null };

            if (EvaluationStatusEnum.APPROVED in shipment.qualityEvaluationStatus) return { CONFIRMED: null };

            return { ARBITRATION: null };
        }
        throw new Error('Shipment not found');
    }

    private areDocumentsUploadedAndApproved(roleProof: RoleProof, id: bigint, requiredDocuments: DocumentType[]): boolean {
        for (const documentType of requiredDocuments) {
            const document = this.getDocumentsByType(roleProof, id, documentType);
            if (document.length === 0 || !(EvaluationStatusEnum.APPROVED in document[0].evaluationStatus)) return false;
        }
        return true;
    }

    getDocumentsByType(roleProof: RoleProof, id: bigint, documentType: DocumentType): DocumentInfo[] | [] {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        const documentInfos = shipment.documents.find(([type]) => Object.keys(documentType)[0] in type);
        return documentInfos ? documentInfos[1] : [];
    }

    setShipmentDetails(
        roleProof: RoleProof,
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
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        if (PhaseEnum.PHASE_2 in this.getShipmentPhase(roleProof, id)) throw new Error('Shipment in wrong phase');
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

        this.shipments.insert(id, shipment);
        return shipment;
    }

    evaluateSample(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        if (!(PhaseEnum.PHASE_1 in this.getShipmentPhase(roleProof, id))) throw new Error('Shipment in wrong phase');

        if (EvaluationStatusEnum.APPROVED in shipment.sampleEvaluationStatus) throw new Error('Sample already approved');
        shipment.sampleEvaluationStatus = evaluationStatus;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    evaluateShipmentDetails(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        if (!(PhaseEnum.PHASE_2 in this.getShipmentPhase(roleProof, id))) throw new Error('Shipment in wrong phase');
        if (!shipment.detailsSet) throw new Error('Details not set');
        if (EvaluationStatusEnum.APPROVED in shipment.detailsEvaluationStatus) throw new Error('Details already approved');
        shipment.detailsEvaluationStatus = evaluationStatus;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    evaluateQuality(roleProof: RoleProof, id: bigint, evaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        if (!(PhaseEnum.PHASE_5 in this.getShipmentPhase(roleProof, id))) throw new Error('Shipment in wrong phase');
        if (EvaluationStatusEnum.APPROVED in shipment.qualityEvaluationStatus) throw new Error('Quality already approved');
        shipment.qualityEvaluationStatus = evaluationStatus;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    async depositFunds(roleProof: RoleProof, id: bigint, amount: bigint): Promise<Shipment> {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        if (!(PhaseEnum.PHASE_3 in this.getShipmentPhase(roleProof, id))) throw new Error('Shipment in wrong phase');
        if (!(FundStatusEnum.NOT_LOCKED in shipment.fundsStatus)) throw new Error('Funds already locked');

        const escrowAddress = await ethCallContract(this.escrowManagerAddress, escrowManagerAbi.abi, 'getEscrowByShipmentId', [shipment.id]);
        console.log('escrowAddress', escrowAddress);

        // await ethSendContractTransaction(escrowAddress, escrowAbi.abi, 'deposit', [amount, await getAddress(ic.caller())]);

        // const totalLockedFunds = (await ethCallContract(escrowAddress, escrowAbi.abi, 'getLockedAmount', [])).toNumber();
        // console.log('totalLockedFunds', totalLockedFunds);
        // const requiredAmount = shipment.price;
        // console.log('requiredAmount', requiredAmount);
        // const totalDepositedAmount = (await ethCallContract(escrowAddress, escrowAbi.abi, 'getTotalDepositedAmount', [])).toNumber();
        // console.log('totalDepositedAmount', totalDepositedAmount);
        // if(totalDepositedAmount >= totalLockedFunds + requiredAmount) {
        //     await ethSendContractTransaction(escrowAddress, escrowAbi.abi, 'lockFunds', [requiredAmount]);
        //     shipment.fundsStatus = { LOCKED: null };
        // }

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

    getDocuments(roleProof: RoleProof, id: bigint) {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        return shipment.documents;
    }

    addDocument(roleProof: RoleProof, id: bigint, documentType: DocumentType, externalUrl: string): Shipment {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        const documents = this.getDocumentsByType(roleProof, id, documentType);
        if (!(DocumentTypeEnum.GENERIC in documentType || documents.length == 0 || !(EvaluationStatusEnum.APPROVED in documents[0].evaluationStatus)))
            throw new Error('Document of this type already approved');

        const documentInfo: DocumentInfo = {
            id: BigInt(shipment.documents.length),
            documentType,
            evaluationStatus: { NOT_EVALUATED: null },
            uploadedBy: roleProof.membershipProof.delegatorAddress,
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

        this.shipments.insert(id, shipment);
        return shipment;
    }

    updateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, externalUrl: string): Shipment {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        const documentTuple = shipment.documents.find(([_, docs]) => docs.find((doc) => doc.id === documentId));
        if (!documentTuple) throw new Error('Document not found');
        const document = documentTuple[1].find((doc) => doc.id === documentId);
        if (!document) throw new Error('Document not found');
        if (EvaluationStatusEnum.APPROVED in document.evaluationStatus) throw new Error('Document already approved');
        const documentIndex = documentTuple[1].findIndex((doc) => doc.id === documentId);
        documentTuple[1][documentIndex].externalUrl = externalUrl;
        documentTuple[1][documentIndex].uploadedBy = roleProof.membershipProof.delegatorAddress;

        this.shipments.insert(id, shipment);
        return shipment;
    }

    evaluateDocument(roleProof: RoleProof, id: bigint, documentId: bigint, documentEvaluationStatus: EvaluationStatus): Shipment {
        const shipment = this.shipments.get(id);
        if (!shipment) throw new Error('Shipment not found');
        const documentTuple = shipment.documents.find(([_, docs]) => docs.find((doc) => doc.id === documentId));
        if (!documentTuple) throw new Error('Document not found');
        const document = documentTuple[1][0];
        if (document.uploadedBy === roleProof.membershipProof.delegatorAddress) throw new Error('Caller is the uploader');
        if (EvaluationStatusEnum.APPROVED in document.evaluationStatus) throw new Error('Document already approved');
        const documentIndex = documentTuple[1].findIndex((doc) => doc.id === documentId);
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
