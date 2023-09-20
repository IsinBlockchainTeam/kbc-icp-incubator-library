import { IPFSService } from '@blockchain-lib/common';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { TradeDriver, TradeEvents } from '../drivers/TradeDriver';
import { OrderInfo } from '../entities/OrderInfo';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { TradeType } from '../entities/Trade';
import { BasicTrade } from '../entities/BasicTrade';
import { TradeLine } from '../entities/TradeLine';
import { Order } from '../entities/Order';

export class TradeService {
    private _tradeDriver: TradeDriver;

    private readonly _ipfsService?: IPFSService;

    constructor(tradeDriver: TradeDriver, ipfsService?: IPFSService) {
        this._tradeDriver = tradeDriver;
        this._ipfsService = ipfsService;
    }

    async registerTrade(tradeType: TradeType, supplierAddress: string, customerAddress: string, name: string, externalUrl?: string): Promise<void> {
        await this._tradeDriver.registerTrade(tradeType, supplierAddress, customerAddress, name, externalUrl);
    }

    async tradeExists(supplierAddress: string, orderId: number): Promise<boolean> {
        return this._tradeDriver.tradeExists(supplierAddress, orderId);
    }

    async getTradeInfo(supplierAddress: string, tradeId: number, blockNumber?: number): Promise<BasicTrade> {
        return this._tradeDriver.getTradeInfo(supplierAddress, tradeId, blockNumber);
    }

    async getTradeCounter(supplierAddress: string): Promise<number> {
        return this._tradeDriver.getTradeCounter(supplierAddress);
    }

    async addTradeLine(supplierAddress: string, tradeId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        await this._tradeDriver.addTradeLine(supplierAddress, tradeId, materialIds, productCategory);
    }

    async addTradeLines(supplierAddress: string, tradeId: number, lines: TradeLine[]): Promise<void> {
        await this._tradeDriver.addTradeLines(supplierAddress, tradeId, lines);
    }

    async updateTradeLine(supplierAddress: string, tradeId: number, tradeLineId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        await this._tradeDriver.updateTradeLine(supplierAddress, tradeId, tradeLineId, materialIds, productCategory);
    }

    async getTradeLine(supplierAddress: string, tradeId: number, tradeLineId: number): Promise<TradeLine> {
        return this._tradeDriver.getTradeLine(supplierAddress, tradeId, tradeLineId);
    }

    async getTradeLines(supplierAddress: string, tradeId: number) : Promise<TradeLine[]> {
        const trade = await this.getTradeInfo(supplierAddress, tradeId);
        return Promise.all(trade.lineIds.map(async (lineId) => this.getTradeLine(supplierAddress, tradeId, lineId)));
    }

    async tradeLineExists(supplierAddress: string, tradeId: number, tradeLineId: number): Promise<boolean> {
        return this._tradeDriver.tradeLineExists(supplierAddress, tradeId, tradeLineId);
    }

    async addOrderOfferee(supplierAddress: string, orderId: number, offeree: string): Promise<void> {
        await this._tradeDriver.addOrderOfferee(supplierAddress, orderId, offeree);
    }

    async setOrderPaymentDeadline(supplierAddress: string, id: number, paymentDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderPaymentDeadline(supplierAddress, id, paymentDeadline);
    }

    async setOrderDocumentDeliveryDeadline(supplierAddress: string, id: number, documentDeliveryDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderDocumentDeliveryDeadline(supplierAddress, id, documentDeliveryDeadline);
    }

    async setOrderArbiter(supplierAddress: string, id: number, arbiter: string): Promise<void> {
        await this._tradeDriver.setOrderArbiter(supplierAddress, id, arbiter);
    }

    async setOrderShippingDeadline(supplierAddress: string, id: number, shippingDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderShippingDeadline(supplierAddress, id, shippingDeadline);
    }

    async setOrderDeliveryDeadline(supplierAddress: string, id: number, deliveryDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderDeliveryDeadline(supplierAddress, id, deliveryDeadline);
    }

    async confirmOrder(supplierAddress: string, orderId: number): Promise<void> {
        await this._tradeDriver.confirmOrder(supplierAddress, orderId);
    }

    async addDocument(supplierAddress: string, orderId: number, documentName: string, documentType: string, documentExternalUrl: string): Promise<void> {
        await this._tradeDriver.addDocument(supplierAddress, orderId, documentName, documentType, documentExternalUrl);
    }

    async getNegotiationStatus(supplierAddress: string, orderId: number): Promise<NegotiationStatus> {
        return this._tradeDriver.getNegotiationStatus(supplierAddress, orderId);
    }

    async getOrderInfo(supplierAddress: string, id: number, blockNumber?: number): Promise<OrderInfo> {
        return this._tradeDriver.getOrderInfo(supplierAddress, id, blockNumber);
    }

    async getCompleteOrder(orderInfo: OrderInfo): Promise<Order | undefined> {
        if (!this._ipfsService) throw new Error('IPFS Service not available');
        try {
            const { incoterms, shipper, shippingPort, deliveryPort } = await this._ipfsService!.retrieveJSON(orderInfo.externalUrl);
            return new Order(orderInfo, incoterms, shipper, shippingPort, deliveryPort);
        } catch (e) {
            console.error('Error while retrieve order metadata file from IPFS: ', e);
        }
        return undefined;
    }

    async isSupplierOrCustomer(supplierAddress: string, id: number, senderAddress: string): Promise<boolean> {
        return this._tradeDriver.isSupplierOrCustomer(supplierAddress, id, senderAddress);
    }

    async addOrderLine(supplierAddress: string, orderId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        await this._tradeDriver.addOrderLine(supplierAddress, orderId, materialIds, productCategory, quantity, price);
    }

    async addOrderLines(supplierAddress: string, orderId: number, lines: OrderLine[]): Promise<void> {
        await this._tradeDriver.addOrderLines(supplierAddress, orderId, lines);
    }

    async updateOrderLine(supplierAddress: string, orderId: number, orderLineId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        await this._tradeDriver.updateOrderLine(supplierAddress, orderId, orderLineId, materialIds, productCategory, quantity, price);
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        return this._tradeDriver.getOrderLine(supplierAddress, orderId, orderLineId, blockNumber);
    }

    async getOrderLines(supplierAddress: string, orderId: number) : Promise<OrderLine[]> {
        const order = await this.getOrderInfo(supplierAddress, orderId);
        return Promise.all(order.lineIds.map(async (lineId) => this.getOrderLine(supplierAddress, orderId, lineId)));
    }

    async getOrders(supplierAddress: string): Promise<OrderInfo[]> {
        const orders: OrderInfo[] = [];
        const orderCounter = await this.getTradeCounter(supplierAddress);
        for (let i = 1; i <= orderCounter; i++) {
            orders.push(await this.getOrderInfo(supplierAddress, i));
        }
        return orders;
    }

    async getBlockNumbersByOrderId(id: number): Promise<Map<TradeEvents, number[]>> {
        return this._tradeDriver.getBlockNumbersByTradeId(id);
    }

    async addAdmin(address: string): Promise<void> {
        await this._tradeDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._tradeDriver.removeAdmin(address);
    }
}

export default TradeService;
