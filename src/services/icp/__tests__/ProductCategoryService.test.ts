import {createMock} from "ts-auto-mock";
import {RoleProof} from "@kbc-lib/azle-types";
import {ProductCategoryService} from "../ProductCategoryService";
import {ProductCategoryDriver} from "../../../drivers/icp/ProductCategoryDriver";

describe('ProductCategoryService', () => {
    let productCategoryService: ProductCategoryService;
    const mockedFn = {
        getProductCategories: jest.fn(),
        getProductCategory: jest.fn(),
        createProductCategory: jest.fn(),
        updateProductCategory: jest.fn()
    }

    beforeAll(() => {
        const productCategoryDriver = createMock<ProductCategoryDriver>({
            getProductCategories: mockedFn.getProductCategories,
            getProductCategory: mockedFn.getProductCategory,
            createProductCategory: mockedFn.createProductCategory,
            updateProductCategory: mockedFn.updateProductCategory

        });
        productCategoryService = new ProductCategoryService(productCategoryDriver);
    });

    it.each([
        {
            functionName: 'getProductCategories',
            serviceFunction: () => productCategoryService.getProductCategories({} as RoleProof),
            driverFunction: mockedFn.getProductCategories,
            driverFunctionResult: [],
            driverFunctionArgs: [{} as RoleProof]
        }, {
            functionName: 'getProductCategory',
            serviceFunction: () => productCategoryService.getProductCategory({} as RoleProof, 1),
            driverFunction: mockedFn.getProductCategory,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 1]
        }, {
            functionName: 'createProductCategory',
            serviceFunction: () => productCategoryService.createProductCategory({} as RoleProof, 'test', 1, 'test'),
            driverFunction: mockedFn.createProductCategory,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 'test', 1, 'test']
        }, {
            functionName: 'updateProductCategory',
            serviceFunction: () => productCategoryService.updateProductCategory({} as RoleProof, 1, 'test', 1, 'test'),
            driverFunction: mockedFn.updateProductCategory,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 1, 'test', 1, 'test']
        }, {
            functionName: 'updateProductCategory',
            serviceFunction: () => productCategoryService.updateProductCategory({} as RoleProof, 1, 'test', 1, 'test'),
            driverFunction: mockedFn.updateProductCategory,
            driverFunctionResult: {},
            driverFunctionArgs: [{} as RoleProof, 1, 'test', 1, 'test']
        }
    ])(`should call driver function $functionName`, async ({serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs}) => {
        driverFunction.mockReturnValue(driverFunctionResult);
        await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
        expect(driverFunction).toHaveBeenCalled();
        expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
    });
});
