import {StableBTreeMap} from "azle";
import ProductCategoryService from "../ProductCategoryService";
import {ProductCategory} from "../../models/types";
import {ProductCategoryNotFoundError} from "../../models/errors";

jest.mock('azle');

describe("ProductCategoryService", () => {
    let productCategoryService: ProductCategoryService;
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
        productCategoryService = ProductCategoryService.instance;
    });

    it("retrieves all product categories", () => {
        const expectedResponse = [{name: 'test'} as ProductCategory];
        mockedFn.values.mockReturnValue(expectedResponse);
        expect(productCategoryService.getProductCategories()).toEqual(expectedResponse);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it("retrieves a product category by id", () => {
        const expectedResponse = {name: 'test'} as ProductCategory;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(productCategoryService.getProductCategory(1n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => productCategoryService.getProductCategory(1n)).toThrow(ProductCategoryNotFoundError);
    });

    it("checks if a product category exists", () => {
        const expectedResponse = {name: 'test'} as ProductCategory;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(productCategoryService.productCategoryExists(1n)).toBeTruthy();
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(productCategoryService.productCategoryExists(1n)).toBeFalsy();
    });

    it("creates a product category", () => {
        const expectedResponse = {id: 0n, name: 'test', quality: 1n, description: 'test'} as ProductCategory;
        mockedFn.keys.mockReturnValue([]);
        expect(productCategoryService.createProductCategory('test', 1n, 'test')).toEqual(expectedResponse);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();
    });

    it("updates a product category", () => {
        const expectedResponse = {id: 0n, name: 'test', quality: 1n, description: 'test'} as ProductCategory;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(productCategoryService.updateProductCategory(0n, 'test', 1n, 'test')).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => productCategoryService.updateProductCategory(0n, 'test', 1n, 'test')).toThrow(ProductCategoryNotFoundError);
    });
});
