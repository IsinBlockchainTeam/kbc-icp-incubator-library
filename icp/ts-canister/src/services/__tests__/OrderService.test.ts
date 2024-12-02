import OrderService from "../OrderService";
import {Order, ROLES, Shipment} from "../../models/types";
import {StableBTreeMap} from "azle";
import AuthenticationService from "../AuthenticationService";
import {validateAddress, validateDeadline, validateInterestedParty} from "../../utils/validation";
import ShipmentService from "../ShipmentService";
import {
    OrderAlreadyConfirmedError,
    OrderNotFoundError,
    OrderWithNoChangesError,
    SameActorsError
} from "../../models/errors";

jest.mock('azle');
jest.mock('../../services/AuthenticationService', () => {
    return {
        instance: {
            getDelegatorAddress: jest.fn(),
            getRole: jest.fn()
        }
    };
});
jest.mock('../../services/ShipmentService', () => {
    return {
        instance: {
            createShipment: jest.fn(),
        }
    };
});
jest.mock('../../services/ProductCategoryService', () => {
    return {
        instance: {
            getProductCategory: jest.fn(),
        }
    };
});
jest.mock('../../utils/validation', () => {
    return {
        validateAddress: jest.fn(),
        validateDeadline: jest.fn(),
        validateInterestedParty: jest.fn(),
        validatePositiveNumber: jest.fn()
    };
});
describe("OrderService", () => {
    let orderService: OrderService;
    let authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;
    let shipmentServiceInstanceMock = ShipmentService.instance as jest.Mocked<ShipmentService>;
    const order = {
        id: 0n,
        supplier: '0xsupplier',
        customer: '0xcustomer',
        commissioner: '0xcommissioner',
        status: { PENDING: null},
        signatures: ['0xsupplier'],
        paymentDeadline: 1n,
        documentDeliveryDeadline: 2n,
        shippingDeadline: 3n,
        deliveryDeadline: 4n,
        arbiter: '0xarbiter',
        incoterms: 'incoterms',
        shipper: '0xshipper',
        shippingPort: 'shippingPort',
        deliveryPort: 'deliveryPort',
        lines: [],
        token: '0xtoken',
        agreedAmount: 5n,
        shipment: []
    } as Order;

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert
        });
        orderService = OrderService.instance;
    });

    it("retrieves interested parties", () => {
        const response = {id: 1n, supplier: '0xsupplier', customer: '0xcustomer', commissioner: '0xcommissioner'} as Order;
        mockedFn.get.mockReturnValue(response);
        expect(orderService.getInterestedParties(1n)).toEqual(['0xsupplier', '0xcustomer', '0xcommissioner']);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => orderService.getInterestedParties(1n)).toThrow(OrderNotFoundError);
    });

    it("retrieves all orders", () => {
        const expectedResponse = [{id: 1n} as Order];
        mockedFn.values.mockReturnValue(expectedResponse);
        expect(orderService.getOrders()).toEqual(expectedResponse);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it("retrieves a order by id", () => {
        const expectedResponse = {id: 1n} as Order;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(orderService.getOrder(1n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => orderService.getOrder(1n)).toThrow(OrderNotFoundError);
    });

    it("creates a order", () => {
        const delegatorAddress = '0xsupplier';
        const role = ROLES.SIGNER;
        (validateAddress as jest.Mock).mockReturnValue(true);
        (validateInterestedParty as jest.Mock).mockReturnValue(true);
        (validateDeadline as jest.Mock).mockReturnValue(true);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(delegatorAddress);
        authenticationServiceInstanceMock.getRole.mockReturnValue(role);
        mockedFn.keys.mockReturnValue([]);
        expect(orderService.createOrder(
            order.supplier,
            order.customer,
            order.commissioner,
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toEqual(order);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        expect(() => orderService.createOrder(
            order.supplier,
            order.supplier,
            order.commissioner,
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toThrow(SameActorsError);
        (validateAddress as jest.Mock).mockImplementation(() => {throw new Error('Invalid address')});
        expect(() => orderService.createOrder(
            order.supplier,
            order.customer,
            order.commissioner,
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toThrow(new Error('Invalid address'));
    });

    it("updates a order", () => {
        const delegatorAddress = '0xsupplier';
        const role = ROLES.SIGNER;
        (validateAddress as jest.Mock).mockReturnValue(true);
        (validateInterestedParty as jest.Mock).mockReturnValue(true);
        (validateDeadline as jest.Mock).mockReturnValue(true);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(delegatorAddress);
        authenticationServiceInstanceMock.getRole.mockReturnValue(role);
        mockedFn.get.mockReturnValue(order);
        expect(orderService.updateOrder(
            0n,
            order.supplier,
            order.customer,
            order.commissioner + 'changed',
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toEqual({...order, commissioner: order.commissioner + 'changed'});
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => orderService.updateOrder(
            0n,
            order.supplier,
            order.customer,
            order.commissioner,
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toThrow(OrderNotFoundError);
        mockedFn.get.mockReturnValue(order);
        expect(() => orderService.updateOrder(
            0n,
            order.supplier,
            order.customer,
            order.commissioner,
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toThrow(OrderWithNoChangesError);
        expect(() => orderService.updateOrder(
            0n,
            order.supplier,
            order.supplier,
            order.commissioner + 'changed',
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toThrow(SameActorsError);
        (validateAddress as jest.Mock).mockImplementation(() => {throw new Error('Invalid address')});
        expect(() => orderService.updateOrder(
            0n,
            order.supplier,
            order.customer,
            order.commissioner + 'changed',
            order.paymentDeadline,
            order.documentDeliveryDeadline,
            order.shippingDeadline,
            order.deliveryDeadline,
            order.arbiter,
            order.token,
            order.agreedAmount,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            []
        )).toThrow(new Error('Invalid address'));
    });

    it("signs a order", async () => {
        const delegatorAddress = '0xcustomer';
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(delegatorAddress);
        mockedFn.get.mockReturnValue(order);
        shipmentServiceInstanceMock.createShipment.mockResolvedValue({id: 1n} as Shipment);
        const resp = await orderService.signOrder(0n);
        expect(resp).toEqual({...order, status: { CONFIRMED: null }});
        expect(mockedFn.insert).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        await expect(() => orderService.signOrder(0n)).rejects.toThrow(OrderNotFoundError);
        mockedFn.get.mockReturnValue(order);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue('0xsupplier');
        await expect(() => orderService.signOrder(0n)).rejects.toThrow(OrderAlreadyConfirmedError);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue('0xother');
    });
});
