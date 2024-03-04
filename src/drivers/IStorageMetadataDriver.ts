export enum MetadataType {
    TRANSACTION, TRANSACTION_DOCUMENT, CERTIFICATION_DOCUMENT
}

export type MetadataStorage = {
    metadata: any,
    resourceId?: string
}
export interface IStorageMetadataDriver {
    create(type: MetadataType, metadataStorage: MetadataStorage): Promise<string>;
}
