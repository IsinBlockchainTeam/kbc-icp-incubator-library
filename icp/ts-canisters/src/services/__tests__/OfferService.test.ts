import { StableBTreeMap } from "azle";
import OfferService from "../OfferService";
import { Offer, Material } from "../../models/types";
import AuthenticationService from "../AuthenticationService";
import { MaterialNotFoundError, OfferNotFoundError } from "../../models/errors";
import MaterialService from "../MaterialService";
import {MaterialNotValid} from "../../models/errors/MaterialError";

jest.mock('azle');
jest.mock('../../services/MaterialService', () => ({
    instance: {
        materialExists: jest.fn(),
        getMaterial: jest.fn()
    }
}));
jest.mock('../../services/AuthenticationService', () => ({
    instance: {
        getDelegatorAddress: jest.fn(),
    }
}));

describe("OfferService", () => {
    let offerService: OfferService;
    const materialServiceInstanceMock = MaterialService.instance as jest.Mocked<MaterialService>;

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn(),
        containsKey: jest.fn(),
        remove: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert,
            containsKey: mockedFn.containsKey,
            remove: mockedFn.remove
        });
        offerService = OfferService.instance;
    });

    it("retrieves all offers", () => {
        const expectedResponse = [{ id: 1n } as Offer];
        mockedFn.values.mockReturnValue(expectedResponse);
        expect(offerService.getOffers()).toEqual(expectedResponse);
        expect(mockedFn.values).toHaveBeenCalled();
    });

    it("retrieves a offer by id", () => {
        const expectedResponse = { id: 1n } as Offer;
        mockedFn.get.mockReturnValue(expectedResponse);
        expect(offerService.getOffer(1n)).toEqual(expectedResponse);
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => offerService.getOffer(1n)).toThrow(OfferNotFoundError);
    });

    it("creates a offer", () => {
        (AuthenticationService.instance.getDelegatorAddress as jest.Mock).mockReturnValue('ownerTest');
        const material = { id: 0n, isInput: false } as Material;
        const expectedResponse = { id: 0n, owner: 'ownerTest', material } as Offer;
        materialServiceInstanceMock.materialExists.mockReturnValue(true);
        materialServiceInstanceMock.getMaterial.mockReturnValue(material);
        mockedFn.keys.mockReturnValue([]);
        expect(offerService.createOffer(0n)).toEqual(expectedResponse);
        expect(mockedFn.keys).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalled();

        materialServiceInstanceMock.materialExists.mockReturnValue(false);
        expect(() => offerService.createOffer(0n)).toThrow(MaterialNotFoundError);

        materialServiceInstanceMock.materialExists.mockReturnValue(true);
        materialServiceInstanceMock.getMaterial.mockReturnValue({isInput: true} as Material);
        expect(() => offerService.createOffer(0n)).toThrow(MaterialNotValid);
    });

    it("deletes a offer", () => {
        mockedFn.containsKey.mockReturnValue(true);
        offerService.deleteOffer(1n);
        expect(mockedFn.containsKey).toHaveBeenCalledWith(1n);
        expect(mockedFn.remove).toHaveBeenCalledWith(1n);

        mockedFn.remove.mockReset();
        mockedFn.containsKey.mockReset();

        mockedFn.containsKey.mockReturnValue(false);
        expect(() => offerService.deleteOffer(1n)).toThrow(OfferNotFoundError);
        expect(mockedFn.containsKey).toHaveBeenCalledWith(1n);
        expect(mockedFn.remove).not.toHaveBeenCalledWith(1n);
    });
});
