import { createMock } from 'ts-auto-mock';
import { OfferDriver } from '../drivers/OfferDriver';
import { OfferService } from './OfferService';
import { PRODUCT_CATEGORY } from '../utils/constants';

describe('OfferService', () => {
    const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const companyNames = ['Company 1', 'Company 2'];

    const mockedOfferDriver = createMock<OfferDriver>({
        registerOffer: jest.fn(),
        getOfferIdsByCompany: jest.fn(),
        getOffer: jest.fn(),
        updateOffer: jest.fn(),
        deleteOffer: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });

    const offerService = new OfferService(
        mockedOfferDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerSupplier',
            serviceFunction: () => offerService.registerSupplier(owner, companyNames[0]),
            expectedMockedFunction: mockedOfferDriver.registerSupplier,
            expectedMockedFunctionArgs: [owner, companyNames[0]],
        },
        {
            serviceFunctionName: 'registerOffer',
            serviceFunction: () => offerService.registerOffer(owner, PRODUCT_CATEGORY.EXCELSA_88),
            expectedMockedFunction: mockedOfferDriver.registerOffer,
            expectedMockedFunctionArgs: [owner, PRODUCT_CATEGORY.EXCELSA_88],
        },
        {
            serviceFunctionName: 'getOfferIdsByCompany',
            serviceFunction: () => offerService.getOfferIdsByCompany(owner),
            expectedMockedFunction: mockedOfferDriver.getOfferIdsByCompany,
            expectedMockedFunctionArgs: [owner],
        },
        {
            serviceFunctionName: 'getSupplierName',
            serviceFunction: () => offerService.getSupplierName(owner),
            expectedMockedFunction: mockedOfferDriver.getSupplierName,
            expectedMockedFunctionArgs: [owner],
        },
        {
            serviceFunctionName: 'getOffer',
            serviceFunction: () => offerService.getOffer(2),
            expectedMockedFunction: mockedOfferDriver.getOffer,
            expectedMockedFunctionArgs: [2],
        },
        {
            serviceFunctionName: 'updateSupplier',
            serviceFunction: () => offerService.updateSupplier(owner, companyNames[0]),
            expectedMockedFunction: mockedOfferDriver.updateSupplier,
            expectedMockedFunctionArgs: [owner, companyNames[0]],
        },
        {
            serviceFunctionName: 'updateOffer',
            serviceFunction: () => offerService.updateOffer(2, PRODUCT_CATEGORY.ARABIC_85),
            expectedMockedFunction: mockedOfferDriver.updateOffer,
            expectedMockedFunctionArgs: [2, PRODUCT_CATEGORY.ARABIC_85],
        },
        {
            serviceFunctionName: 'deleteSupplier',
            serviceFunction: () => offerService.deleteSupplier(owner),
            expectedMockedFunction: mockedOfferDriver.deleteSupplier,
            expectedMockedFunctionArgs: [owner],
        },
        {
            serviceFunctionName: 'deleteOffer',
            serviceFunction: () => offerService.deleteOffer(2),
            expectedMockedFunction: mockedOfferDriver.deleteOffer,
            expectedMockedFunctionArgs: [2],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => offerService.addAdmin('testAddress'),
            expectedMockedFunction: mockedOfferDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => offerService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedOfferDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it('should get offers by company', async () => {
        mockedOfferDriver.getOfferIdsByCompany = jest.fn().mockResolvedValue([1, 2]);
        await offerService.getOffersByCompany(owner);

        expect(mockedOfferDriver.getOfferIdsByCompany).toHaveBeenCalledTimes(1);
        expect(mockedOfferDriver.getOfferIdsByCompany).toHaveBeenNthCalledWith(1, owner);

        expect(mockedOfferDriver.getOffer).toHaveBeenCalledTimes(2);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(1, 1);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(2, 2);
    });

    it('should get all offers', async () => {
        mockedOfferDriver.getLastId = jest.fn().mockResolvedValue(2);
        await offerService.getAllOffers();

        expect(mockedOfferDriver.getLastId).toHaveBeenCalledTimes(1);

        expect(mockedOfferDriver.getOffer).toHaveBeenCalledTimes(2);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(1, 1);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(2, 2);
    });
});
