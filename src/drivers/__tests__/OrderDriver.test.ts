import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { OrderDriver } from '../OrderDriver';
import { EntityBuilder } from '../../utils/EntityBuilder';
import { Order } from '../../entities/Order';
import {mockOrder} from "../../__shared__/constants/mock-data";

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('OrderDriver', () => {
    let orderDriver: OrderDriver;
    const mockOrderParams = mockOrder(0, 1);
    const mockFn = {
        getOrders: jest.fn(),
        getOrder: jest.fn(),
        createOrder: jest.fn(),
        updateOrder: jest.fn(),
        signOrder: jest.fn(),
    };
    const defaultOrder = { id: 0 } as Order;

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getOrders: mockFn.getOrders,
            getOrder: mockFn.getOrder,
            createOrder: mockFn.createOrder,
            updateOrder: mockFn.updateOrder,
            signOrder: mockFn.signOrder,
        });
        jest.spyOn(EntityBuilder, 'buildOrder').mockReturnValue(defaultOrder);
        const icpIdentity = {} as Identity;
        orderDriver = new OrderDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve orders', async () => {
        const rawOrder = { name: 'test', shipmentId: [] };
        mockFn.getOrders.mockReturnValue([rawOrder]);
        await expect(orderDriver.getOrders()).resolves.toEqual([defaultOrder]);
        expect(mockFn.getOrders).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalledWith(rawOrder, null);
    });

    it('should retrieve an order', async () => {
        const rawOrder = { name: 'test', shipmentId: [] };
        mockFn.getOrder.mockReturnValue(rawOrder);
        await expect(orderDriver.getOrder(1)).resolves.toEqual(defaultOrder);
        expect(mockFn.getOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalledWith(rawOrder, null);
    });

    it('should create an order', async () => {
        const rawOrder = { name: 'test', shipmentId: [] };
        mockFn.createOrder.mockReturnValue(rawOrder);
        await expect(orderDriver.createOrder(mockOrderParams)).resolves.toEqual(defaultOrder);
        expect(mockFn.createOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalledWith(rawOrder, null);
    });

    it('should update an order', async () => {
        const rawOrder = { name: 'test', shipmentId: [] };
        mockFn.updateOrder.mockReturnValue(rawOrder);
        await expect(orderDriver.updateOrder(1, mockOrderParams)).resolves.toEqual(defaultOrder);
        expect(mockFn.updateOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalledWith(rawOrder, null);
    });

    it('should sign an order', async () => {
        const rawOrder = { name: 'test', shipmentId: [] };
        mockFn.signOrder.mockReturnValue(rawOrder);
        await expect(orderDriver.signOrder(1)).resolves.toEqual(defaultOrder);
        expect(mockFn.signOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalled();
        expect(EntityBuilder.buildOrder).toHaveBeenCalledWith(rawOrder, null);
    });
});
