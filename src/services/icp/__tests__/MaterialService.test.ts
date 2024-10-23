import {createMock} from "ts-auto-mock";
import {RoleProof} from "@kbc-lib/azle-types";
import {MaterialService} from "../MaterialService";
import {MaterialDriver} from "../../../drivers/icp/MaterialDriver";

describe('MaterialService', () => {
    let materialService: MaterialService;
    const mockedFn = {
        getMaterials: jest.fn(),
        getMaterial: jest.fn(),
        createMaterial: jest.fn(),
        updateMaterial: jest.fn()
    }

    beforeAll(() => {
        const materialDriver = createMock<MaterialDriver>({
            getMaterials: mockedFn.getMaterials,
            getMaterial: mockedFn.getMaterial,
            createMaterial: mockedFn.createMaterial,
            updateMaterial: mockedFn.updateMaterial

        });
        materialService = new MaterialService(materialDriver);
    });

    it.each([
        {
            functionName: 'getMaterials',
            serviceFunction: () => materialService.getMaterials({} as RoleProof),
            driverFunction: mockedFn.getMaterials,
            driverFunctionResult: [],
            driverFunctionArgs: [{} as RoleProof]
        }, {
            functionName: 'getMaterial',
            serviceFunction: () => materialService.getMaterial({} as RoleProof, 1),
            driverFunction: mockedFn.getMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 1]
        }, {
            functionName: 'createMaterial',
            serviceFunction: () => materialService.createMaterial({} as RoleProof, 1),
            driverFunction: mockedFn.createMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 1]
        }, {
            functionName: 'updateMaterial',
            serviceFunction: () => materialService.updateMaterial({} as RoleProof, 1, 1),
            driverFunction: mockedFn.updateMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 1, 1]
        }
    ])(`should call driver function $functionName`, async ({serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs}) => {
        driverFunction.mockReturnValue(driverFunctionResult);
        await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
        expect(driverFunction).toHaveBeenCalled();
        expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
    });
});
