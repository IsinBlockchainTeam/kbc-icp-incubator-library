import { Document, DocumentTypeEnum as DocumentType } from '@kbc-lib/azle-types';
import { EvaluationStatus } from './Evaluation';

export { type Document, DocumentType };

export enum DocumentStatus {
    NOT_EVALUATED,
    APPROVED,
    NOT_APPROVED
}

export type DocumentInfo = {
    id: number;
    documentType: DocumentType;
    evaluationStatus: EvaluationStatus;
    uploadedBy: string;
    externalUrl: string;
};
