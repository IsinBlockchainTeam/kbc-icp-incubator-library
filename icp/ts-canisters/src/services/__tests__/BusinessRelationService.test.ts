import { StableBTreeMap } from 'azle';
import BusinessRelationService from '../BusinessRelationService';
import { BusinessRelation } from '../../models/types';
import { BusinessRelationNotFoundError } from '../../models/errors/BusinessRelationError';

jest.mock('azle');

describe('BusinessRelationService', () => {
    let businessRelationService: BusinessRelationService;
    const mockEthAddressA = '0x1234567890123456789012345678901234567890';
    const mockEthAddressB = '0x0987654321098765432109876543210987654321';
    const mockBusinessRelation: BusinessRelation = {
        ethAddressA: mockEthAddressA,
        ethAddressB: mockEthAddressB
    };

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        insert: jest.fn(),
        remove: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            insert: mockedFn.insert,
            remove: mockedFn.remove
        });
        businessRelationService = BusinessRelationService.instance;
    });

    it('should create a business relation', () => {
        const result = businessRelationService.createBusinessRelation(mockEthAddressA, mockEthAddressB);
        expect(result).toEqual(mockBusinessRelation);
        expect(mockedFn.insert).toHaveBeenCalledWith(`${mockEthAddressA}-${mockEthAddressB}`, mockBusinessRelation);
    });


    it('should get all business relations for an address', () => {
        mockedFn.values.mockReturnValue([
            mockBusinessRelation,
            { ethAddressA: 'other', ethAddressB: 'address' }
        ]);

        const result = businessRelationService.getBusinessRelations(mockEthAddressA);
        expect(result).toEqual([mockBusinessRelation]);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it('should get a specific business relation', () => {
        mockedFn.get.mockReturnValue(mockBusinessRelation);

        const result = businessRelationService.getBusinessRelation(mockEthAddressA, mockEthAddressB);
        expect(result).toEqual(mockBusinessRelation);
        expect(mockedFn.get).toHaveBeenCalledWith(`${mockEthAddressA}-${mockEthAddressB}`);
    });

    it('should throw BusinessRelationNotFoundError when relation does not exist', () => {
        mockedFn.get.mockReturnValue(undefined);

        expect(() => {
            businessRelationService.getBusinessRelation(mockEthAddressA, mockEthAddressB);
        }).toThrow(BusinessRelationNotFoundError);
    });


    it('should delete a business relation', () => {
        mockedFn.get.mockReturnValue(mockBusinessRelation);

        const result = businessRelationService.deleteBusinessRelation(mockEthAddressA, mockEthAddressB);
        expect(result).toBe(true);
        expect(mockedFn.remove).toHaveBeenCalledWith(`${mockEthAddressA}-${mockEthAddressB}`);
    });

    it('should throw BusinessRelationNotFoundError when trying to delete non-existent relation', () => {
        mockedFn.get.mockReturnValue(undefined);

        expect(() => {
            businessRelationService.deleteBusinessRelation(mockEthAddressA, mockEthAddressB);
        }).toThrow(BusinessRelationNotFoundError);
    });
});