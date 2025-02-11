import { Material } from '../Material';
import { Offer } from '../Offer';
import { ProductCategory } from '../ProductCategory';

describe('Offer', () => {
    let offer: Offer;
    const productCategory: ProductCategory = new ProductCategory(1, 'test');
    const material = new Material(0, "name", "owner", productCategory, "typology", "quality", "moisture", false);

    beforeAll(() => {
        offer = new Offer(0, 'owner', material);
    });

    it('should correctly initialize an Offer', () => {
        expect(offer.id).toEqual(0);
        expect(offer.owner).toEqual('owner');
        expect(offer.material).toEqual(material);
    });

    it('should correctly set the id', () => {
        offer.id = 1;
        expect(offer.id).toEqual(1);
    });

    it('should correctly set the owner', () => {
        offer.owner = 'newOwner';
        expect(offer.owner).toEqual('newOwner');
    });

    it('should correctly set the material', () => {
        const newMaterial = new Material(2, "newName", "newOwner", productCategory, "newTypology", "newQuality", "newMoisture", false);
        offer.material = newMaterial
        expect(offer.material).toEqual(newMaterial);
    });
});
