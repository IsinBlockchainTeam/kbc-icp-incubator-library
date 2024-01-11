import { Offer } from './Offer';

describe('Offer', () => {
    let offer: Offer;

    beforeAll(() => {
        offer = new Offer(0, 'owner', 'category');
    });

    it('should correctly initialize an Offer', () => {
        expect(offer.id)
            .toEqual(0);
        expect(offer.owner)
            .toEqual('owner');
        expect(offer.productCategory)
            .toEqual('category');
    });

    it('should correctly set the id', () => {
        offer.id = 1;
        expect(offer.id)
            .toEqual(1);
    });

    it('should correctly set the owner', () => {
        offer.owner = 'newOwner';
        expect(offer.owner)
            .toEqual('newOwner');
    });

    it('should correctly set the productCategory', () => {
        offer.productCategory = 'newCategory';
        expect(offer.productCategory)
            .toEqual('newCategory');
    });
});
