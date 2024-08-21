// import { createMock } from 'ts-auto-mock';
// import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
// import { ProductCategoryService } from './ProductCategoryService';
//
// describe('ProductCategoryService', () => {
//     const mockedProductCategoryDriver: ProductCategoryDriver = createMock<ProductCategoryDriver>({
//         getProductCategoryCounter: jest.fn(),
//         getProductCategoryExists: jest.fn(),
//         getProductCategory: jest.fn(),
//         getProductCategories: jest.fn(),
//         registerProductCategory: jest.fn(),
//         updateProductCategory: jest.fn()
//     });
//
//     const productCategoryService = new ProductCategoryService(mockedProductCategoryDriver);
//
//     afterAll(() => {
//         jest.restoreAllMocks();
//     });
//
//     it.each([
//         {
//             serviceFunctionName: 'getProductCategoryCounter',
//             serviceFunction: () => productCategoryService.getProductCategoryCounter(),
//             expectedMockedFunction: mockedProductCategoryDriver.getProductCategoryCounter,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getProductCategoryExists',
//             serviceFunction: () => productCategoryService.getProductCategoryExists(1),
//             expectedMockedFunction: mockedProductCategoryDriver.getProductCategoryExists,
//             expectedMockedFunctionArgs: [1]
//         },
//         {
//             serviceFunctionName: 'getProductCategory',
//             serviceFunction: () => productCategoryService.getProductCategory(1),
//             expectedMockedFunction: mockedProductCategoryDriver.getProductCategory,
//             expectedMockedFunctionArgs: [1]
//         },
//         {
//             serviceFunctionName: 'getProductCategories',
//             serviceFunction: () => productCategoryService.getProductCategories(),
//             expectedMockedFunction: mockedProductCategoryDriver.getProductCategories,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'registerProductCategory',
//             serviceFunction: () =>
//                 productCategoryService.registerProductCategory('name', 1, 'description'),
//             expectedMockedFunction: mockedProductCategoryDriver.registerProductCategory,
//             expectedMockedFunctionArgs: ['name', 1, 'description']
//         },
//         {
//             serviceFunctionName: 'updateProductCategory',
//             serviceFunction: () =>
//                 productCategoryService.updateProductCategory(1, 'name', 1, 'description'),
//             expectedMockedFunction: mockedProductCategoryDriver.updateProductCategory,
//             expectedMockedFunctionArgs: [1, 'name', 1, 'description']
//         }
//     ])(
//         'service should call driver $serviceFunctionName',
//         async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
//             await serviceFunction();
//
//             expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
//             expect(expectedMockedFunction).toHaveBeenNthCalledWith(
//                 1,
//                 ...expectedMockedFunctionArgs
//             );
//         }
//     );
// });
