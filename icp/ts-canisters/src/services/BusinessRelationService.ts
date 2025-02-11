import { StableBTreeMap } from "azle";
import { StableMemoryId } from "../utils/stableMemory";
import { BusinessRelation } from "../models/types/src/BusinessRelation";
import { BusinessRelationNotFoundError } from '../models/errors/BusinessRelationError';

export class BusinessRelationService {
    private static _instance: BusinessRelationService;

    // The key is the concatenation of the two addresses (ethAddressA-ethAddressB)
    private _businessRelations = StableBTreeMap<string, BusinessRelation>(StableMemoryId.BUSINESS_RELATIONSHIP);

    static get instance() {
        if (!BusinessRelationService._instance) {
            BusinessRelationService._instance = new BusinessRelationService();
        }
        return BusinessRelationService._instance;
    }

    createBusinessRelation(ethAddressA: string, ethAddressB: string): BusinessRelation {
        const businessRelation: BusinessRelation = { ethAddressA, ethAddressB };
        
        this._businessRelations.insert(`${ethAddressA}-${ethAddressB}`, businessRelation);

        return businessRelation;
    }

    getBusinessRelations(ownerEthAddress: string): BusinessRelation[] {
        const businessRelations: BusinessRelation[] = [];

        this._businessRelations.values().forEach((value) => {
            if (value.ethAddressA === ownerEthAddress) {
                businessRelations.push(value);
            }
        });

        return businessRelations;
    }

    // The direction of the business relation matter because the ethAddressA allow the ethAddressB to see their information, not the opposite
    getBusinessRelation(ethAddressA: string, ethAddressB: string): BusinessRelation {
        const businessRelation = this._businessRelations.get(`${ethAddressA}-${ethAddressB}`);
        if (!businessRelation) {
            throw new BusinessRelationNotFoundError();
        }

        return businessRelation;
    }

    deleteBusinessRelation(ethAddressA: string, ethAddressB: string): boolean {
        const businessRelation = this._businessRelations.get(`${ethAddressA}-${ethAddressB}`);
        if (!businessRelation) {
            throw new BusinessRelationNotFoundError();
        }

        this._businessRelations.remove(`${ethAddressA}-${ethAddressB}`);

        return true;
    }
}

export default BusinessRelationService;