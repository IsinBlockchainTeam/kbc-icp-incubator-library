import {Transformation} from "./Transformation";

describe('Transformation', () => {
    let transformation: Transformation;

    beforeAll(() => {
        transformation = new Transformation(0, 'transformation', [1, 2], 3, 'owner');
    });

    it('should correctly initialize a new Transformation', () => {
        expect(transformation.id).toEqual(0);
        expect(transformation.name).toEqual('transformation');
        expect(transformation.inputMaterialsIds).toEqual([1, 2]);
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
        transformation.inputMaterialsIds = [4, 5];
        expect(transformation.inputMaterialsIds).toEqual([4, 5]);
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
