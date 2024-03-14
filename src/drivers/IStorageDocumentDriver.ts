import { OperationType } from './IStorageMetadataDriver';

export type DocumentSpec = {}
export interface IStorageDocumentDriver<S extends DocumentSpec> {
    create(type: OperationType, value: Buffer, documentSpec: S): Promise<string>;
    read(type: OperationType, documentSpec: S): Promise<Buffer | null>;
}
