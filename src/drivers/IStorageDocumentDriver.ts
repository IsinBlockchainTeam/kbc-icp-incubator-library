import { MetadataType } from './IStorageMetadataDriver';

export type DocumentStorage = {
    fileBuffer: Buffer,
    resourceId?: string
}
export interface IStorageDocumentDriver {
    create(type: MetadataType, documentStorage: DocumentStorage): Promise<string>;
}
