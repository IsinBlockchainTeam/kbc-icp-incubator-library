import { StorageOperationType } from '../types/StorageOperationType';

export type DocumentSpec = {}
export interface IStorageDocumentDriver<DS extends DocumentSpec> {
    create(type: StorageOperationType, value: Uint8Array, documentSpec: DS): Promise<string>;
    read(type: StorageOperationType, documentSpec: DS): Promise<Uint8Array | null>;
}
