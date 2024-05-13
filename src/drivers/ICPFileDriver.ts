import {ICPResourceSpec, ICPStorageDriver} from "@blockchain-lib/common";
import {URL_SEGMENT_INDEXES} from "../constants/ICP";

export class ICPFileDriver {
    private _icpStorageDriver: ICPStorageDriver;

    private static _instance: ICPFileDriver;

    private constructor(icpStorageDriver: ICPStorageDriver) {
        this._icpStorageDriver = icpStorageDriver;
    }

    public static init() {
        try {
            const storageDriver: ICPStorageDriver = ICPStorageDriver.getInstance();
            this._instance = new ICPFileDriver(storageDriver);
        } catch(error) {
            console.error("ICPFileDriver: unable to initialize ICPStorageDriver", error);
        }
    }

    public static getInstance(): ICPFileDriver {
        if(!this._instance)
            throw new Error("ICPFileDriver: instance not initialized");

        return this._instance;
    }

    public async create(bytes: Uint8Array, resourceSpec: ICPResourceSpec, delegatedOrganizationIds: number[] = []): Promise<number> {
        return this._icpStorageDriver.create(bytes, resourceSpec, delegatedOrganizationIds);
    }

    public async read(externalUrl: string): Promise<Uint8Array> {
        const organizationId = parseInt(externalUrl.split('/')[URL_SEGMENT_INDEXES.ORGANIZATION_ID]);
        const files = await this._icpStorageDriver.listFiles(organizationId);

        const file = files.find(file => file.file.name === externalUrl);
        if(!file)
            throw new Error(`ICPFileDriver: file with externalUrl ${externalUrl} not found`);

        const result = await this._icpStorageDriver.getFile(file.file);
        if(result.length === 0)
            throw new Error(`ICPFileDriver: file with externalUrl ${externalUrl} is empty. This is likely caused by an unauthorized access attempt`);
        return result;
    }
}
