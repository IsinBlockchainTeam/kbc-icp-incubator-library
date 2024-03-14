export enum OperationType {
    TRANSACTION, TRANSACTION_DOCUMENT, CERTIFICATION_DOCUMENT
}

export type MetadataSpec = {};
export interface IStorageMetadataDriver<MS extends MetadataSpec> {
    create(type: OperationType, value: any, metadataSpec?: MS): Promise<string>;
    read(type: OperationType, metadataSpec: MS): Promise<any>
}
