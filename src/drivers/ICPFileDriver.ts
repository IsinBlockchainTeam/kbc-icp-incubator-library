import { ICPResourceSpec, ICPStorageDriver } from '@blockchain-lib/common';
import { URL_SEGMENT_INDEXES } from '../constants/ICP';

export class ICPFileDriver {
    private _icpStorageDriver: ICPStorageDriver;

    public constructor(icpStorageDriver: ICPStorageDriver) {
        this._icpStorageDriver = icpStorageDriver;
    }

    public async create(
        bytes: Uint8Array,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<number> {
        return this._icpStorageDriver.create(bytes, resourceSpec, delegatedOrganizationIds);
    }

    public async read(externalUrl: string): Promise<Uint8Array> {
        const organizationId = parseInt(
            externalUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID],
            10
        );
        const files = await this._icpStorageDriver.listFiles(organizationId);

        const file = files.find((f) => f.file.name === externalUrl);
        if (!file) throw new Error(`ICPFileDriver: file with externalUrl ${externalUrl} not found`);

        const result = await this._icpStorageDriver.getFile(file.file);
        if (result.length === 0)
            throw new Error(
                `ICPFileDriver: file with externalUrl ${externalUrl} is empty. This is likely caused by an unauthorized access attempt`
            );
        return result;
    }
}
