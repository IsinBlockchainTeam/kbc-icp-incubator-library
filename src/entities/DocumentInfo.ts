export enum DocumentType {
    METADATA,
    DELIVERY_NOTE,
    BILL_OF_LADING,
    PAYMENT_INVOICE,
    ORIGIN_SWISS_DECODE,
    WEIGHT_CERTIFICATE,
    FUMIGATION_CERTIFICATE,
    PREFERENTIAL_ENTRY_CERTIFICATE,
    PHYTOSANITARY_CERTIFICATE,
    INSURANCE_CERTIFICATE,
    COMPARISON_SWISS_DECODE,
}

export class DocumentInfo {
    private _id: number;

    private _externalUrl: string;

    private _contentHash: string;

    private _uploadedBy: string;

    constructor(id: number, externalUrl: string, contentHash: string, uploadedBy: string) {
        this._id = id;
        this._externalUrl = externalUrl;
        this._contentHash = contentHash;
        this._uploadedBy = uploadedBy;
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

    get uploadedBy(): string {
        return this._uploadedBy;
    }

    set uploadedBy(value: string) {
        this._uploadedBy = value;
    }
}
