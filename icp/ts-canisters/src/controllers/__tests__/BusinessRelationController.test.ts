import { query, update } from 'azle';
import BusinessRelationController from '../BusinessRelationController';
import BusinessRelationService from '../../services/BusinessRelationService';
import AuthenticationService from '../../services/AuthenticationService';
import { BusinessRelation } from '../../models/types';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/BusinessRelationService', () => ({
    instance: {
        createBusinessRelation: jest.fn(),
        getBusinessRelations: jest.fn(),
        getBusinessRelation: jest.fn(),
        deleteBusinessRelation: jest.fn()
    }
}));
jest.mock('../../services/AuthenticationService', () => ({
    instance: {
        getDelegatorAddress: jest.fn()
    }
}));

describe('BusinessRelationController', () => {
    const businessRelationServiceInstanceMock = BusinessRelationService.instance as jest.Mocked<typeof BusinessRelationService.instance>;
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<typeof AuthenticationService.instance>;
    const businessRelationController = new BusinessRelationController();
    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockOtherEthAddress = '0x0987654321098765432109876543210987654321';
    const mockBusinessRelation = { ethAddressCompanyA: mockEthAddress, ethAddressCompanyB: mockOtherEthAddress } as BusinessRelation;

    beforeEach(() => {
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(mockEthAddress);
    });

    it.each([
        {
            controllerFunctionName: 'createBusinessRelation',
            controllerFunction: () => businessRelationController.createBusinessRelation(mockOtherEthAddress),
            serviceFunction: businessRelationServiceInstanceMock.createBusinessRelation,
            expectedResult: mockBusinessRelation,
            expectedDecorators: [update]
        },
        {
            controllerFunctionName: 'getBusinessRelations',
            controllerFunction: () => businessRelationController.getBusinessRelations(),
            serviceFunction: businessRelationServiceInstanceMock.getBusinessRelations,
            expectedResult: [mockBusinessRelation],
            expectedDecorators: [query]
        },
        {
            controllerFunctionName: 'getBusinessRelation',
            controllerFunction: () => businessRelationController.getBusinessRelation(mockOtherEthAddress),
            serviceFunction: businessRelationServiceInstanceMock.getBusinessRelation,
            expectedResult: mockBusinessRelation,
            expectedDecorators: [query]
        },
        {
            controllerFunctionName: 'deleteBusinessRelation',
            controllerFunction: () => businessRelationController.deleteBusinessRelation(mockOtherEthAddress),
            serviceFunction: businessRelationServiceInstanceMock.deleteBusinessRelation,
            expectedResult: true,
            expectedDecorators: [update]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});