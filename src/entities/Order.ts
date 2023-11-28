import { OrderInfo } from './OrderInfo';

export class Order extends OrderInfo {
    private readonly _incoterms: string;

    private readonly _shipper: string;

    private readonly _shippingPort: string;

    private readonly _deliveryPort: string;

    constructor(orderInfo: OrderInfo, incoterms: string, shipper: string, shippingPort: string, deliveryPort: string) {
        super(orderInfo.id, orderInfo.supplier, orderInfo.customer, orderInfo.externalUrl,
            orderInfo.offeree, orderInfo.offeror, orderInfo.lineIds, orderInfo.paymentDeadline || new Date(0),
            orderInfo.documentDeliveryDeadline || new Date(0), orderInfo.arbiter || '',
            orderInfo.shippingDeadline || new Date(0), orderInfo.deliveryDeadline || new Date(0), orderInfo.escrow || '');
        this._incoterms = incoterms;
        this._shipper = shipper;
        this._shippingPort = shippingPort;
        this._deliveryPort = deliveryPort;
    }

    get incoterms(): string {
        return this._incoterms;
    }

    get shipper(): string {
        return this._shipper;
    }

    get shippingPort(): string {
        return this._shippingPort;
    }

    get deliveryPort(): string {
        return this._deliveryPort;
    }
}
