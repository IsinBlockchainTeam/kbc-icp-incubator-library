export enum DocumentType {
    DELIVERY_NOTE, BILL_OF_LADING
}

export class DocumentInfo {
    private _id: number;

    private _transactionId: number;

    private _name: string;

    private _documentType: DocumentType;

    private _externalUrl: string;

    private _contentHash: string;

    constructor(id: number, transactionId: number, name: string, documentType: DocumentType, externalUrl: string, contentHash: string) {
        this._id = id;
        this._transactionId = transactionId;
        this._name = name;
        this._documentType = documentType;
        this._externalUrl = externalUrl;
        this._contentHash = contentHash;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
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

    get documentType(): DocumentType {
        return this._documentType;
    }

    set documentType(value: DocumentType) {
        this._documentType = value;
    }

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get contentHash(): string {
        return this._contentHash;
    }

    set contentHash(value: string) {
        this._contentHash = value;
    }
}
