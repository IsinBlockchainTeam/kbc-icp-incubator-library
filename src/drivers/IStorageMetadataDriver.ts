export enum MetadataType {
    TRANSACTION, TRANSACTION_DOCUMENT, CERTIFICATION_DOCUMENT
}

export type MetadataStorage = {
    metadata: any,
    resourceName?: string,
    bcResourceId?: string
}
export interface IStorageMetadataDriver {
    create(type: MetadataType, metadataStorage: MetadataStorage): Promise<string>;
}
