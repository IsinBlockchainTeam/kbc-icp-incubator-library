import { Material } from '../Material';
import { ProductCategory } from '../ProductCategory';

describe('Material', () => {
    let material: Material;

    beforeAll(() => {
        material = new Material(0, 'owner', 'name', new ProductCategory(0, 'name'), 'typology', 'quality', 'moisture', true);
    });

    it('should correctly initialize a new Material', () => {
        expect(material.id).toEqual(0);
        expect(material.owner).toEqual('owner');
        expect(material.name).toEqual('name');
        expect(material.productCategory).toEqual(new ProductCategory(0, 'name'));
        expect(material.typology).toEqual('typology');
        expect(material.quality).toEqual('quality');
        expect(material.moisture).toEqual('moisture');
        expect(material.isInput).toEqual(true);
    });

    it('should correctly set the id', () => {
        material.id = 1;
        expect(material.id).toEqual(1);
    });

    it('should correctly set the owner', () => {
        material.owner = 'owner2';
        expect(material.owner).toEqual('owner2');
    });

    it('should correctly set the name', () => {
        material.name = 'name2';
        expect(material.name).toEqual('name2');
    });

    it('should correctly set the productCategory', () => {
        material.productCategory = new ProductCategory(1, 'name2');
        expect(material.productCategory).toEqual(
            new ProductCategory(1, 'name2')
        );
    });

    it('should correctly set the typology', () => {
        material.typology = 'typology2';
        expect(material.typology).toEqual('typology2');
    });

    it('should correctly set the quality', () => {
        material.quality = 'quality2';
        expect(material.quality).toEqual('quality2');
    });

    it('should correctly set the moisture', () => {
        material.moisture = 'moisture2';
        expect(material.moisture).toEqual('moisture2');
    });

    it('should correctly set the isInput', () => {
        material.isInput = false;
        expect(material.isInput).toEqual(false);
    });

    it('should correctly create a Material instance from JSON', () => {
        const json = {
            _id: 1,
            _owner: 'owner',
            _name: 'name',
            _productCategory: { _id: 1, _name: 'category' },
            _typology: 'typology',
            _quality: 'quality',
            _moisture: 'moisture',
            _isInput: true
        };

        const newMaterial = Material.fromJson(json);

        expect(newMaterial.id).toEqual(1);
        expect(newMaterial.owner).toEqual('owner');
        expect(newMaterial.name).toEqual('name');
        expect(newMaterial.productCategory).toEqual(new ProductCategory(1, 'category'));
        expect(newMaterial.typology).toEqual('typology');
        expect(newMaterial.quality).toEqual('quality');
        expect(newMaterial.moisture).toEqual('moisture');
        expect(newMaterial.isInput).toEqual(true);
    });

    it('should throw an error if JSON is missing required fields', () => {
        const json = {
            _owner: 'owner',
            _name: 'name',
            _productCategory: { _id: 1, _name: 'category' },
            _typology: 'typology',
            _quality: 'quality',
            _moisture: 'moisture',
            _isInput: true
        };

        expect(() => Material.fromJson(json)).toThrow();
    });

    it('should handle null values in JSON', () => {
        const json = {
            _id: null,
            _owner: null,
            _name: null,
            _productCategory: {
                _id: null,
                _name: null
            },
            _typology: null,
            _quality: null,
            _moisture: null,
            _isInput: null
        };

        const newMaterial = Material.fromJson(json);

        expect(newMaterial.id).toBeNull();
        expect(newMaterial.owner).toBeNull();
        expect(newMaterial.name).toBeNull();
        expect(newMaterial.productCategory.id).toBeNull();
        expect(newMaterial.productCategory.name).toBeNull();
        expect(newMaterial.typology).toBeNull();
        expect(newMaterial.quality).toBeNull();
        expect(newMaterial.moisture).toBeNull();
        expect(newMaterial.isInput).toBeNull();
    });
});
