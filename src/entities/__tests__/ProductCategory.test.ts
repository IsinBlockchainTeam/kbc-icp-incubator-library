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

    it('should correctly create a ProductCategory instance from valid JSON', () => {
        const json = { _id: 1, _name: 'category' };

        const newProductCategory = ProductCategory.fromJson(json);

        expect(newProductCategory.id).toEqual(1);
        expect(newProductCategory.name).toEqual('category');
    });

    it('should throw an error if JSON is required fields', () => {
        const json = { _name: 'category' };

        expect(() => ProductCategory.fromJson(json)).toThrow('Invalid JSON');
    });

    it('should handle null values in JSON', () => {
        const json = { _id: null, _name: null };

        const newProductCategory = ProductCategory.fromJson(json);

        expect(newProductCategory.id).toBeNull();
        expect(newProductCategory.name).toBeNull();
    });
});
