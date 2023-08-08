import { createMock } from 'ts-auto-mock';
import ContractService from './ContractService';
import { OrderDriver } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';
import { OrderLine } from '../entities/OrderLine';

describe('ContractService', () => {
    let contractService: ContractService;

    let mockedContractDriver: OrderDriver;

    const mockedRegisterContract = jest.fn();
    const mockedGetContractCounter = jest.fn();
    const mockedGetContractInfo = jest.fn();
    const mockedIsSupplierOrCustomer = jest.fn();
    const mockedContractExists = jest.fn();
    const mockedGetContractStatus = jest.fn();
    const mockedConfirmContract = jest.fn();
    const mockedGetContractLine = jest.fn();
    const mockedAddContractLine = jest.fn();
    const mockedUpdateContractLine = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();

    const supplier = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const customer = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

    const contract = new Order(supplier, customer, 'externalUrl', customer);
    const contractLine = new OrderLine(0, 'categoryA', 100, {
        amount: 100,
        fiat: 'CHF',
    });

    beforeAll(() => {
        mockedContractDriver = createMock<OrderDriver>({
            registerContract: mockedRegisterContract,
            getContractCounter: mockedGetContractCounter,
            getContractInfo: mockedGetContractInfo,
            isSupplierOrCustomer: mockedIsSupplierOrCustomer,
            contractExists: mockedContractExists,
            getContractStatus: mockedGetContractStatus,
            confirmContract: mockedConfirmContract,
            getContractLine: mockedGetContractLine,
            addContractLine: mockedAddContractLine,
            updateContractLine: mockedUpdateContractLine,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
        });

        contractService = new ContractService(
            mockedContractDriver,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerContract',
            serviceFunction: () => contractService.registerContract(contract),
            expectedMockedFunction: mockedRegisterContract,
            expectedMockedFunctionArgs: [contract],
        },
        {
            serviceFunctionName: 'getContractCounter',
            serviceFunction: () => contractService.getContractCounter(supplier),
            expectedMockedFunction: mockedGetContractCounter,
            expectedMockedFunctionArgs: [supplier],
        },
        {
            serviceFunctionName: 'getContractInfo',
            serviceFunction: () => contractService.getContractInfo(supplier, 0),
            expectedMockedFunction: mockedGetContractInfo,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'isSupplierOrCustomer',
            serviceFunction: () => contractService.isSupplierOrCustomer(supplier, 0, customer),
            expectedMockedFunction: mockedIsSupplierOrCustomer,
            expectedMockedFunctionArgs: [supplier, 0, customer],
        },
        {
            serviceFunctionName: 'contractExists',
            serviceFunction: () => contractService.contractExists(supplier, 0),
            expectedMockedFunction: mockedContractExists,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'getContractStatus',
            serviceFunction: () => contractService.getContractStatus(supplier, 0),
            expectedMockedFunction: mockedGetContractStatus,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'confirmContract',
            serviceFunction: () => contractService.confirmContract(supplier, 0),
            expectedMockedFunction: mockedConfirmContract,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'getContractLine',
            serviceFunction: () => contractService.getContractLine(supplier, 0, 0),
            expectedMockedFunction: mockedGetContractLine,
            expectedMockedFunctionArgs: [supplier, 0, 0],
        },
        {
            serviceFunctionName: 'addContractLine',
            serviceFunction: () => contractService.addContractLine(supplier, 0, contractLine),
            expectedMockedFunction: mockedAddContractLine,
            expectedMockedFunctionArgs: [supplier, 0, contractLine],
        },
        {
            serviceFunctionName: 'updateContractLine',
            serviceFunction: () => contractService.updateContractLine(supplier, 0, 0, contractLine),
            expectedMockedFunction: mockedUpdateContractLine,
            expectedMockedFunctionArgs: [supplier, 0, 0, contractLine],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => contractService.addAdmin('testAddress'),
            expectedMockedFunction: mockedAddAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => contractService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedRemoveAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
