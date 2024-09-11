import { createMock } from 'ts-auto-mock';
import { OfferDriver } from '../drivers/OfferDriver';
import { OfferService } from './OfferService';
import { RoleProof } from '../types/RoleProof';

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
        removeAdmin: jest.fn()
    });

    const offerService = new OfferService(mockedOfferDriver);

    const roleProof: RoleProof = createMock<RoleProof>();

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerSupplier',
            serviceFunction: () => offerService.registerSupplier(roleProof, owner, companyNames[0]),
            expectedMockedFunction: mockedOfferDriver.registerSupplier,
            expectedMockedFunctionArgs: [roleProof, owner, companyNames[0]]
        },
        {
            serviceFunctionName: 'registerOffer',
            serviceFunction: () => offerService.registerOffer(roleProof, owner, 1),
            expectedMockedFunction: mockedOfferDriver.registerOffer,
            expectedMockedFunctionArgs: [roleProof, owner, 1]
        },
        {
            serviceFunctionName: 'getOfferIdsByCompany',
            serviceFunction: () => offerService.getOfferIdsByCompany(roleProof, owner),
            expectedMockedFunction: mockedOfferDriver.getOfferIdsByCompany,
            expectedMockedFunctionArgs: [roleProof, owner]
        },
        {
            serviceFunctionName: 'getSupplierName',
            serviceFunction: () => offerService.getSupplierName(roleProof, owner),
            expectedMockedFunction: mockedOfferDriver.getSupplierName,
            expectedMockedFunctionArgs: [roleProof, owner]
        },
        {
            serviceFunctionName: 'getOffer',
            serviceFunction: () => offerService.getOffer(roleProof, 2),
            expectedMockedFunction: mockedOfferDriver.getOffer,
            expectedMockedFunctionArgs: [roleProof, 2]
        },
        {
            serviceFunctionName: 'updateSupplier',
            serviceFunction: () => offerService.updateSupplier(roleProof, owner, companyNames[0]),
            expectedMockedFunction: mockedOfferDriver.updateSupplier,
            expectedMockedFunctionArgs: [roleProof, owner, companyNames[0]]
        },
        {
            serviceFunctionName: 'updateOffer',
            serviceFunction: () => offerService.updateOffer(roleProof, 2, 2),
            expectedMockedFunction: mockedOfferDriver.updateOffer,
            expectedMockedFunctionArgs: [roleProof, 2, 2]
        },
        {
            serviceFunctionName: 'deleteSupplier',
            serviceFunction: () => offerService.deleteSupplier(roleProof, owner),
            expectedMockedFunction: mockedOfferDriver.deleteSupplier,
            expectedMockedFunctionArgs: [roleProof, owner]
        },
        {
            serviceFunctionName: 'deleteOffer',
            serviceFunction: () => offerService.deleteOffer(roleProof, 2),
            expectedMockedFunction: mockedOfferDriver.deleteOffer,
            expectedMockedFunctionArgs: [roleProof, 2]
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => offerService.addAdmin('testAddress'),
            expectedMockedFunction: mockedOfferDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => offerService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedOfferDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );

    it('should get offers by company', async () => {
        mockedOfferDriver.getOfferIdsByCompany = jest.fn().mockResolvedValue([1, 2]);
        await offerService.getOffersByCompany(roleProof, owner);

        expect(mockedOfferDriver.getOfferIdsByCompany).toHaveBeenCalledTimes(1);
        expect(mockedOfferDriver.getOfferIdsByCompany).toHaveBeenNthCalledWith(1, roleProof, owner);

        expect(mockedOfferDriver.getOffer).toHaveBeenCalledTimes(2);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(1, roleProof, 1);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(2, roleProof, 2);
    });

    it('should get all offers', async () => {
        mockedOfferDriver.getLastId = jest.fn().mockResolvedValue(2);
        await offerService.getAllOffers(roleProof);

        expect(mockedOfferDriver.getLastId).toHaveBeenCalledTimes(1);

        expect(mockedOfferDriver.getOffer).toHaveBeenCalledTimes(2);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(1, roleProof, 1);
        expect(mockedOfferDriver.getOffer).toHaveBeenNthCalledWith(2, roleProof, 2);
    });
});
