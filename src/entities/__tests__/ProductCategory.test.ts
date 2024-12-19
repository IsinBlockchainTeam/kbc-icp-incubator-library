import { ProductCategory } from '../ProductCategory';

describe('ProductCategory', () => {
    let productCategory: ProductCategory;

    beforeAll(() => {
        productCategory = new ProductCategory(1, 'name');
    });

    it('should correctly initialize a new ProductCategory', () => {
        expect(productCategory.id).toEqual(1);
        expect(productCategory.name).toEqual('name');
    });

    it('should correctly set the id', () => {
        productCategory.id = 2;
        expect(productCategory.id).toEqual(2);
    });

    it('should correctly set the name', () => {
        productCategory.name = 'name2';
        expect(productCategory.name).toEqual('name2');
    });
});
