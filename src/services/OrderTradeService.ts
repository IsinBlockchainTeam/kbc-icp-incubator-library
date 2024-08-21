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
import { RoleProof } from '../types/RoleProof';

export class OrderTradeService extends TradeService implements IConcreteTradeService {
    async getTrade(roleProof: RoleProof, blockNumber?: number): Promise<OrderTrade> {
        return this._tradeDriverImplementation.getTrade(roleProof, blockNumber);
    }

    async getCompleteTrade(roleProof: RoleProof, blockNumber?: number): Promise<OrderTrade> {
        if (!this._icpFileDriver)
            throw new Error('OrderTradeService: ICPFileDriver has not been set');

        const trade = await this._tradeDriverImplementation.getTrade(roleProof, blockNumber);
        const bytes = await this._icpFileDriver.read(`${trade.externalUrl}/files/metadata.json`);
        trade.metadata = FileHelpers.getObjectFromBytes(bytes) as OrderTradeMetadata;
        return trade;
    }

    async getLines(roleProof: RoleProof): Promise<OrderLine[]> {
        return this._tradeDriverImplementation.getLines(roleProof);
    }

    async getLine(roleProof: RoleProof, id: number, blockNumber?: number): Promise<OrderLine> {
        return this._tradeDriverImplementation.getLine(roleProof, id, blockNumber);
    }

    async addLine(roleProof: RoleProof, line: OrderLineRequest): Promise<number> {
        return this._tradeDriverImplementation.addLine(roleProof, line);
    }

    async updateLine(roleProof: RoleProof, line: OrderLine): Promise<void> {
        return this._tradeDriverImplementation.updateLine(roleProof, line);
    }

    async assignMaterial(roleProof: RoleProof, lineId: number, materialId: number): Promise<void> {
        return this._tradeDriverImplementation.assignMaterial(roleProof, lineId, materialId);
    }

    async getNegotiationStatus(): Promise<NegotiationStatus> {
        return this._tradeDriverImplementation.getNegotiationStatus();
    }

    // TODO: understand if still needed
    // async getOrderStatus(): Promise<OrderStatus> {
    //     return this._tradeDriverImplementation.getOrderStatus();
    // }

    async updatePaymentDeadline(roleProof: RoleProof, paymentDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updatePaymentDeadline(roleProof, paymentDeadline);
    }

    async updateDocumentDeliveryDeadline(
        roleProof: RoleProof,
        documentDeliveryDeadline: number
    ): Promise<void> {
        return this._tradeDriverImplementation.updateDocumentDeliveryDeadline(
            roleProof,
            documentDeliveryDeadline
        );
    }

    async updateArbiter(roleProof: RoleProof, arbiter: string): Promise<void> {
        return this._tradeDriverImplementation.updateArbiter(roleProof, arbiter);
    }

    async updateShippingDeadline(roleProof: RoleProof, shippingDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updateShippingDeadline(roleProof, shippingDeadline);
    }

    async updateDeliveryDeadline(roleProof: RoleProof, deliveryDeadline: number): Promise<void> {
        return this._tradeDriverImplementation.updateDeliveryDeadline(roleProof, deliveryDeadline);
    }

    async updateAgreedAmount(roleProof: RoleProof, agreedAmount: number): Promise<void> {
        return this._tradeDriverImplementation.updateAgreedAmount(roleProof, agreedAmount);
    }

    async updateTokenAddress(roleProof: RoleProof, tokenAddress: string): Promise<void> {
        return this._tradeDriverImplementation.updateTokenAddress(roleProof, tokenAddress);
    }

    async haveDeadlinesExpired(): Promise<boolean> {
        return this._tradeDriverImplementation.haveDeadlinesExpired();
    }

    async enforceDeadlines(): Promise<void> {
        return this._tradeDriverImplementation.enforceDeadlines();
    }

    async getWhoSigned(roleProof: RoleProof): Promise<string[]> {
        return this._tradeDriverImplementation.getWhoSigned(roleProof);
    }

    async confirmOrder(roleProof: RoleProof): Promise<void> {
        return this._tradeDriverImplementation.confirmOrder(roleProof);
    }

    async getEmittedEvents(): Promise<Map<OrderTradeEvents, number[]>> {
        return this._tradeDriverImplementation.getEmittedEvents();
    }

    private get _tradeDriverImplementation(): OrderTradeDriver {
        return this._tradeDriver as OrderTradeDriver;
    }
}
