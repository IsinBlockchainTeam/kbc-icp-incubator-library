import { TradeService } from './TradeService';
import {
    OrderTradeDriver,
    OrderTradeEvents,
} from '../drivers/OrderTradeDriver';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { OrderLine, OrderLinePrice } from '../entities/OrderTrade';

// TODO: Add logic for storing metadata on Solid
export class OrderTradeService extends TradeService {
    async getLines(): Promise<OrderLine[]> {
        return this._tradeDriverImplementation.getLines();
    }

    async getLine(id: number, blockNumber?: number): Promise<OrderLine> {
        return this._tradeDriverImplementation.getLine(id, blockNumber);
    }

    async getOrderTrade(blockNumber?: number): Promise<{ tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lineIds: number[], hasSupplierSigned: boolean, hasCommissionerSigned: boolean, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, escrow: string}> {
        return this._tradeDriverImplementation.getOrderTrade(blockNumber);
    }

    async addOrderLine(materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        return this._tradeDriverImplementation.addOrderLine(materialIds, productCategory, quantity, price);
    }

    async updateOrderLine(id: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        return this._tradeDriverImplementation.updateOrderLine(id, materialIds, productCategory, quantity, price);
    }

    async getNegotiationStatus(): Promise<NegotiationStatus> {
        return this._tradeDriverImplementation.getNegotiationStatus();
    }

    async updatePaymentDeadline(paymentDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updatePaymentDeadline(paymentDeadline);
    }

    async updateDocumentDeliveryDeadline(documentDeliveryDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updateDocumentDeliveryDeadline(documentDeliveryDeadline);
    }

    async updateArbiter(arbiter: string): Promise<void> {
        return this._tradeDriverImplementation.updateArbiter(arbiter);
    }

    async updateShippingDeadline(shippingDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updateShippingDeadline(shippingDeadline);
    }

    async updateDeliveryDeadline(deliveryDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updateDeliveryDeadline(deliveryDeadline);
    }

    async confirmOrder(): Promise<void> {
        return this._tradeDriverImplementation.confirmOrder();
    }

    async getEmittedEvents(): Promise<Map<OrderTradeEvents, number[]>> {
        return this._tradeDriverImplementation.getEmittedEvents();
    }

    private get _tradeDriverImplementation(): OrderTradeDriver {
        return this._tradeDriver as OrderTradeDriver;
    }
}
