import { createActor } from '../../declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { OfferDriver } from '../OfferDriver';
import { EntityBuilder } from '../../utils/EntityBuilder';
import { Offer } from '../../entities/Offer';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('OfferDriver', () => {
    let offerDriver: OfferDriver;
    const mockFn = {
        getOffers: jest.fn(),
        getOffer: jest.fn(),
        createOffer: jest.fn()
    };
    const defaultOffer = { id: 0 } as Offer;

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            getOffers: mockFn.getOffers,
            getOffer: mockFn.getOffer,
            createOffer: mockFn.createOffer
        });
        jest.spyOn(EntityBuilder, 'buildOffer').mockReturnValue(defaultOffer);
        const icpIdentity = {} as Identity;
        offerDriver = new OfferDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve offers', async () => {
        const rawOffer = { name: 'test' };
        mockFn.getOffers.mockReturnValue([rawOffer]);
        await expect(offerDriver.getOffers()).resolves.toEqual([defaultOffer]);
        expect(mockFn.getOffers).toHaveBeenCalled();
        expect(EntityBuilder.buildOffer).toHaveBeenCalled();
        expect(EntityBuilder.buildOffer).toHaveBeenCalledWith(rawOffer);
    });

    it('should retrieve an offer', async () => {
        const rawOffer = { name: 'test' };
        mockFn.getOffer.mockReturnValue(rawOffer);
        await expect(offerDriver.getOffer(1)).resolves.toEqual(defaultOffer);
        expect(mockFn.getOffer).toHaveBeenCalled();
        expect(EntityBuilder.buildOffer).toHaveBeenCalled();
        expect(EntityBuilder.buildOffer).toHaveBeenCalledWith(rawOffer);
    });

    it('should create an offer', async () => {
        const rawOffer = { name: 'test' };
        mockFn.createOffer.mockReturnValue(rawOffer);
        await expect(offerDriver.createOffer(1)).resolves.toEqual(defaultOffer);
        expect(mockFn.createOffer).toHaveBeenCalled();
        expect(EntityBuilder.buildOffer).toHaveBeenCalled();
        expect(EntityBuilder.buildOffer).toHaveBeenCalledWith(rawOffer);
    });
});
