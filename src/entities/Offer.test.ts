import { Offer } from './Offer';
import { ProductCategory } from './ProductCategory';

describe('Offer', () => {
    let offer: Offer;
    const productCategory: ProductCategory = new ProductCategory(1, 'test', 85, 'description');

    beforeAll(() => {
        offer = new Offer(0, 'owner', productCategory);
    });

    it('should correctly initialize an Offer', () => {
        expect(offer.id).toEqual(0);
        expect(offer.owner).toEqual('owner');
        expect(offer.productCategory).toEqual(productCategory);
    });

    it('should correctly set the id', () => {
        offer.id = 1;
        expect(offer.id).toEqual(1);
    });

    it('should correctly set the owner', () => {
        offer.owner = 'newOwner';
        expect(offer.owner).toEqual('newOwner');
    });

    it('should correctly set the productCategory', () => {
        offer.productCategory = new ProductCategory(2, 'newCategory', 90, 'updated');
        expect(offer.productCategory).toEqual(new ProductCategory(2, 'newCategory', 90, 'updated'));
    });
});
