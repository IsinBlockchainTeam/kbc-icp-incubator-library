import { EvaluationStatus } from './Evaluation';
import { DocumentInfo, DocumentType } from './Document';

export enum PhaseEnum {
    PHASE_1 = 'PHASE_1',
    PHASE_2 = 'PHASE_2',
    PHASE_3 = 'PHASE_3',
    PHASE_4 = 'PHASE_4',
    PHASE_5 = 'PHASE_5',
    CONFIRMED = 'CONFIRMED',
    ARBITRATION = 'ARBITRATION',
}
export type Phase = { PHASE_1: null } | { PHASE_2: null } | { PHASE_3: null } | { PHASE_4: null } | { PHASE_5: null } | { CONFIRMED: null } | { ARBITRATION: null };
export enum FundStatusEnum {
    NOT_LOCKED = 'NOT_LOCKED',
    LOCKED = 'LOCKED',
    RELEASED = 'RELEASED',
}
export type FundStatus = { NOT_LOCKED: null } | { LOCKED: null } | { RELEASED: null };
export type Shipment = {
    id: bigint;
    supplier: string;
    commissioner: string;
    escrowAddress: [string] | [];
    sampleEvaluationStatus: EvaluationStatus;
    detailsEvaluationStatus: EvaluationStatus;
    qualityEvaluationStatus: EvaluationStatus;
    fundsStatus: FundStatus;
    detailsSet: boolean;
    sampleApprovalRequired: boolean;
    shipmentNumber: bigint;
    expirationDate: bigint;
    fixingDate: bigint;
    targetExchange: string;
    differentialApplied: bigint;
    price: bigint;
    quantity: bigint;
    containersNumber: bigint;
    netWeight: bigint;
    grossWeight: bigint;
    documents: Array<[DocumentType, DocumentInfo[]]>,
};
