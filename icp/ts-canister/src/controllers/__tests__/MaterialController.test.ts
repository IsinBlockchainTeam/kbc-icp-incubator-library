import MaterialController from "../MaterialController";
import MaterialService from "../../services/MaterialService";
import {Material, RoleProof} from "../../models/types";
import {update} from "azle";
import {OnlyEditor, OnlyViewer} from "../../decorators/roles";
jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/MaterialService', () => {
    return {
        instance: {
            getMaterials: jest.fn(),
            getMaterial: jest.fn(),
            createMaterial: jest.fn(),
            updateMaterial: jest.fn()
        }
    };
});
describe('MaterialController', () => {
    const roleProof = {} as RoleProof;
    let materialServiceInstanceMock = MaterialService.instance as jest.Mocked<MaterialService>;
    let materialController = new MaterialController();

    it.each([
        {
            controllerFunctionName: 'getMaterials',
            controllerFunction: () => materialController.getMaterials(roleProof),
            serviceFunction: materialServiceInstanceMock.getMaterials,
            expectedResult: [{id: 1n} as Material],
            expectedDecorators: [update, OnlyViewer],
        }, {
            controllerFunctionName: 'getMaterial',
            controllerFunction: () => materialController.getMaterial(roleProof, 1n),
            serviceFunction: materialServiceInstanceMock.getMaterial,
            expectedResult: {id: 1n} as Material,
            expectedDecorators: [update, OnlyViewer],
        }, {
            controllerFunctionName: 'createMaterial',
            controllerFunction: () => materialController.createMaterial(roleProof, 1n),
            serviceFunction: materialServiceInstanceMock.createMaterial,
            expectedResult: {id: 1n} as Material,
            expectedDecorators: [update, OnlyEditor],
        }, {
            controllerFunctionName: 'updateMaterial',
            controllerFunction: () => materialController.updateMaterial(roleProof, 1n, 1n),
            serviceFunction: materialServiceInstanceMock.updateMaterial,
            expectedResult: {id: 1n} as Material,
            expectedDecorators: [update, OnlyEditor],
        },
    ])
    ('should cass service $serviceFunctionName', async (
        {controllerFunction, serviceFunction, expectedResult, expectedDecorators}
    ) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
