import { createMock } from 'ts-auto-mock';
import RelationshipService from './RelationshipService';
import { RelationshipDriver } from '../drivers/RelationshipDriver';

describe('RelationshipService', () => {
    const companyA = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const companyB = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const now = new Date();

    const mockedRelationshipDriver = createMock<RelationshipDriver>({
        registerRelationship: jest.fn(),
        getRelationshipCounter: jest.fn(),
        getRelationshipInfo: jest.fn(),
        getRelationshipIdsByCompany: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn()
    });

    const relationshipService = new RelationshipService(mockedRelationshipDriver);

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerRelationship',
            serviceFunction: () =>
                relationshipService.registerRelationship(
                    companyA,
                    companyB,
                    now,
                    new Date('2030-10-10')
                ),
            expectedMockedFunction: mockedRelationshipDriver.registerRelationship,
            expectedMockedFunctionArgs: [companyA, companyB, now, new Date('2030-10-10')]
        },
        {
            serviceFunctionName: 'registerRelationship',
            serviceFunction: () =>
                relationshipService.registerRelationship(companyA, companyB, now),
            expectedMockedFunction: mockedRelationshipDriver.registerRelationship,
            expectedMockedFunctionArgs: [companyA, companyB, now, undefined]
        },
        {
            serviceFunctionName: 'getRelationshipCounter',
            serviceFunction: () => relationshipService.getRelationshipCounter(),
            expectedMockedFunction: mockedRelationshipDriver.getRelationshipCounter,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getRelationshipInfo',
            serviceFunction: () => relationshipService.getRelationshipInfo(1),
            expectedMockedFunction: mockedRelationshipDriver.getRelationshipInfo,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'getRelationshipIdsByCompany',
            serviceFunction: () => relationshipService.getRelationshipIdsByCompany(companyA),
            expectedMockedFunction: mockedRelationshipDriver.getRelationshipIdsByCompany,
            expectedMockedFunctionArgs: [companyA]
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => relationshipService.addAdmin('testAddress'),
            expectedMockedFunction: mockedRelationshipDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => relationshipService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedRelationshipDriver.removeAdmin,
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
});
