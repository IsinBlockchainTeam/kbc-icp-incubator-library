export enum EvaluationStatus {
    NOT_EVALUATED = 'NOT_EVALUATED',
    APPROVED = 'APPROVED',
    NOT_APPROVED = 'NOT_APPROVED'
}

export type DocumentMetadata = {
    filename: string;
    fileType: string;
};
