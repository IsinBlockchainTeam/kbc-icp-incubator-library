import { StableBTreeMap } from 'azle';
import MaterialService from '../MaterialService';
import { ErrorType, Material, ProductCategory } from '../../models/types';
import ProductCategoryService from '../ProductCategoryService';

jest.mock('azle');
jest.mock('../../services/ProductCategoryService', () => ({
    instance: {
        productCategoryExists: jest.fn(),
        getProductCategory: jest.fn()
    }
}));

describe('MaterialService', () => {
    let materialService: MaterialService;
    const productCategoryServiceInstanceMock = ProductCategoryService.instance as jest.Mocked<ProductCategoryService>;

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert
        });
        materialService = MaterialService.instance;
    });

    it('retrieves all materials', () => {
        const expectedResponse = [{ id: 1n } as Material];
        mockedFn.values.mockReturnValue(expectedResponse);
        expect(materialService.getMaterials()).toEqual(expectedResponse);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it('retrieves a material by id', () => {
        const expectedResponse = { id: 1n } as Material;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(materialService.getMaterial(1n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => materialService.getMaterial(1n)).toThrow(new Error(`(${ErrorType.MATERIAL_NOT_FOUND}) Material not found.`));
    });

    it('creates a material', () => {
        const expectedResponse = { id: 0n, productCategory: {} as ProductCategory } as Material;
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.keys.mockReturnValue([]);
        expect(materialService.createMaterial(0n)).toEqual(expectedResponse);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => materialService.createMaterial(0n)).toThrow(new Error(`(${ErrorType.PRODUCT_CATEGORY_NOT_FOUND}) Product category not found.`));
    });

    it('updates a material', () => {
        const expectedResponse = { id: 0n, productCategory: {} as ProductCategory } as Material;
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(materialService.updateMaterial(0n, 0n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => materialService.updateMaterial(0n, 0n)).toThrow(new Error(`(${ErrorType.MATERIAL_NOT_FOUND}) Material not found.`));
        mockedFn.get.mockReturnValue(expectedResponse);
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => materialService.updateMaterial(0n, 0n)).toThrow(
            new Error(`(${ErrorType.PRODUCT_CATEGORY_NOT_FOUND}) Product category not found.`)
        );
    });
});
