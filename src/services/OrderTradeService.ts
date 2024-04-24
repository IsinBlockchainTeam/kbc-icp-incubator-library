import {TradeService} from './TradeService';
import {
    OrderTradeDriver,
    OrderTradeEvents,
} from '../drivers/OrderTradeDriver';
import {NegotiationStatus} from '../types/NegotiationStatus';
import {
    OrderLine,
    OrderLineRequest,
    OrderTrade, OrderTradeMetadata
} from '../entities/OrderTrade';
import {IConcreteTradeService} from './IConcreteTradeService';
import {ICPResourceSpec} from "@blockchain-lib/common";

export class OrderTradeService extends TradeService implements IConcreteTradeService {
    async getTrade(resourceSpec?: ICPResourceSpec, blockNumber?: number): Promise<OrderTrade> {
        if (!this._storageMetadataDriver)
            throw new Error('OrderTradeService: Storage metadata driver has not been set');
        if (!resourceSpec)
            throw new Error('OrderTradeService: resourceSpec is required');

        const metadata = (await this._storageMetadataDriver.read(resourceSpec)) as OrderTradeMetadata;
        const trade = await this._tradeDriverImplementation.getTrade(blockNumber);
        trade.metadata = metadata;
        return trade;
    }

    // async getCompleteTrade(metadataSpec: MS, blockNumber?: number): Promise<OrderTradeInfo> {
    //     // if (!this._storageMetadataDriver) throw new Error('Storage metadata driver is not available');
    //     const orderTradeInfo = await this.getTrade(blockNumber);
    //     // try {
    //     //     const { incoterms, shipper, shippingPort, deliveryPort } = await this._storageMetadataDriver.read(StorageOperationType.TRANSACTION, metadataSpec);
    //     //     return new OrderTrade(orderTradeInfo, incoterms, shipper, shippingPort, deliveryPort);
    //     // } catch (e: any) {
    //     //     throw new Error(`Error while retrieve order trade from external storage: ${e.message}`);
    //     // }
    //     return orderTradeInfo;
    // }

    async getLines(): Promise<OrderLine[]> {
        return this._tradeDriverImplementation.getLines();
    }

    async getLine(id: number, blockNumber?: number): Promise<OrderLine> {
        return this._tradeDriverImplementation.getLine(id, blockNumber);
    }

    async addLine(line: OrderLineRequest): Promise<OrderLine> {
        return this._tradeDriverImplementation.addLine(line);
    }

    async updateLine(line: OrderLine): Promise<OrderLine> {
        return this._tradeDriverImplementation.updateLine(line);
    }

    async assignMaterial(lineId: number, materialId: number): Promise<void> {
        return this._tradeDriverImplementation.assignMaterial(lineId, materialId);
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

    async haveDeadlinesExpired(): Promise<boolean> {
        return this._tradeDriverImplementation.haveDeadlinesExpired();
    }

    async enforceDeadlines(): Promise<void> {
        return this._tradeDriverImplementation.enforceDeadlines();
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
