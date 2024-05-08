import { OrderLine, OrderTradeInfo } from './OrderTradeInfo';

export class OrderTrade extends OrderTradeInfo {
    private _incoterms: string;

    private _shipper: string;

    private _shippingPort: string;

    private _deliveryPort: string;

    constructor(orderTradeInfo: OrderTradeInfo, incoterms: string, shipper: string, shippingPort: string, deliveryPort: string) {
        super(orderTradeInfo.tradeId, orderTradeInfo.supplier, orderTradeInfo.customer, orderTradeInfo.commissioner, orderTradeInfo.externalUrl, orderTradeInfo.lines as OrderLine[],
            orderTradeInfo.hasSupplierSigned, orderTradeInfo.hasCommissionerSigned, orderTradeInfo.paymentDeadline, orderTradeInfo.documentDeliveryDeadline,
            orderTradeInfo.arbiter, orderTradeInfo.shippingDeadline, orderTradeInfo.deliveryDeadline, orderTradeInfo.escrow, orderTradeInfo.negotiationStatus,
        );
        this._incoterms = incoterms;
        this._shipper = shipper;
        this._shippingPort = shippingPort;
        this._deliveryPort = deliveryPort;
    }

    get incoterms(): string {
        return this._incoterms;
    }

    set incoterms(value: string) {
        this._incoterms = value;
    }

    get shipper(): string {
        return this._shipper;
    }

    set shipper(value: string) {
        this._shipper = value;
    }

    get shippingPort(): string {
        return this._shippingPort;
    }

    set shippingPort(value: string) {
        this._shippingPort = value;
    }

    get deliveryPort(): string {
        return this._deliveryPort;
    }

    set deliveryPort(value: string) {
        this._deliveryPort = value;
    }
}
