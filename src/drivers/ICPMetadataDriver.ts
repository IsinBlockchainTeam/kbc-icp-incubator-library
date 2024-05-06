import {ICPResourceSpec, ICPStorageDriver} from "@blockchain-lib/common";

export class ICPMetadataDriver {
    private _storageDriver: ICPStorageDriver;

    private static _instance: ICPMetadataDriver;

    private constructor(storageDriver: ICPStorageDriver) {
        this._storageDriver = storageDriver;
    }

    public static init() {
        try {
            const storageDriver: ICPStorageDriver = ICPStorageDriver.getInstance();
            this._instance = new ICPMetadataDriver(storageDriver);
        } catch(error) {
            console.error("ICPMetadataDriver: unable to initialize ICPStorageDriver", error);
        }
    }

    public static getInstance(): ICPMetadataDriver {
        if(!this._instance)
            throw new Error("ICPMetadataDriver: instance not initialized");

        return this._instance;
    }

    public async create(value: object, resourceSpec: ICPResourceSpec): Promise<number> {
        return this._storageDriver.create(new TextEncoder().encode(JSON.stringify(value)), resourceSpec);
    }

    public async read(externalUrl: string): Promise<object> {
        const organizationId = parseInt(externalUrl.split('/')[4]);
        const files = await this._storageDriver.listFiles(organizationId);

        const file = files.find(file => file.file.name === externalUrl);
        if(!file)
            throw new Error(`ICPMetadataDriver: file with externalUrl ${externalUrl} not found`);

        const bytes = await this._storageDriver.getFile(file.file);
        const jsonString = new TextDecoder().decode(bytes);
        return JSON.parse(jsonString);
    }
}
