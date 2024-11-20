import { PhaseEnum as Phase, FundStatusEnum as FundStatus } from '@isinblockchainteam/azle-types';
import { DocumentInfo, DocumentType } from './Document';
import { EvaluationStatus } from './Evaluation';

export { Phase, FundStatus };

export class Shipment {
    private _id: number;

    private _supplier: string;

    private _commissioner: string;

    private _escrowAddress: string | undefined;

    private _sampleEvaluationStatus: EvaluationStatus;

    private _detailsEvaluationStatus: EvaluationStatus;

    private _qualityEvaluationStatus: EvaluationStatus;

    private _fundsStatus: FundStatus;

    private _detailsSet: boolean;

    private _sampleApprovalRequired: boolean;

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

    private _documents: Map<DocumentType, DocumentInfo[]>;

    constructor(
        id: number,
        supplier: string,
        commissioner: string,
        escrowAddress: string | undefined,
        sampleEvaluationStatus: EvaluationStatus,
        detailsEvaluationStatus: EvaluationStatus,
        qualityEvaluationStatus: EvaluationStatus,
        fundsStatus: FundStatus,
        detailsSet: boolean,
        sampleApprovalRequired: boolean,
        shipmentNumber: number,
        expirationDate: Date,
        fixingDate: Date,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number,
        documents: Map<DocumentType, DocumentInfo[]>
    ) {
        this._id = id;
        this._supplier = supplier;
        this._commissioner = commissioner;
        this._escrowAddress = escrowAddress;
        this._sampleEvaluationStatus = sampleEvaluationStatus;
        this._detailsEvaluationStatus = detailsEvaluationStatus;
        this._qualityEvaluationStatus = qualityEvaluationStatus;
        this._fundsStatus = fundsStatus;
        this._detailsSet = detailsSet;
        this._sampleApprovalRequired = sampleApprovalRequired;
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
        this._documents = documents;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get supplier(): string {
        return this._supplier;
    }

    set supplier(value: string) {
        this._supplier = value;
    }

    get commissioner(): string {
        return this._commissioner;
    }

    set commissioner(value: string) {
        this._commissioner = value;
    }

    get escrowAddress(): string | undefined {
        return this._escrowAddress;
    }

    set escrowAddress(value: string | undefined) {
        this._escrowAddress = value;
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

    get fundsStatus(): FundStatus {
        return this._fundsStatus;
    }

    set fundsStatus(value: FundStatus) {
        this._fundsStatus = value;
    }

    get detailsSet(): boolean {
        return this._detailsSet;
    }

    set detailsSet(value: boolean) {
        this._detailsSet = value;
    }

    get sampleApprovalRequired(): boolean {
        return this._sampleApprovalRequired;
    }

    set sampleApprovalRequired(value: boolean) {
        this._sampleApprovalRequired = value;
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

    get documents(): Map<DocumentType, DocumentInfo[]> {
        return this._documents;
    }

    set documents(value: Map<DocumentType, DocumentInfo[]>) {
        this._documents = value;
    }
}
