import { MetadataType } from './IStorageMetadataDriver';

export type DocumentStorage = {
    filename: string,
    fileBuffer: Buffer,
    bcResourceId?: string
}
export interface IStorageDocumentDriver {
    create(type: MetadataType, documentStorage: DocumentStorage): Promise<string>;
}
