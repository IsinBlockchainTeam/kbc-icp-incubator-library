import { update } from 'azle';
import ProductCategoryController from '../ProductCategoryController';
import ProductCategoryService from '../../services/ProductCategoryService';
import { ProductCategory } from '../../models/types';
import { AtLeastViewer, OnlyController } from '../../decorators/roles';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/ProductCategoryService', () => ({
    instance: {
        getProductCategories: jest.fn(),
        getProductCategory: jest.fn(),
        createProductCategory: jest.fn(),
        updateProductCategory: jest.fn(),
        deleteProductCategory: jest.fn()
    }
}));
describe('ProductCategoryController', () => {
    const productCategoryServiceInstanceMock = ProductCategoryService.instance as jest.Mocked<ProductCategoryService>;
    const productCategoryController = new ProductCategoryController();

    it.each([
        {
            controllerFunctionName: 'getProductCategories',
            controllerFunction: () => productCategoryController.getProductCategories(),
            serviceFunction: productCategoryServiceInstanceMock.getProductCategories,
            expectedResult: [{ name: 'test' } as ProductCategory],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getProductCategory',
            controllerFunction: () => productCategoryController.getProductCategory(1n),
            serviceFunction: productCategoryServiceInstanceMock.getProductCategory,
            expectedResult: { name: 'test' } as ProductCategory,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'createProductCategory',
            controllerFunction: () => productCategoryController.createProductCategory('test'),
            serviceFunction: productCategoryServiceInstanceMock.createProductCategory,
            expectedResult: { name: 'test' } as ProductCategory,
            expectedArguments: ['test'],
            expectedDecorators: [update, OnlyController]
        },
        {
            controllerFunctionName: 'updateProductCategory',
            controllerFunction: () => productCategoryController.updateProductCategory(1n, 'test'),
            serviceFunction: productCategoryServiceInstanceMock.updateProductCategory,
            expectedResult: { name: 'test' } as ProductCategory,
            expectedArguments: [1n, 'test'],
            expectedDecorators: [update, OnlyController]
        },
        {
            controllerFunctionName: 'deleteProductCategory',
            controllerFunction: () => productCategoryController.deleteProductCategory(1n),
            serviceFunction: productCategoryServiceInstanceMock.deleteProductCategory,
            expectedResult: true,
            expectedArguments: [1n],
            expectedDecorators: [update, OnlyController]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
