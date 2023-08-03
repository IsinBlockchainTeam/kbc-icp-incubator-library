import {Material} from "./Material";

describe('Material', () => {
    let material: Material;

    beforeAll(() => {
        material = new Material(0, 'material', 'owner');
    });

    it('should correctly initialize a new Material', () => {
        expect(material.id).toEqual(0);
        expect(material.name).toEqual('material');
        expect(material.owner).toEqual('owner');
    });

    it('should correctly set the id', () => {
        material.id = 1;
        expect(material.id).toEqual(1);
    });

    it('should correctly set the name', () => {
        material.name = 'material2';
        expect(material.name).toEqual('material2');
    });

    it('should correctly set the owner', () => {
        material.owner = 'owner2';
        expect(material.owner).toEqual('owner2');
    });
});
