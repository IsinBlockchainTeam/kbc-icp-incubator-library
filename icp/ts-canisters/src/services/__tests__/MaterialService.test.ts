import {StableBTreeMap} from "azle";
import MaterialService from "../MaterialService";
import {Material, ProductCategory} from "../../models/types";
import ProductCategoryService from "../ProductCategoryService";
import {MaterialNotFoundError, ProductCategoryNotFoundError} from "../../models/errors";
import AuthenticationService from "../AuthenticationService";

jest.mock('azle');
jest.mock('../../services/AuthenticationService', () => ({
    instance: {
        getDelegatorAddress: jest.fn(),
        getRole: jest.fn()
    }
}));
jest.mock('../../services/ProductCategoryService', () => ({
    instance: {
        productCategoryExists: jest.fn(),
        getProductCategory: jest.fn()
    }
}));

describe("MaterialService", () => {
    let materialService: MaterialService;
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;
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

    it("retrieves the interested parties", () => {
        const expectedResponse = {id: 1n, owner: 'ownerTest'} as Material;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(materialService.getInterestedParties(1n)).toEqual([expectedResponse.owner]);
    });

    it("retrieves all materials", () => {
        const materials = [{id: 1n, owner: 'owner'} as Material, {id: 2n, owner: 'other'} as Material];
        const expectedResponse = [materials[0]];
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue('owner');
        mockedFn.values.mockReturnValue(materials);
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
        const expectedResponse = {
            id: 0n,
            owner: 'owner',
            name: 'nameTest',
            productCategory: {} as ProductCategory,
            typology: 'typologyTest',
            quality: 'qualityTest',
            moisture: 'moistureTest',
            isInput: false
        } as Material;
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue('owner');
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.keys.mockReturnValue([]);
        expect(materialService.createMaterial(
            expectedResponse.name,
            expectedResponse.productCategory.id,
            expectedResponse.typology,
            expectedResponse.quality,
            expectedResponse.moisture,
            expectedResponse.isInput
        )).toEqual(expectedResponse);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => materialService.createMaterial(
            expectedResponse.name,
            expectedResponse.productCategory.id,
            expectedResponse.typology,
            expectedResponse.quality,
            expectedResponse.moisture,
            expectedResponse.isInput
        )).toThrow(ProductCategoryNotFoundError);
    });

    it("updates a material", () => {
        const expectedResponse = {id: 0n, productCategory: {} as ProductCategory} as Material;
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(materialService.updateMaterial(
            expectedResponse.id,
            expectedResponse.name,
            expectedResponse.productCategory.id,
            expectedResponse.typology,
            expectedResponse.quality,
            expectedResponse.moisture,
            expectedResponse.isInput
        )).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => materialService.updateMaterial(
            expectedResponse.id,
            expectedResponse.name,
            expectedResponse.productCategory.id,
            expectedResponse.typology,
            expectedResponse.quality,
            expectedResponse.moisture,
            expectedResponse.isInput
        )).toThrow(MaterialNotFoundError);
        mockedFn.get.mockReturnValue(expectedResponse);
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => materialService.updateMaterial(
            expectedResponse.id,
            expectedResponse.name,
            expectedResponse.productCategory.id,
            expectedResponse.typology,
            expectedResponse.quality,
            expectedResponse.moisture,
            expectedResponse.isInput
        )).toThrow(ProductCategoryNotFoundError);
    });
});
