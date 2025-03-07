import { update } from 'azle';
import MaterialController from '../MaterialController';
import MaterialService from '../../services/MaterialService';
import { Material } from '../../models/types';
import { AtLeastEditor, AtLeastViewer } from '../../decorators/roles';
import { OnlyContractParty } from "../../decorators/parties";

jest.mock('azle');
jest.mock('../../decorators/parties');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/MaterialService', () => ({
    instance: {
        getMaterials: jest.fn(),
        getMaterial: jest.fn(),
        createMaterial: jest.fn(),
        updateMaterial: jest.fn()
    }
}));
describe('MaterialController', () => {
    const materialServiceInstanceMock = MaterialService.instance as jest.Mocked<MaterialService>;
    const materialController = new MaterialController();

    it.each([
        {
            controllerFunctionName: 'getMaterials',
            controllerFunction: () => materialController.getMaterials(),
            serviceFunction: materialServiceInstanceMock.getMaterials,
            expectedResult: [{ id: 1n } as Material],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getMaterial',
            controllerFunction: () => materialController.getMaterial(1n),
            serviceFunction: materialServiceInstanceMock.getMaterial,
            expectedResult: { id: 1n } as Material,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'createMaterial',
            controllerFunction: () => materialController.createMaterial('nameTest', 1n, 'typologyTest', 'qualityTest', 'moistureTest', false),
            serviceFunction: materialServiceInstanceMock.createMaterial,
            expectedResult: { id: 1n } as Material,
            expectedArguments: ['nameTest', 1n, 'typologyTest', 'qualityTest', 'moistureTest', false],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'updateMaterial',
            controllerFunction: () => materialController.updateMaterial(1n, 'nameTest', 1n, 'typologyTest', 'qualityTest', 'moistureTest', false),
            serviceFunction: materialServiceInstanceMock.updateMaterial,
            expectedResult: { id: 1n } as Material,
            expectedArguments: [1n, 'nameTest', 1n, 'typologyTest', 'qualityTest', 'moistureTest', false],
            expectedDecorators: [update, AtLeastEditor, OnlyContractParty]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        expectedDecorators.forEach((decorator) => {
            expect(decorator).toHaveBeenCalled();
        });
    });
});
