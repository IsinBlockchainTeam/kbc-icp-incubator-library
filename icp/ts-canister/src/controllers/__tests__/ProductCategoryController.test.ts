import ProductCategoryController from "../ProductCategoryController";
import ProductCategoryService from "../../services/ProductCategoryService";
import {ProductCategory, RoleProof} from "../../models/types";
import {update} from "azle";
import {OnlyEditor, OnlyViewer} from "../../decorators/roles";
jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/ProductCategoryService', () => {
    return {
        instance: {
            getProductCategories: jest.fn(),
            getProductCategory: jest.fn(),
            createProductCategory: jest.fn(),
            updateProductCategory: jest.fn()
        }
    };
});
describe('ProductCategoryController', () => {
    const roleProof = {} as RoleProof;
    let productCategoryServiceInstanceMock = ProductCategoryService.instance as jest.Mocked<ProductCategoryService>;
    let productCategoryController = new ProductCategoryController();

    it.each([
        {
            controllerFunctionName: 'getProductCategories',
            controllerFunction: () => productCategoryController.getProductCategories(roleProof),
            serviceFunction: productCategoryServiceInstanceMock.getProductCategories,
            expectedResult: [{name: 'test'} as ProductCategory],
            expectedDecorators: [update, OnlyViewer],
        }, {
            controllerFunctionName: 'getProductCategory',
            controllerFunction: () => productCategoryController.getProductCategory(roleProof, 1n),
            serviceFunction: productCategoryServiceInstanceMock.getProductCategory,
            expectedResult: {name: 'test'} as ProductCategory,
            expectedDecorators: [update, OnlyViewer],
        }, {
            controllerFunctionName: 'createProductCategory',
            controllerFunction: () => productCategoryController.createProductCategory(roleProof, 'test', 1n, 'test'),
            serviceFunction: productCategoryServiceInstanceMock.createProductCategory,
            expectedResult: {name: 'test'} as ProductCategory,
            expectedDecorators: [update, OnlyEditor],
        }, {
            controllerFunctionName: 'updateProductCategory',
            controllerFunction: () => productCategoryController.updateProductCategory(roleProof, 1n, 'test', 1n, 'test'),
            serviceFunction: productCategoryServiceInstanceMock.updateProductCategory,
            expectedResult: {name: 'test'} as ProductCategory,
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
