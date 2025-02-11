import { createMock } from 'ts-auto-mock';
import { BusinessRelationService } from '../BusinessRelationService';
import { BusinessRelationDriver } from '../../drivers/BusinessRelationDriver';
import { BusinessRelation } from '../../entities/BusinessRelation';

describe('BusinessRelationService', () => {
    let businessRelationService: BusinessRelationService;
    const mockedFn = {
        createBusinessRelation: jest.fn(),
        getBusinessRelations: jest.fn(),
        getBusinessRelation: jest.fn(),
        deleteBusinessRelation: jest.fn()
    };

    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockBusinessRelation = new BusinessRelation('0xabc', '0xdef');

    beforeAll(() => {
        const businessRelationDriver = createMock<BusinessRelationDriver>({
            createBusinessRelation: mockedFn.createBusinessRelation,
            getBusinessRelations: mockedFn.getBusinessRelations,
            getBusinessRelation: mockedFn.getBusinessRelation,
            deleteBusinessRelation: mockedFn.deleteBusinessRelation
        });
        businessRelationService = new BusinessRelationService(businessRelationDriver);
    });

    it.each([
        {
            functionName: 'createBusinessRelation',
            serviceFunction: () => businessRelationService.createBusinessRelation(mockEthAddress),
            driverFunction: mockedFn.createBusinessRelation,
            driverFunctionResult: mockBusinessRelation,
            driverFunctionArgs: [mockEthAddress]
        },
        {
            functionName: 'getBusinessRelations',
            serviceFunction: () => businessRelationService.getBusinessRelations(),
            driverFunction: mockedFn.getBusinessRelations,
            driverFunctionResult: [mockBusinessRelation],
            driverFunctionArgs: []
        },
        {
            functionName: 'getBusinessRelation',
            serviceFunction: () => businessRelationService.getBusinessRelation(mockEthAddress),
            driverFunction: mockedFn.getBusinessRelation,
            driverFunctionResult: mockBusinessRelation,
            driverFunctionArgs: [mockEthAddress]
        },
        {
            functionName: 'deleteBusinessRelation',
            serviceFunction: () => businessRelationService.deleteBusinessRelation(mockEthAddress),
            driverFunction: mockedFn.deleteBusinessRelation,
            driverFunctionResult: true,
            driverFunctionArgs: [mockEthAddress]
        }
    ])(
        `should call driver function $functionName`,
        async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
            driverFunction.mockReturnValue(driverFunctionResult);
            await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
            expect(driverFunction).toHaveBeenCalled();
            expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
        }
    );
});