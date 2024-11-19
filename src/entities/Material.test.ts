import { Material } from './Material';
import { ProductCategory } from './ProductCategory';

describe('Material', () => {
    let material: Material;

    beforeAll(() => {
        material = new Material(0, new ProductCategory(0, 'name', 80, 'description'));
    });

    it('should correctly initialize a new Material', () => {
        expect(material.id).toEqual(0);
        expect(material.productCategory).toEqual(new ProductCategory(0, 'name', 80, 'description'));
    });

    it('should correctly set the id', () => {
        material.id = 1;
        expect(material.id).toEqual(1);
    });

    it('should correctly set the productCategory', () => {
        material.productCategory = new ProductCategory(1, 'name2', 90, 'description2');
        expect(material.productCategory).toEqual(
            new ProductCategory(1, 'name2', 90, 'description2')
        );
    });
});
