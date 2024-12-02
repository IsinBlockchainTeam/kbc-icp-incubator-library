import OfferService from "../OfferService";
import {Offer, ProductCategory} from "../../models/types";
import {StableBTreeMap} from "azle";
import ProductCategoryService from "../ProductCategoryService";
import AuthenticationService from "../AuthenticationService";
import {OfferNotFoundError, ProductCategoryNotFoundError} from "../../models/errors";

jest.mock('azle');
jest.mock('../../services/ProductCategoryService', () => {
    return {
        instance: {
            productCategoryExists: jest.fn(),
            getProductCategory: jest.fn()
        }
    };
});
jest.mock('../../services/AuthenticationService', () => {
    return {
        instance: {
            getDelegatorAddress: jest.fn(),
        }
    };
});

describe("OfferService", () => {
    let offerService: OfferService;
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
        offerService = OfferService.instance;
    });

    it("retrieves all offers", () => {
        const expectedResponse = [{id: 1n} as Offer];
        mockedFn.values.mockReturnValue(expectedResponse);
        expect(offerService.getOffers()).toEqual(expectedResponse);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it("retrieves a offer by id", () => {
        const expectedResponse = {id: 1n} as Offer;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(offerService.getOffer(1n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => offerService.getOffer(1n)).toThrow(OfferNotFoundError);
    });

    it("creates a offer", () => {
        (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue('ownerTest');
        const expectedResponse = {id: 0n, owner: 'ownerTest', productCategory: {} as ProductCategory} as Offer;
        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(true);
        productCategoryServiceInstanceMock.getProductCategory.mockReturnValue(expectedResponse.productCategory);
        mockedFn.keys.mockReturnValue([]);
        expect(offerService.createOffer(0n)).toEqual(expectedResponse);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        productCategoryServiceInstanceMock.productCategoryExists.mockReturnValue(false);
        expect(() => offerService.createOffer(0n)).toThrow(ProductCategoryNotFoundError);
    });
});
