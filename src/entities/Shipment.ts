export enum DocumentType {
    SERVICE_GUIDE,
    SENSORY_EVALUATION_ANALYSIS_REPORT,
    SUBJECT_TO_APPROVAL_OF_SAMPLE,
    PRE_SHIPMENT_SAMPLE,
    SHIPPING_INSTRUCTIONS,
    SHIPPING_NOTE,
    BOOKING_CONFIRMATION,
    CARGO_COLLECTION_ORDER,
    EXPORT_INVOICE,
    TRANSPORT_CONTRACT,
    TO_BE_FREED_SINGLE_EXPORT_DECLARATION,
    EXPORT_CONFIRMATION,
    FREED_SINGLE_EXPORT_DECLARATION,
    CONTAINER_PROOF_OF_DELIVERY,
    PHYTOSANITARY_CERTIFICATE,
    BILL_OF_LADING,
    ORIGIN_CERTIFICATE_ICO,
    WEIGHT_CERTIFICATE,
    GENERIC
}
export enum DocumentEvaluationStatus {
    NOT_EVALUATED,
    APPROVED,
    NOT_APPROVED
}
export class DocumentInfo {
    private _id: number;

    private _type: DocumentType;

    private _status: DocumentEvaluationStatus;

    private _uploader: string;

    constructor(id: number, type: DocumentType, status: DocumentEvaluationStatus, uploader: string) {
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

    get status(): DocumentEvaluationStatus {
        return this._status;
    }

    set status(value: DocumentEvaluationStatus) {
        this._status = value;
    }

    get uploader(): string {
        return this._uploader;
    }

    set uploader(value: string) {
        this._uploader = value;
    }
}
export enum Phase {
    PHASE_1,
    PHASE_2,
    PHASE_3,
    PHASE_4,
    PHASE_5,
    CONFIRMED,
    ARBITRATION
}
export enum EvaluationStatus {
    NOT_EVALUATED,
    APPROVED,
    NOT_APPROVED
}
export enum FundsStatus {
    NOT_LOCKED,
    LOCKED,
    RELEASED
}
export class Shipment {
    private _supplierAddress: string;

    private _commissionerAddress: string;

    private _externalUrl: string;

    private _escrowAddress: string;

    private _documentManagerAddress: string;

    private _sampleEvaluationStatus: EvaluationStatus;

    private _detailsEvaluationStatus: EvaluationStatus;

    private _qualityEvaluationStatus: EvaluationStatus;

    private _fundsStatus: FundsStatus;

    private _detailsSet: boolean;

    private _shipmentNumber: number;

    private _expirationDate: Date;

    private _fixingDate: Date;

    private _targetExchange: string;

    private _differentialApplied: number;

    private _price: number;

    private _quantity: number;

    private _containersNumber: number;

    private _netWeight: number;

    private _grossWeight: number;


    constructor(supplierAddress: string, commissionerAddress: string, externalUrl: string, escrowAddress: string, documentManagerAddress: string, sampleEvaluationStatus: EvaluationStatus, detailsEvaluationStatus: EvaluationStatus, qualityEvaluationStatus: EvaluationStatus, fundsStatus: FundsStatus, detailsSet: boolean, shipmentNumber: number, expirationDate: Date, fixingDate: Date, targetExchange: string, differentialApplied: number, price: number, quantity: number, containersNumber: number, netWeight: number, grossWeight: number) {
        this._supplierAddress = supplierAddress;
        this._commissionerAddress = commissionerAddress;
        this._externalUrl = externalUrl;
        this._escrowAddress = escrowAddress;
        this._documentManagerAddress = documentManagerAddress;
        this._sampleEvaluationStatus = sampleEvaluationStatus;
        this._detailsEvaluationStatus = detailsEvaluationStatus;
        this._qualityEvaluationStatus = qualityEvaluationStatus;
        this._fundsStatus = fundsStatus;
        this._detailsSet = detailsSet;
        this._shipmentNumber = shipmentNumber;
        this._expirationDate = expirationDate;
        this._fixingDate = fixingDate;
        this._targetExchange = targetExchange;
        this._differentialApplied = differentialApplied;
        this._price = price;
        this._quantity = quantity;
        this._containersNumber = containersNumber;
        this._netWeight = netWeight;
        this._grossWeight = grossWeight;
    }


    get supplierAddress(): string {
        return this._supplierAddress;
    }

    set supplierAddress(value: string) {
        this._supplierAddress = value;
    }

    get commissionerAddress(): string {
        return this._commissionerAddress;
    }

    set commissionerAddress(value: string) {
        this._commissionerAddress = value;
    }

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get escrowAddress(): string {
        return this._escrowAddress;
    }

    set escrowAddress(value: string) {
        this._escrowAddress = value;
    }

    get documentManagerAddress(): string {
        return this._documentManagerAddress;
    }

    set documentManagerAddress(value: string) {
        this._documentManagerAddress = value;
    }

    get sampleEvaluationStatus(): EvaluationStatus {
        return this._sampleEvaluationStatus;
    }

    set sampleEvaluationStatus(value: EvaluationStatus) {
        this._sampleEvaluationStatus = value;
    }

    get detailsEvaluationStatus(): EvaluationStatus {
        return this._detailsEvaluationStatus;
    }

    set detailsEvaluationStatus(value: EvaluationStatus) {
        this._detailsEvaluationStatus = value;
    }

    get qualityEvaluationStatus(): EvaluationStatus {
        return this._qualityEvaluationStatus;
    }

    set qualityEvaluationStatus(value: EvaluationStatus) {
        this._qualityEvaluationStatus = value;
    }

    get fundsStatus(): FundsStatus {
        return this._fundsStatus;
    }

    set fundsStatus(value: FundsStatus) {
        this._fundsStatus = value;
    }

    get detailsSet(): boolean {
        return this._detailsSet;
    }

    set detailsSet(value: boolean) {
        this._detailsSet = value;
    }

    get shipmentNumber(): number {
        return this._shipmentNumber;
    }

    set shipmentNumber(value: number) {
        this._shipmentNumber = value;
    }

    get expirationDate(): Date {
        return this._expirationDate;
    }

    set expirationDate(value: Date) {
        this._expirationDate = value;
    }

    get fixingDate(): Date {
        return this._fixingDate;
    }

    set fixingDate(value: Date) {
        this._fixingDate = value;
    }

    get targetExchange(): string {
        return this._targetExchange;
    }

    set targetExchange(value: string) {
        this._targetExchange = value;
    }

    get differentialApplied(): number {
        return this._differentialApplied;
    }

    set differentialApplied(value: number) {
        this._differentialApplied = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }

    get containersNumber(): number {
        return this._containersNumber;
    }

    set containersNumber(value: number) {
        this._containersNumber = value;
    }

    get netWeight(): number {
        return this._netWeight;
    }

    set netWeight(value: number) {
        this._netWeight = value;
    }

    get grossWeight(): number {
        return this._grossWeight;
    }

    set grossWeight(value: number) {
        this._grossWeight = value;
    }


}
