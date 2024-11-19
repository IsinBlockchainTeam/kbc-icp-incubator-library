import ProductCategoryController from "../ProductCategoryController";
import ProductCategoryService from "../../services/ProductCategoryService";
import {ProductCategory} from "../../models/types";
import {update} from "azle";
import {AtLeastEditor, AtLeastViewer} from "../../decorators/roles";
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
    let productCategoryServiceInstanceMock = ProductCategoryService.instance as jest.Mocked<ProductCategoryService>;
    let productCategoryController = new ProductCategoryController();

    it.each([
        {
            controllerFunctionName: 'getProductCategories',
            controllerFunction: () => productCategoryController.getProductCategories(),
            serviceFunction: productCategoryServiceInstanceMock.getProductCategories,
            expectedResult: [{name: 'test'} as ProductCategory],
            expectedDecorators: [update, AtLeastViewer],
        }, {
            controllerFunctionName: 'getProductCategory',
            controllerFunction: () => productCategoryController.getProductCategory(1n),
            serviceFunction: productCategoryServiceInstanceMock.getProductCategory,
            expectedResult: {name: 'test'} as ProductCategory,
            expectedDecorators: [update, AtLeastViewer],
        }, {
            controllerFunctionName: 'createProductCategory',
            controllerFunction: () => productCategoryController.createProductCategory('test', 1n, 'test'),
            serviceFunction: productCategoryServiceInstanceMock.createProductCategory,
            expectedResult: {name: 'test'} as ProductCategory,
            expectedDecorators: [update, AtLeastEditor],
        }, {
            controllerFunctionName: 'updateProductCategory',
            controllerFunction: () => productCategoryController.updateProductCategory(1n, 'test', 1n, 'test'),
            serviceFunction: productCategoryServiceInstanceMock.updateProductCategory,
            expectedResult: {name: 'test'} as ProductCategory,
            expectedDecorators: [update, AtLeastEditor],
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
