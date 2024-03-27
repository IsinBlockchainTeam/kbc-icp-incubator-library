import { StorageACR } from '@blockchain-lib/common';
import { StorageOperationType } from '../types/StorageOperationType';

export interface MetadataSpec {}
export interface IStorageMetadataDriver<MS extends MetadataSpec, ACR extends StorageACR> {
    create(type: StorageOperationType, value: any, aclRules?: ACR[], metadataSpec?: MS): Promise<string>;
    read(type: StorageOperationType, metadataSpec: MS): Promise<any>;
}
