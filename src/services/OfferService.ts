import { OfferDriver } from '../drivers/OfferDriver';

export class OfferService {
    private readonly _offerDriver: OfferDriver;

    constructor(offerDriver: OfferDriver) {
        this._offerDriver = offerDriver;
    }

    async getOffers() {
        return this._offerDriver.getOffers();
    }

    async getOffer(id: number) {
        return this._offerDriver.getOffer(id);
    }

    async createOffer(productCategoryId: number) {
        return this._offerDriver.createOffer(productCategoryId);
    }
}
