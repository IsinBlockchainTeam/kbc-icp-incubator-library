import { createMock } from 'ts-auto-mock';
import RelationshipService from './RelationshipService';
import { RelationshipDriver } from '../drivers/RelationshipDriver';
import { Relationship } from '../entities/Relationship';

describe('RelationshipService', () => {
    let relationshipService: RelationshipService;

    let mockedRelationshipDriver: RelationshipDriver;

    const mockedRegisterRelationship = jest.fn();
    const mockedGetRelationshipCounter = jest.fn();
    const mockedGetRelationshipInfo = jest.fn();
    const mockedGetRelationshipIdsByCompany = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();

    const companyA = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const companyB = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const now = new Date();

    beforeAll(() => {
        mockedRelationshipDriver = createMock<RelationshipDriver>({
            registerRelationship: mockedRegisterRelationship,
            getRelationshipCounter: mockedGetRelationshipCounter,
            getRelationshipInfo: mockedGetRelationshipInfo,
            getRelationshipIdsByCompany: mockedGetRelationshipIdsByCompany,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
        });

        relationshipService = new RelationshipService(
            mockedRelationshipDriver,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerRelationship',
            serviceFunction: () => relationshipService.registerRelationship(companyA, companyB, now, new Date('2030-10-10')),
            expectedMockedFunction: mockedRegisterRelationship,
            expectedMockedFunctionArgs: [companyA, companyB, now, new Date('2030-10-10')],
        },
        {
            serviceFunctionName: 'registerRelationship',
            serviceFunction: () => relationshipService.registerRelationship(companyA, companyB, now),
            expectedMockedFunction: mockedRegisterRelationship,
            expectedMockedFunctionArgs: [companyA, companyB, now, undefined],
        },
        {
            serviceFunctionName: 'getRelationshipCounter',
            serviceFunction: () => relationshipService.getRelationshipCounter(),
            expectedMockedFunction: mockedGetRelationshipCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getRelationshipInfo',
            serviceFunction: () => relationshipService.getRelationshipInfo(1),
            expectedMockedFunction: mockedGetRelationshipInfo,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getRelationshipIdsByCompany',
            serviceFunction: () => relationshipService.getRelationshipIdsByCompany(companyA),
            expectedMockedFunction: mockedGetRelationshipIdsByCompany,
            expectedMockedFunctionArgs: [companyA],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => relationshipService.addAdmin('testAddress'),
            expectedMockedFunction: mockedAddAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => relationshipService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedRemoveAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
