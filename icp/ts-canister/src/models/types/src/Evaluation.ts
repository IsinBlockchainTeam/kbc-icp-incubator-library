export enum EvaluationStatusEnum {
    NOT_EVALUATED = 'NOT_EVALUATED',
    APPROVED = 'APPROVED',
    NOT_APPROVED = 'NOT_APPROVED',
}
export type EvaluationStatus = { NOT_EVALUATED: null } | { APPROVED: null } | { NOT_APPROVED: null };
