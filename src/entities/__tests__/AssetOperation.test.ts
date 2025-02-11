import { AssetOperation } from '../AssetOperation';
import { Material } from '../Material';

describe('AssetOperation', () => {
    let assetOperation: AssetOperation;
    const inputMaterials = [{ id: 1 } as Material, { id: 2 } as Material];
    const outputMaterial = { id: 3 } as Material;

    beforeAll(() => {
        assetOperation = new AssetOperation(
            1,
            'name',
            inputMaterials,
            outputMaterial,
            'latitude',
            'longitude',
            ['processType1']
        );
    });

    it('should correctly initialize an AssetOperation', () => {
        expect(assetOperation.id).toEqual(1);
        expect(assetOperation.name).toEqual('name');
        expect(assetOperation.inputMaterials).toEqual(inputMaterials);
        expect(assetOperation.outputMaterial).toEqual(outputMaterial);
        expect(assetOperation.latitude).toEqual('latitude');
        expect(assetOperation.longitude).toEqual('longitude');
        expect(assetOperation.processTypes).toEqual(['processType1']);
    });

    it('should correctly set the id', () => {
        assetOperation.id = 2;
        expect(assetOperation.id).toEqual(2);
    });

    it('should correctly set the name', () => {
        assetOperation.name = 'newName';
        expect(assetOperation.name).toEqual('newName');
    });

    it('should correctly set the inputMaterials', () => {
        assetOperation.inputMaterials = [{ id: 4 } as Material, { id: 5 } as Material];
        expect(assetOperation.inputMaterials).toEqual([{ id: 4 }, { id: 5 }]);
    });

    it('should correctly set the outputMaterial', () => {
        assetOperation.outputMaterial = { id: 6 } as Material;
        expect(assetOperation.outputMaterial).toEqual({ id: 6 });
    });

    it('should correctly set the latitude', () => {
        assetOperation.latitude = 'newLatitude';
        expect(assetOperation.latitude).toEqual('newLatitude');
    });

    it('should correctly set the longitude', () => {
        assetOperation.longitude = 'newLongitude';
        expect(assetOperation.longitude).toEqual('newLongitude');
    });

    it('should correctly set the processTypes', () => {
        assetOperation.processTypes = ['processType2'];
        expect(assetOperation.processTypes).toEqual(['processType2']);
    });
});
