import MaterialService from "../MaterialService";
import {Material, ProductCategory} from "../../models/types";
import {StableBTreeMap} from "azle";
import ProductCategoryService from "../ProductCategoryService";
import {MaterialNotFoundError, ProductCategoryNotFoundError} from "../../models/errors";

jest.mock('azle');
jest.mock('../../services/ProductCategoryService', () => {
    return {
        instance: {
            productCategoryExists: jest.fn(),
            getProductCategory: jest.fn()
        }
    };
});

describe("MaterialService", () => {
    let materialService: MaterialService;
    let productCategoryServiceInstanceMock = ProductCategoryService.instance as jest.Mocked<ProductCategoryService>;

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

    it("retrieves all materials", () => {
        const expectedResponse = [{id: 1n} as Material];
        mockedFn.values.mockReturnValue(expectedResponse);
        expect(materialService.getMaterials()).toEqual(expectedResponse);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it("retrieves a material by id", () => {
        const expectedResponse = {id: 1n} as Material;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(materialService.getMaterial(1n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => materialService.getMaterial(1n)).toThrow(MaterialNotFoundError);
    });

    it("creates a material", () => {
        const expectedResponse = {id: 0n, productCategory: {} as ProductCategory} as Material;
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.keys.mockReturnValue([]);
        expect(materialService.createMaterial(0n)).toEqual(expectedResponse);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => materialService.createMaterial(0n)).toThrow(ProductCategoryNotFoundError);
    });

    it("updates a material", () => {
        const expectedResponse = {id: 0n, productCategory: {} as ProductCategory} as Material;
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(materialService.updateMaterial(0n, 0n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => materialService.updateMaterial(0n, 0n)).toThrow(MaterialNotFoundError);
        mockedFn.get.mockReturnValue(expectedResponse);
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => materialService.updateMaterial(0n, 0n)).toThrow(ProductCategoryNotFoundError);
    });
});
