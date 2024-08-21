export enum DocumentType {
    INSURANCE_CERTIFICATE,
    BOOKING_CONFIRMATION,
    SHIPPING_NOTE,
    WEIGHT_CERTIFICATE,
    BILL_OF_LADING,
    PHYTOSANITARY_CERTIFICATE,
    SINGLE_EXPORT_DECLARATION,
    OTHER
}
export enum DocumentStatus {
    NOT_EVALUATED, APPROVED, NOT_APPROVED
}
export class DocumentInfo {
    private _id: number;

    private _type: DocumentType;

    private _status: DocumentStatus;

    private _uploader: string;

    constructor(id: number, type: DocumentType, status: DocumentStatus, uploader: string) {
        this._id = id;
        this._type = type;
        this._status = status;
        this._uploader = uploader;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get type(): DocumentType {
        return this._type;
    }

    set type(value: DocumentType) {
        this._type = value;
    }

    get status(): DocumentStatus {
        return this._status;
    }

    set status(value: DocumentStatus) {
        this._status = value;
    }

    get uploader(): string {
        return this._uploader;
    }

    set uploader(value: string) {
        this._uploader = value;
    }
}
export enum ShipmentPhase {
    APPROVAL,
    LAND_TRANSPORTATION,
    SEA_TRANSPORTATION,
    COMPARISON
}
export enum ShipmentEvaluationStatus {
    NOT_EVALUATED,
    CONFIRMED,
    ARBITRATION
}
export enum FundsStatus {
    NOT_LOCKED,
    LOCKED,
    RELEASED
}
export class Shipment {
    private _approved: boolean;

    private _expirationDate: Date;

    private _quantity: number;

    private _weight: number;

    private _price: number;

    private _evaluationStatus: ShipmentEvaluationStatus;

    private _documentsIds: number[];

    private _fundsStatus: FundsStatus;

    private _externalUrl: string;

    private _landTransportationRequiredDocumentsTypes: DocumentType[];

    private _seaTransportationRequiredDocumentsTypes: DocumentType[];

    constructor(approved: boolean, expirationDate: Date, quantity: number, weight: number, price: number, evaluationStatus: ShipmentEvaluationStatus, documentsIds: number[], fundsStatus: FundsStatus, externalUrl: string, landTransportationRequiredDocumentsTypes: DocumentType[], seaTransportationRequiredDocumentsTypes: DocumentType[]) {
        if(quantity < 0 || weight < 0 || price < 0) {
            throw new Error('Invalid shipment data');
        }
        this._approved = approved;
        this._expirationDate = expirationDate;
        this._quantity = quantity;
        this._weight = weight;
        this._price = price;
        this._evaluationStatus = evaluationStatus;
        this._documentsIds = documentsIds;
        this._fundsStatus = fundsStatus;
        this._externalUrl = externalUrl;
        this._landTransportationRequiredDocumentsTypes = landTransportationRequiredDocumentsTypes;
        this._seaTransportationRequiredDocumentsTypes = seaTransportationRequiredDocumentsTypes;
    }

    get approved(): boolean {
        return this._approved;
    }

    set approved(value: boolean) {
        this._approved = value;
    }

    get expirationDate(): Date {
        return this._expirationDate;
    }

    set expirationDate(value: Date) {
        this._expirationDate = value;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }

    get weight(): number {
        return this._weight;
    }

    set weight(value: number) {
        this._weight = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }

    get evaluationStatus(): ShipmentEvaluationStatus {
        return this._evaluationStatus;
    }

    set evaluationStatus(value: ShipmentEvaluationStatus) {
        this._evaluationStatus = value;
    }

    get documentsIds(): number[] {
        return this._documentsIds;
    }

    set documentsIds(value: number[]) {
        this._documentsIds = value;
    }

    get fundsStatus(): FundsStatus {
        return this._fundsStatus;
    }

    set fundsStatus(value: FundsStatus) {
        this._fundsStatus = value;
    }

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get landTransportationRequiredDocumentsTypes(): DocumentType[] {
        return this._landTransportationRequiredDocumentsTypes;
    }

    set landTransportationRequiredDocumentsTypes(value: DocumentType[]) {
        this._landTransportationRequiredDocumentsTypes = value;
    }

    get seaTransportationRequiredDocumentsTypes(): DocumentType[] {
        return this._seaTransportationRequiredDocumentsTypes;
    }

    set seaTransportationRequiredDocumentsTypes(value: DocumentType[]) {
        this._seaTransportationRequiredDocumentsTypes = value;
    }
}
