import { IDL } from 'azle';
import { IDLEvaluationStatus as IDLEvaluationStatus} from './Evaluation';
import { IDLDocumentInfo as IDLDocumentInfo, IDLDocumentType as IDLDocumentType } from './Document';

export const Phase = IDL.Variant({
    PHASE_1: IDL.Null,
    PHASE_2: IDL.Null,
    PHASE_3: IDL.Null,
    PHASE_4: IDL.Null,
    PHASE_5: IDL.Null,
    CONFIRMED: IDL.Null,
    ARBITRATION: IDL.Null,
});
export const FundStatus = IDL.Variant({
    NOT_LOCKED: IDL.Null,
    LOCKED: IDL.Null,
    RELEASED: IDL.Null,
});
export const Shipment = IDL.Record({
    id: IDL.Nat,
    supplier: IDL.Text,
    commissioner: IDL.Text,
    escrowAddress: IDL.Opt(IDL.Text),
    sampleEvaluationStatus: IDLEvaluationStatus,
    detailsEvaluationStatus: IDLEvaluationStatus,
    qualityEvaluationStatus: IDLEvaluationStatus,
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
    documents: IDL.Vec(IDL.Tuple(IDLDocumentType, IDL.Vec(IDLDocumentInfo))),
});
