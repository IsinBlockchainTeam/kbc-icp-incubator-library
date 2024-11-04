import {StableBTreeMap} from "azle";
import {Offer} from "../models/types";
import {StableMemoryId} from "../utils/stableMemory";
import ProductCategoryService from "./ProductCategoryService";
import AuthenticationService from "./AuthenticationService";

class OfferService {
    private static _instance: OfferService;
    private _offers = StableBTreeMap<bigint, Offer>(StableMemoryId.OFFERS);
    private _productCategoryService = ProductCategoryService.instance;
    private _authenticationService = AuthenticationService.instance;

    private constructor() {}
    static get instance(): OfferService {
        if (!OfferService._instance) {
            OfferService._instance = new OfferService();
        }
        return OfferService._instance;
    }

    getOffers(): Offer[] {
        return this._offers.values();
    }

    getOffer(id: bigint): Offer {
        const result = this._offers.get(id);
        if(result) {
            return result;
        }
        throw new Error('Offer not found');
    }

    createOffer(productCategoryId: bigint): Offer {
        if (!this._productCategoryService.productCategoryExists(productCategoryId)) {
            throw new Error('Product category not found');
        }
        const productCategory = this._productCategoryService.getProductCategory(productCategoryId);
        const id = BigInt(this._offers.keys().length);
        const owner = this._authenticationService.getDelegatorAddress();
        const offer: Offer = { id, owner, productCategory };
        this._offers.insert(id, offer);
        return offer;
    }
}
export default OfferService;
