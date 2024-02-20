import { AssetOperation } from './AssetOperation';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';
import { AssetOperationType } from '../types/AssetOperationType';

describe('Transformation', () => {
    let assetOperation: AssetOperation;
    const material: Material = new Material(1, new ProductCategory(1, 'category', 1, 'description'));

    beforeEach(() => {
        assetOperation = new AssetOperation(1, 'operation',
            [new Material(1, new ProductCategory(1, 'category', 1, 'description'))],
            new Material(1, new ProductCategory(1, 'category', 1, 'description')),
            '46.6576', '8.953062');
    });

    it('should correctly initialize a new AssetOperation', () => {
        expect(assetOperation.id).toEqual(1);
        expect(assetOperation.name).toEqual('operation');
        expect(assetOperation.inputMaterials).toEqual([material]);
        expect(assetOperation.outputMaterial).toEqual(material);
    });

    it('should correctly set the id', () => {
        assetOperation.id = 2;
        expect(assetOperation.id).toEqual(2);
    });

    it('should correctly set the name', () => {
        assetOperation.name = 'operation2';
        expect(assetOperation.name).toEqual('operation2');
    });

    it('should correctly set the inputMaterials', () => {
        assetOperation.inputMaterials = [new Material(2, new ProductCategory(2, 'category2', 2, 'description2'))];
        expect(assetOperation.inputMaterials).toEqual([new Material(2, new ProductCategory(2, 'category2', 2, 'description2'))]);
    });

    it('should correctly set the outputMaterial', () => {
        assetOperation.outputMaterial = new Material(2, new ProductCategory(2, 'category2', 2, 'description2'));
        expect(assetOperation.outputMaterial).toEqual(new Material(2, new ProductCategory(2, 'category2', 2, 'description2')));
    });

    it('should get type CONSOLIDATION', () => {
        assetOperation = new AssetOperation(1, 'operation', [material], material, '46.6576', '8.953062');
        expect(assetOperation.type).toEqual(AssetOperationType.CONSOLIDATION);
    });

    it('should get type TRANSFORMATION', () => {
        assetOperation.inputMaterials.push(new Material(2, new ProductCategory(2, 'category2', 2, 'description2')));
        expect(assetOperation.type).toEqual(AssetOperationType.TRANSFORMATION);
    });

    it('should throw an error when getting invalid type', () => {
        assetOperation.inputMaterials = [];
        expect(() => assetOperation.type).toThrow(new Error('Invalid asset operation'));
    });
});
