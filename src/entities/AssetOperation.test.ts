import { AssetOperation } from './AssetOperation';
import { Material } from './Material';
import { ProductCategory } from './ProductCategory';

describe('Transformation', () => {
    let assetOperation: AssetOperation;

    beforeEach(() => {
        assetOperation = new AssetOperation(1, 'operation',
            [new Material(1, new ProductCategory(1, 'category', 1, 'description'))],
            new Material(1, new ProductCategory(1, 'category', 1, 'description')));
    });

    it('should correctly initialize a new AssetOperation', () => {
        expect(assetOperation.id).toEqual(1);
        expect(assetOperation.name).toEqual('operation');
        expect(assetOperation.inputMaterials).toEqual([new Material(1, new ProductCategory(1, 'category', 1, 'description'))]);
        expect(assetOperation.outputMaterial).toEqual(new Material(1, new ProductCategory(1, 'category', 1, 'description')));
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
});
