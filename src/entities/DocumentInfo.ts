export class DocumentInfo {
    private _id: number;

    private _transactionId: number;

    private _name: string;

    private _documentType: string;

    private _externalUrl: string;

    private _transactionLineId?: number;

    constructor(id: number, transactionId: number, name: string, documentType: string, externalUrl: string, transactionLineId: number) {
        this._id = id;
        this._transactionId = transactionId;
        this._name = name;
        this._documentType = documentType;
        this._externalUrl = externalUrl;
        this._transactionLineId = transactionLineId || undefined;
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

    get documentType(): string {
        return this._documentType;
    }

    set documentType(value: string) {
        this._documentType = value;
    }

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get transactionLineId(): number | undefined {
        return this._transactionLineId;
    }

    set transactionLineId(value: number | undefined) {
        this._transactionLineId = value || undefined;
    }
}
