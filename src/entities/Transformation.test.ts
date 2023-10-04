import { Transformation } from './Transformation';
import { Material } from './Material';

describe('Transformation', () => {
    let transformation: Transformation;
    const material1 = new Material(1, 'material1', 'owner');
    const material2 = new Material(2, 'material1', 'owner');

    beforeAll(() => {
        transformation = new Transformation(0, 'transformation', [material1, material2], 3, 'owner');
    });

    it('should correctly initialize a new Transformation', () => {
        expect(transformation.id).toEqual(0);
        expect(transformation.name).toEqual('transformation');
        expect(transformation.inputMaterials).toEqual([material1, material2]);
        expect(transformation.outputMaterialId).toEqual(3);
        expect(transformation.owner).toEqual('owner');
    });

    it('should correctly set the id', () => {
        transformation.id = 1;
        expect(transformation.id).toEqual(1);
    });

    it('should correctly set the name', () => {
        transformation.name = 'transformation2';
        expect(transformation.name).toEqual('transformation2');
    });

    it('should correctly set the inputMaterialsIds', () => {
        const material3 = new Material(3, 'material3', 'owner');
        const material4 = new Material(4, 'material4', 'owner');

        transformation.inputMaterials = [material3, material4];
        expect(transformation.inputMaterials).toEqual([material3, material4]);
    });

    it('should correctly set the outputMaterialId', () => {
        transformation.outputMaterialId = 6;
        expect(transformation.outputMaterialId).toEqual(6);
    });

    it('should correctly set the owner', () => {
        transformation.owner = 'owner2';
        expect(transformation.owner).toEqual('owner2');
    });
});
