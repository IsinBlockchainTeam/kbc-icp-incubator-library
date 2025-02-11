import { StableBTreeMap } from 'azle';
import { Offer } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import AuthenticationService from './AuthenticationService';
import { OfferNotFoundError, MaterialNotFoundError } from '../models/errors';
import MaterialService from './MaterialService';
import {MaterialNotValid} from "../models/errors/MaterialError";
import {HasInterestedParties} from "./interfaces/HasInterestedParties";

class OfferService implements HasInterestedParties {
    private static _instance: OfferService;

    private _offers = StableBTreeMap<bigint, Offer>(StableMemoryId.OFFERS);

    private _materialService = MaterialService.instance;

    static get instance(): OfferService {
        if (!OfferService._instance) {
            OfferService._instance = new OfferService();
        }
        return OfferService._instance;
    }

    getInterestedParties(entityId: bigint): string[] {
        const result = this.getOffer(entityId);
        return [result.owner];
    }

    getOffers(): Offer[] {
        return this._offers.values();
    }

    getOffer(id: bigint): Offer {
        const result = this._offers.get(id);
        if (result) {
            return result;
        }
        throw new OfferNotFoundError();
    }

    createOffer(materialId: bigint): Offer {
        if (!this._materialService.materialExists(materialId)) throw new MaterialNotFoundError();
        const material = this._materialService.getMaterial(materialId);
        if(material.isInput) throw new MaterialNotValid();
        const id = BigInt(this._offers.keys().length);
        const owner = AuthenticationService.instance.getDelegatorAddress();
        const offer: Offer = { id, owner, material };
        this._offers.insert(id, offer);
        return offer;
    }

    deleteOffer(id: bigint): void {
        if(!this._offers.containsKey(id)) throw new OfferNotFoundError();
        this._offers.remove(id);
    }
}
export default OfferService;
