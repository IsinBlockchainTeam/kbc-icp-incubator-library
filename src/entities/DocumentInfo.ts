import { DocumentStatus } from './Document';

export enum DocumentType {
    METADATA,
    DELIVERY_NOTE,
    BILL_OF_LADING,
    PAYMENT_INVOICE,
    SWISS_DECODE,
    WEIGHT_CERTIFICATE,
    FUMIGATION_CERTIFICATE,
    PREFERENTIAL_ENTRY_CERTIFICATE,
    PHYTOSANITARY_CERTIFICATE,
    INSURANCE_CERTIFICATE,
}

export class DocumentInfo {
    private _id: number;

    private _externalUrl: string;

    private _contentHash: string;

    private _status: DocumentStatus;

    constructor(id: number, externalUrl: string, contentHash: string, status: DocumentStatus) {
        this._id = id;
        this._externalUrl = externalUrl;
        this._contentHash = contentHash;
        this._status = status;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
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

    get status(): DocumentStatus {
        return this._status;
    }

    set status(value: DocumentStatus) {
        this._status = value;
    }
}
