import {ICPResourceSpec, ICPStorageDriver} from "@blockchain-lib/common";
import {DocumentDriver} from "./DocumentDriver";

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

    public async create(bytes: Uint8Array, resourceSpec: ICPResourceSpec): Promise<number> {
        return this._icpStorageDriver.create(bytes, resourceSpec);
    }

    public async read(externalUrl: string): Promise<object> {
        const organizationId = parseInt(externalUrl.split('/')[4]);
        const files = await this._icpStorageDriver.listFiles(organizationId);

        const file = files.find(file => file.file.name === externalUrl);
        if(!file)
            throw new Error(`ICPMetadataDriver: file with externalUrl ${externalUrl} not found`);

        const bytes = await this._icpStorageDriver.getFile(file.file);
        const jsonString = new TextDecoder().decode(bytes);
        return JSON.parse(jsonString);
    }
}
