import { IPFSService } from '@blockchain-lib/common';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { TradeDriver, TradeEvents } from '../drivers/TradeDriver';
import { OrderInfo } from '../entities/OrderInfo';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { BasicTradeInfo } from '../entities/BasicTradeInfo';
import { TradeLine } from '../entities/TradeLine';
import { Order } from '../entities/Order';
import { BasicTrade } from '../entities/BasicTrade';
import { serial } from '../utils/utils';
import { Trade } from '../entities/Trade';

export class TradeService {
    private _tradeDriver: TradeDriver;

    private readonly _ipfsService?: IPFSService;

    constructor(tradeDriver: TradeDriver, ipfsService?: IPFSService) {
        this._tradeDriver = tradeDriver;
        this._ipfsService = ipfsService;
    }

    async registerBasicTrade(supplierAddress: string, customerAddress: string, name: string, externalUrl?: string): Promise<void> {
        await this._tradeDriver.registerBasicTrade(supplierAddress, customerAddress, name, externalUrl);
    }

    async tradeExists(tradeId: number): Promise<boolean> {
        return this._tradeDriver.tradeExists(tradeId);
    }

    async getCounter(): Promise<number> {
        return this._tradeDriver.getCounter();
    }

    async getGeneralTrade(tradeId: number, blockNumber?: number): Promise<Trade> {
        return this._tradeDriver.getGeneralTrade(tradeId, blockNumber);
    }

    async getBasicTradeInfo(tradeId: number, blockNumber?: number): Promise<BasicTradeInfo> {
        return this._tradeDriver.getBasicTradeInfo(tradeId, blockNumber);
    }

    async getCompleteBasicTrade(basicTradeInfo: BasicTradeInfo): Promise<BasicTrade | undefined> {
        if (!this._ipfsService) throw new Error('IPFS Service not available');
        try {
            const { issueDate } = await this._ipfsService!.retrieveJSON(basicTradeInfo.externalUrl);
            return new BasicTrade(basicTradeInfo, new Date(issueDate));
        } catch (e) {
            console.error('Error while retrieve basic trade metadata file from IPFS: ', e);
        }
        return undefined;
    }

    async getTradeIds(supplierAddress: string): Promise<number[]> {
        return this._tradeDriver.getTradeIds(supplierAddress);
    }

    async getGeneralTrades(supplierAddress: string): Promise<Trade[]> {
        const trades: Trade[] = [];
        const tradeIds = await this.getTradeIds(supplierAddress);
        for (let i = 0; i < tradeIds.length; i++)
            trades.push(await this.getGeneralTrade(tradeIds[i]));
        return trades;
    }

    async addTradeLine(tradeId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        await this._tradeDriver.addTradeLine(tradeId, materialIds, productCategory);
    }

    async addTradeLines(tradeId: number, lines: TradeLine[]): Promise<void> {
        const tradeLineFunctions = lines.map((line) => async () => {
            await this.addTradeLine(tradeId, line.materialIds, line.productCategory);
        });
        await serial(tradeLineFunctions);
    }

    async updateTradeLine(tradeId: number, tradeLineId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        await this._tradeDriver.updateTradeLine(tradeId, tradeLineId, materialIds, productCategory);
    }

    async getTradeLine(tradeId: number, tradeLineId: number): Promise<TradeLine> {
        return this._tradeDriver.getTradeLine(tradeId, tradeLineId);
    }

    async getTradeLines(tradeId: number) : Promise<TradeLine[]> {
        const trade = await this.getBasicTradeInfo(tradeId);
        return Promise.all(trade.lineIds.map(async (lineId) => this.getTradeLine(tradeId, lineId)));
    }

    async tradeLineExists(tradeId: number, tradeLineId: number): Promise<boolean> {
        return this._tradeDriver.tradeLineExists(tradeId, tradeLineId);
    }

    async registerOrder(supplierAddress: string, customerAddress: string, externalUrl?: string): Promise<void> {
        await this._tradeDriver.registerOrder(supplierAddress, customerAddress, externalUrl);
    }

    async addOrderOfferee(orderId: number, offeree: string): Promise<void> {
        await this._tradeDriver.addOrderOfferee(orderId, offeree);
    }

    async setOrderPaymentDeadline(id: number, paymentDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderPaymentDeadline(id, paymentDeadline);
    }

    async setOrderDocumentDeliveryDeadline(id: number, documentDeliveryDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderDocumentDeliveryDeadline(id, documentDeliveryDeadline);
    }

    async setOrderArbiter(id: number, arbiter: string): Promise<void> {
        await this._tradeDriver.setOrderArbiter(id, arbiter);
    }

    async setOrderShippingDeadline(id: number, shippingDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderShippingDeadline(id, shippingDeadline);
    }

    async setOrderDeliveryDeadline(id: number, deliveryDeadline: Date): Promise<void> {
        await this._tradeDriver.setOrderDeliveryDeadline(id, deliveryDeadline);
    }

    async confirmOrder(orderId: number): Promise<void> {
        await this._tradeDriver.confirmOrder(orderId);
    }

    async addDocument(orderId: number, documentName: string, documentType: string, documentExternalUrl: string): Promise<void> {
        await this._tradeDriver.addDocument(orderId, documentName, documentType, documentExternalUrl);
    }

    async getNegotiationStatus(orderId: number): Promise<NegotiationStatus> {
        return this._tradeDriver.getNegotiationStatus(orderId);
    }

    async getOrderInfo(id: number, blockNumber?: number): Promise<OrderInfo> {
        return this._tradeDriver.getOrderInfo(id, blockNumber);
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

    async isSupplierOrCustomer(id: number, senderAddress: string): Promise<boolean> {
        return this._tradeDriver.isSupplierOrCustomer(id, senderAddress);
    }

    async addOrderLine(orderId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        await this._tradeDriver.addOrderLine(orderId, materialIds, productCategory, quantity, price);
    }

    async addOrderLines(orderId: number, lines: OrderLine[]): Promise<void> {
        const orderLineFunctions = lines.map((line) => async () => {
            await this.addOrderLine(orderId, line.materialIds, line.productCategory, line.quantity, line.price);
        });
        await serial(orderLineFunctions);
    }

    async updateOrderLine(orderId: number, orderLineId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        await this._tradeDriver.updateOrderLine(orderId, orderLineId, materialIds, productCategory, quantity, price);
    }

    async getOrderLine(orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        return this._tradeDriver.getOrderLine(orderId, orderLineId, blockNumber);
    }

    async getOrderLines(orderId: number) : Promise<OrderLine[]> {
        const order = await this.getOrderInfo(orderId);
        return Promise.all(order.lineIds.map(async (lineId) => this.getOrderLine(orderId, lineId)));
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
