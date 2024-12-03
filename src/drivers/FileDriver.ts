import { URL_SEGMENT_INDEXES } from '../constants/ICP';
import { StorageDriver } from './StorageDriver';
import { ResourceSpec } from '../types/ResourceSpec';

export class FileDriver {
    private _storageDriver: StorageDriver;

    public constructor(storageDriver: StorageDriver) {
        this._storageDriver = storageDriver;
    }

    public async create(
        bytes: Uint8Array,
        resourceSpec: ResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<number> {
        return this._storageDriver.create(bytes, resourceSpec, delegatedOrganizationIds);
    }

    public async read(externalUrl: string): Promise<Uint8Array> {
        const organizationId = parseInt(
            externalUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID],
            10
        );
        const files = await this._storageDriver.listFiles(organizationId);

        const file = files.find((f) => f.file.name === externalUrl);
        if (!file) throw new Error(`ICPFileDriver: file with externalUrl ${externalUrl} not found`);

        const result = await this._storageDriver.getFile(file.file);
        if (result.length === 0)
            throw new Error(
                `ICPFileDriver: file with externalUrl ${externalUrl} is empty. This is likely caused by an unauthorized access attempt`
            );
        return result;
    }
}
