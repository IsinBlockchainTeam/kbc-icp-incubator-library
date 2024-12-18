import { Document, DocumentTypeEnum as DocumentType } from '@isinblockchainteam/azle-types';
import { EvaluationStatus } from './Evaluation';

export { Document, DocumentType };

export type DocumentInfo = {
    id: number;
    documentType: DocumentType;
    evaluationStatus: EvaluationStatus;
    uploadedBy: string;
    externalUrl: string;
};
