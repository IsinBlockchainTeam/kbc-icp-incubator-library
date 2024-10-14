import { IDL } from 'azle';

export enum EvaluationStatusEnum {
    NOT_EVALUATED = 'NOT_EVALUATED',
    APPROVED = 'APPROVED',
    NOT_APPROVED = 'NOT_APPROVED',
}
export type EvaluationStatus = { NOT_EVALUATED: null } | { APPROVED: null } | { NOT_APPROVED: null };
export const EvaluationStatus = IDL.Variant({
    NOT_EVALUATED: IDL.Null,
    APPROVED: IDL.Null,
    NOT_APPROVED: IDL.Null,
});
