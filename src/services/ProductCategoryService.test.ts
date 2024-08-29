import { createMock } from 'ts-auto-mock';
import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
import { ProductCategoryService } from './ProductCategoryService';
import { RoleProof } from '../types/RoleProof';

describe('ProductCategoryService', () => {
    const mockedProductCategoryDriver: ProductCategoryDriver = createMock<ProductCategoryDriver>({
        getProductCategoryCounter: jest.fn(),
        getProductCategoryExists: jest.fn(),
        getProductCategory: jest.fn(),
        getProductCategories: jest.fn(),
        registerProductCategory: jest.fn(),
        updateProductCategory: jest.fn()
    });

    const productCategoryService = new ProductCategoryService(mockedProductCategoryDriver);

    const roleProof: RoleProof = createMock<RoleProof>();

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getProductCategoryCounter',
            serviceFunction: () => productCategoryService.getProductCategoryCounter(roleProof),
            expectedMockedFunction: mockedProductCategoryDriver.getProductCategoryCounter,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getProductCategoryExists',
            serviceFunction: () => productCategoryService.getProductCategoryExists(roleProof, 1),
            expectedMockedFunction: mockedProductCategoryDriver.getProductCategoryExists,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getProductCategory',
            serviceFunction: () => productCategoryService.getProductCategory(roleProof, 1),
            expectedMockedFunction: mockedProductCategoryDriver.getProductCategory,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getProductCategories',
            serviceFunction: () => productCategoryService.getProductCategories(roleProof),
            expectedMockedFunction: mockedProductCategoryDriver.getProductCategories,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'registerProductCategory',
            serviceFunction: () =>
                productCategoryService.registerProductCategory(roleProof, 'name', 1, 'description'),
            expectedMockedFunction: mockedProductCategoryDriver.registerProductCategory,
            expectedMockedFunctionArgs: [roleProof, 'name', 1, 'description']
        },
        {
            serviceFunctionName: 'updateProductCategory',
            serviceFunction: () =>
                productCategoryService.updateProductCategory(
                    roleProof,
                    1,
                    'name',
                    1,
                    'description'
                ),
            expectedMockedFunction: mockedProductCategoryDriver.updateProductCategory,
            expectedMockedFunctionArgs: [roleProof, 1, 'name', 1, 'description']
        }
    ])(
        'service should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );
});
