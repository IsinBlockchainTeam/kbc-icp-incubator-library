import { IDL } from 'azle';
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
export const Phase = IDL.Variant({
    PHASE_1: IDL.Null,
    PHASE_2: IDL.Null,
    PHASE_3: IDL.Null,
    PHASE_4: IDL.Null,
    PHASE_5: IDL.Null,
    CONFIRMED: IDL.Null,
    ARBITRATION: IDL.Null,
});

export enum FundStatusEnum {
    NOT_LOCKED = 'NOT_LOCKED',
    LOCKED = 'LOCKED',
    RELEASED = 'RELEASED',
}
export type FundStatus = { NOT_LOCKED: null } | { LOCKED: null } | { RELEASED: null };
export const FundStatus = IDL.Variant({
    NOT_LOCKED: IDL.Null,
    LOCKED: IDL.Null,
    RELEASED: IDL.Null,
});

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
export const Shipment = IDL.Record({
    id: IDL.Nat,
    supplier: IDL.Text,
    commissioner: IDL.Text,
    escrowAddress: IDL.Opt(IDL.Text),
    sampleEvaluationStatus: EvaluationStatus,
    detailsEvaluationStatus: EvaluationStatus,
    qualityEvaluationStatus: EvaluationStatus,
    fundsStatus: FundStatus,
    detailsSet: IDL.Bool,
    sampleApprovalRequired: IDL.Bool,
    shipmentNumber: IDL.Nat,
    expirationDate: IDL.Int,
    fixingDate: IDL.Int,
    targetExchange: IDL.Text,
    differentialApplied: IDL.Nat,
    price: IDL.Nat,
    quantity: IDL.Nat,
    containersNumber: IDL.Nat,
    netWeight: IDL.Nat,
    grossWeight: IDL.Nat,
    documents: IDL.Vec(IDL.Tuple(DocumentType, IDL.Vec(DocumentInfo))),
});
