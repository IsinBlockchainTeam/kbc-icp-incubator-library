import { IPFSService, PinataIPFSDriver } from '@blockchain-lib/common';
import { DocumentFile } from './DocumentFile';
import { envVariables } from '../utils/constants';

export class Document {
    private _ipfsService?: IPFSService;

    private _id: number;

    private _owner: string;

    private _transactionId: number;

    private _name: string;

    private _documentType: string;

    private readonly _externalUrl: string;

    private _file?: DocumentFile;

    constructor(id: number, owner: string, transactionId: number, name: string, documentType: string, externalUrl: string) {
        this._id = id;
        this._owner = owner;
        this._transactionId = transactionId;
        this._name = name;
        this._documentType = documentType;
        this._externalUrl = externalUrl;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this._owner = value;
    }

    get transactionId(): number {
        return this._transactionId;
    }

    set transactionId(value: number) {
        this._transactionId = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get documentType(): string {
        return this._documentType;
    }

    set documentType(value: string) {
        this._documentType = value;
    }

    get file(): Promise<DocumentFile | undefined> {
        if (!this._ipfsService) this._ipfsService = new IPFSService(new PinataIPFSDriver(envVariables.PINATA_API_KEY(), envVariables.PINATA_SECRET_API_KEY()));

        return (async () => {
            if (!this._file) {
                try {
                    const { filename, fileUrl } = await this._ipfsService!.retrieveJSON(this._externalUrl);
                    const fileContent = await this._ipfsService!.retrieveFile(fileUrl);
                    if (fileContent) this._file = new DocumentFile(filename, fileContent);
                } catch (e) {
                    console.error('Error while retrieve document file from IPFS: ', e);
                }
            }
            return this._file;
        })();
    }
}
