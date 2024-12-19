import { createMock } from 'ts-auto-mock';
import { DownPaymentManagerService } from './DownPaymentManagerService';
import { DownPaymentManagerDriver } from '../drivers/DownPaymentManagerDriver';
import { DownPayment } from '../entities/DownPayment';
import { DownPaymentStatus } from '../types/DownPaymentStatus';

describe('DownPaymentManagerService', () => {
    let downPaymentManagerService: DownPaymentManagerService;

    let mockedDownPaymentManagerDriver: DownPaymentManagerDriver;
    const mockedInstance = {
        getDownPaymentCounter: jest.fn(),
        registerDownPayment: jest.fn(),
        getFeeRecipient: jest.fn(),
        getBaseFee: jest.fn(),
        getPercentageFee: jest.fn(),
        getDownPayment: jest.fn(),
        updateFeeRecipient: jest.fn(),
        updateBaseFee: jest.fn(),
        updatePercentageFee: jest.fn()
    };

    const admin = 'admin';
    const downPayment = new DownPayment(
        'payee',
        1000,
        100,
        'tokenAddress',
        DownPaymentStatus.ACTIVE,
        'feeRecipient',
        0,
        20
    );

    beforeAll(() => {
        mockedDownPaymentManagerDriver = createMock<DownPaymentManagerDriver>(mockedInstance);

        downPaymentManagerService = new DownPaymentManagerService(mockedDownPaymentManagerDriver);
    });

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerDownPayment',
            serviceFunction: () =>
                downPaymentManagerService.registerDownPayment(
                    admin,
                    downPayment.payee,
                    downPayment.duration,
                    downPayment.tokenAddress
                ),
            expectedMockedFunction: mockedInstance.registerDownPayment,
            expectedMockedFunctionArgs: [
                admin,
                downPayment.payee,
                downPayment.duration,
                downPayment.tokenAddress
            ]
        },
        {
            serviceFunctionName: 'getFeeRecipient',
            serviceFunction: () => downPaymentManagerService.getFeeRecipient(),
            expectedMockedFunction: mockedInstance.getFeeRecipient,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updateFeeRecipient',
            serviceFunction: () =>
                downPaymentManagerService.updateFeeRecipient(downPayment.feeRecipient),
            expectedMockedFunction: mockedInstance.updateFeeRecipient,
            expectedMockedFunctionArgs: [downPayment.feeRecipient]
        },
        {
            serviceFunctionName: 'getBaseFee',
            serviceFunction: () => downPaymentManagerService.getBaseFee(),
            expectedMockedFunction: mockedInstance.getBaseFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updateBaseFee',
            serviceFunction: () => downPaymentManagerService.updateBaseFee(downPayment.baseFee),
            expectedMockedFunction: mockedInstance.updateBaseFee,
            expectedMockedFunctionArgs: [downPayment.baseFee]
        },
        {
            serviceFunctionName: 'getPercentageFee',
            serviceFunction: () => downPaymentManagerService.getPercentageFee(),
            expectedMockedFunction: mockedInstance.getPercentageFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updatePercentageFee',
            serviceFunction: () =>
                downPaymentManagerService.updatePercentageFee(downPayment.percentageFee),
            expectedMockedFunction: mockedInstance.updatePercentageFee,
            expectedMockedFunctionArgs: [downPayment.percentageFee]
        },
        {
            serviceFunctionName: 'getDownPayment',
            serviceFunction: () => downPaymentManagerService.getDownPayment(1),
            expectedMockedFunction: mockedInstance.getDownPayment,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'getDownPaymentCounter',
            serviceFunction: () => downPaymentManagerService.getDownPaymentCounter(),
            expectedMockedFunction: mockedInstance.getDownPaymentCounter,
            expectedMockedFunctionArgs: []
        }
    ])(
        'service should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
        }
    );
});
