import { Line, LineRequest, Trade } from './Trade';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';

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
    private _quantity: number;

    private _price: OrderLinePrice;

    constructor(productCategoryId: number, quantity: number, price: OrderLinePrice) {
        super(productCategoryId);
        this._quantity = quantity;
        this._price = price;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }

    get price(): OrderLinePrice {
        return this._price;
    }

    set price(value: OrderLinePrice) {
        this._price = value;
    }
}

export class OrderLine extends Line {
    private _quantity: number;

    private _price: OrderLinePrice;

    constructor(id: number, material: Material | undefined, productCategory: ProductCategory, quantity: number, price: OrderLinePrice) {
        super(id, material, productCategory);
        this._quantity = quantity;
        this._price = price;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
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

    constructor(
        tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: OrderLine[],
        hasSupplierSigned: boolean,
        hasCommissionerSigned: boolean,
        paymentDeadline: number,
        documentDeliveryDeadline: number,
        arbiter: string,
        shippingDeadline: number,
        deliveryDeadline: number,
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
}
