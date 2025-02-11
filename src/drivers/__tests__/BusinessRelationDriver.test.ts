import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { BusinessRelationDriver } from '../BusinessRelationDriver';
import { BusinessRelation } from '../../entities/BusinessRelation';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('BusinessRelationDriver', () => {
    let businessRelationDriver: BusinessRelationDriver;
    const mockFn = {
        getBusinessRelations: jest.fn(),
        getBusinessRelation: jest.fn(),
        createBusinessRelation: jest.fn(),
        deleteBusinessRelation: jest.fn()
    };
    const defaultBusinessRelation = new BusinessRelation('addressA', 'addressB');

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getBusinessRelations: mockFn.getBusinessRelations,
            getBusinessRelation: mockFn.getBusinessRelation,
            createBusinessRelation: mockFn.createBusinessRelation,
            deleteBusinessRelation: mockFn.deleteBusinessRelation
        });

        const icpIdentity = {} as Identity;
        businessRelationDriver = new BusinessRelationDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve business relations', async () => {
        const rawBusinessRelation = { ethAddressA: 'addressA', ethAddressB: 'addressB' };

        mockFn.getBusinessRelations.mockReturnValue([rawBusinessRelation]);

        const result = await businessRelationDriver.getBusinessRelations();

        expect(result).toEqual([defaultBusinessRelation]);
        expect(mockFn.getBusinessRelations).toHaveBeenCalled();
    });

    it('should retrieve a business relation', async () => {
        const rawBusinessRelation = { ethAddressA: 'addressA', ethAddressB: 'addressB' };

        mockFn.getBusinessRelation.mockReturnValue(rawBusinessRelation);

        const result = await businessRelationDriver.getBusinessRelation('addressB');

        expect(result).toEqual(defaultBusinessRelation);
        expect(mockFn.getBusinessRelation).toHaveBeenCalledWith('addressB');
    });

    it('should create a business relation', async () => {
        const rawBusinessRelation = { ethAddressA: 'addressA', ethAddressB: 'addressB' };
        mockFn.createBusinessRelation.mockReturnValue(rawBusinessRelation);

        const result = await businessRelationDriver.createBusinessRelation('addressB');

        expect(result).toEqual(defaultBusinessRelation);
        expect(mockFn.createBusinessRelation).toHaveBeenCalledWith('addressB');
    });

    it('should delete a business relation', async () => {
        mockFn.deleteBusinessRelation.mockReturnValue(true);

        const result = await businessRelationDriver.deleteBusinessRelation('addressB');
        
        expect(result).toBe(true);
        expect(mockFn.deleteBusinessRelation).toHaveBeenCalledWith('addressB');
    });
});