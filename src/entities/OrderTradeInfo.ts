import { Line, LineRequest, Trade } from './Trade';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';
import { NegotiationStatus } from '../types/NegotiationStatus';

export class OrderLinePrice {
    private _amount: number;

    private _fiat: string;

    constructor(amount: number, fiat: string) {
        this._amount = amount;
        this._fiat = fiat;
    }

    get amount(): number {
        return this._amount;
    }

    set amount(value: number) {
        this._amount = value;
    }

    get fiat(): string {
        return this._fiat;
    }

    set fiat(value: string) {
        this._fiat = value;
    }
}

export class OrderLineRequest extends LineRequest {
    private _price: OrderLinePrice;

    constructor(productCategoryId: number, quantity: number, unit: string, price: OrderLinePrice, oldId?: number) {
        super(productCategoryId, quantity, unit, oldId);
        this._price = price;
    }

    get price(): OrderLinePrice {
        return this._price;
    }

    set price(value: OrderLinePrice) {
        this._price = value;
    }
}

export class OrderLine extends Line {
    private _price: OrderLinePrice;

    constructor(id: number, material: Material | undefined, productCategory: ProductCategory, quantity: number, unit: string, price: OrderLinePrice) {
        super(id, material, productCategory, quantity, unit);
        this._price = price;
    }

    get price(): OrderLinePrice {
        return this._price;
    }

    set price(value: OrderLinePrice) {
        this._price = value;
    }
}

export class OrderTradeInfo extends Trade {
    private _hasSupplierSigned: boolean;

    private _hasCommissionerSigned: boolean;

    private _paymentDeadline: number;

    private _documentDeliveryDeadline: number;

    private _arbiter: string;

    private _shippingDeadline: number;

    private _deliveryDeadline: number;

    private _escrow?: string;

    private _negotiationStatus: NegotiationStatus;

    private _agreedAmount: number;

    private _tokenAddress: string;

    constructor(
        tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: OrderLine[],
        hasSupplierSigned: boolean,
        hasCommissionerSigned: boolean,
        paymentDeadline: number,
        documentDeliveryDeadline: number,
        arbiter: string,
        shippingDeadline: number,
        deliveryDeadline: number,
        negotiationStatus: NegotiationStatus,
        agreedAmount: number,
        tokenAddress: string,
        escrow?: string,
    ) {
        super(tradeId, supplier, customer, commissioner, externalUrl, lines);
        this._hasSupplierSigned = hasSupplierSigned;
        this._hasCommissionerSigned = hasCommissionerSigned;
        this._paymentDeadline = paymentDeadline;
        this._documentDeliveryDeadline = documentDeliveryDeadline;
        this._arbiter = arbiter;
        this._shippingDeadline = shippingDeadline;
        this._deliveryDeadline = deliveryDeadline;
        this._negotiationStatus = negotiationStatus;
        this._agreedAmount = agreedAmount;
        this._tokenAddress = tokenAddress;
        this._escrow = escrow;
    }

    get hasSupplierSigned(): boolean {
        return this._hasSupplierSigned;
    }

    set hasSupplierSigned(value: boolean) {
        this._hasSupplierSigned = value;
    }

    get hasCommissionerSigned(): boolean {
        return this._hasCommissionerSigned;
    }

    set hasCommissionerSigned(value: boolean) {
        this._hasCommissionerSigned = value;
    }

    get paymentDeadline(): number {
        return this._paymentDeadline;
    }

    set paymentDeadline(value: number) {
        this._paymentDeadline = value;
    }

    get documentDeliveryDeadline(): number {
        return this._documentDeliveryDeadline;
    }

    set documentDeliveryDeadline(value: number) {
        this._documentDeliveryDeadline = value;
    }

    get arbiter(): string {
        return this._arbiter;
    }

    set arbiter(value: string) {
        this._arbiter = value;
    }

    get shippingDeadline(): number {
        return this._shippingDeadline;
    }

    set shippingDeadline(value: number) {
        this._shippingDeadline = value;
    }

    get deliveryDeadline(): number {
        return this._deliveryDeadline;
    }

    set deliveryDeadline(value: number) {
        this._deliveryDeadline = value;
    }

    get escrow(): string | undefined {
        return this._escrow;
    }

    set escrow(value: string | undefined) {
        this._escrow = value;
    }

    get negotiationStatus(): NegotiationStatus {
        return this._negotiationStatus;
    }

    set negotiationStatus(value: NegotiationStatus) {
        this._negotiationStatus = value;
    }

    get agreedAmount(): number {
        return this._agreedAmount;
    }

    set agreedAmount(value: number) {
        this._agreedAmount = value;
    }

    get tokenAddress(): string {
        return this._tokenAddress;
    }

    set tokenAddress(value: string) {
        this._tokenAddress = value;
    }
}
