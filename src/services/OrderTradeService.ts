import { FileHelpers } from '@blockchain-lib/common';
import { TradeService } from './TradeService';
import { OrderTradeDriver, OrderTradeEvents } from '../drivers/OrderTradeDriver';
import { NegotiationStatus } from '../types/NegotiationStatus';
import {
    OrderLine,
    OrderLineRequest,
    OrderTrade,
    OrderTradeMetadata
} from '../entities/OrderTrade';
import { IConcreteTradeService } from './IConcreteTradeService';
import { OrderStatus } from '../types/OrderStatus';

export class OrderTradeService extends TradeService implements IConcreteTradeService {
    async getTrade(blockNumber?: number): Promise<OrderTrade> {
        return this._tradeDriverImplementation.getTrade(blockNumber);
    }

    async getCompleteTrade(blockNumber?: number): Promise<OrderTrade> {
        if (!this._icpFileDriver)
            throw new Error('OrderTradeService: ICPFileDriver has not been set');

        const trade = await this._tradeDriverImplementation.getTrade(blockNumber);
        const bytes = await this._icpFileDriver.read(`${trade.externalUrl}/files/metadata.json`);
        trade.metadata = FileHelpers.getObjectFromBytes(bytes) as OrderTradeMetadata;
        return trade;
    }

    async getLines(): Promise<OrderLine[]> {
        return this._tradeDriverImplementation.getLines();
    }

    async getLine(id: number, blockNumber?: number): Promise<OrderLine> {
        return this._tradeDriverImplementation.getLine(id, blockNumber);
    }

    async addLine(line: OrderLineRequest): Promise<number> {
        return this._tradeDriverImplementation.addLine(line);
    }

    async updateLine(line: OrderLine): Promise<void> {
        return this._tradeDriverImplementation.updateLine(line);
    }

    async assignMaterial(lineId: number, materialId: number): Promise<void> {
        return this._tradeDriverImplementation.assignMaterial(lineId, materialId);
    }

    async getNegotiationStatus(): Promise<NegotiationStatus> {
        return this._tradeDriverImplementation.getNegotiationStatus();
    }

    async getOrderStatus(): Promise<OrderStatus> {
        return this._tradeDriverImplementation.getOrderStatus();
    }

    async updatePaymentDeadline(paymentDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updatePaymentDeadline(paymentDeadline);
    }

    async updateDocumentDeliveryDeadline(documentDeliveryDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updateDocumentDeliveryDeadline(
            documentDeliveryDeadline
        );
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

    async updateAgreedAmount(agreedAmount: number): Promise<void> {
        return this._tradeDriverImplementation.updateAgreedAmount(agreedAmount);
    }

    async updateTokenAddress(tokenAddress: string): Promise<void> {
        return this._tradeDriverImplementation.updateTokenAddress(tokenAddress);
    }

    async haveDeadlinesExpired(): Promise<boolean> {
        return this._tradeDriverImplementation.haveDeadlinesExpired();
    }

    async enforceDeadlines(): Promise<void> {
        return this._tradeDriverImplementation.enforceDeadlines();
    }

    async getWhoSigned(): Promise<string[]> {
        return this._tradeDriverImplementation.getWhoSigned();
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
