import { ProductCategory } from '../ProductCategory';

describe('ProductCategory', () => {
    let productCategory: ProductCategory;

    beforeAll(() => {
        productCategory = new ProductCategory(1, 'name', 80, 'description');
    });

    it('should correctly initialize a new ProductCategory', () => {
        expect(productCategory.id).toEqual(1);
        expect(productCategory.name).toEqual('name');
        expect(productCategory.quality).toEqual(80);
        expect(productCategory.description).toEqual('description');
    });

    it('should correctly set the id', () => {
        productCategory.id = 2;
        expect(productCategory.id).toEqual(2);
    });

    it('should correctly set the name', () => {
        productCategory.name = 'name2';
        expect(productCategory.name).toEqual('name2');
    });

    it('should correctly set the quality', () => {
        productCategory.quality = 90;
        expect(productCategory.quality).toEqual(90);
    });

    it('should correctly set the description', () => {
        productCategory.description = 'description2';
        expect(productCategory.description).toEqual('description2');
    });
});
