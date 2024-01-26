import { OfferDriver } from '../drivers/OfferDriver';
import { Offer } from '../entities/Offer';

export class OfferService {
    private _offerDriver: OfferDriver;

    constructor(offerDriver: OfferDriver) {
        this._offerDriver = offerDriver;
    }

    async registerOffer(companyAddress: string, productCategoryId: number): Promise<void> {
        await this._offerDriver.registerOffer(companyAddress, productCategoryId);
    }

    async getOfferIdsByCompany(companyAddress: string): Promise<number[]> {
        return this._offerDriver.getOfferIdsByCompany(companyAddress);
    }

    async getOffer(offerId: number): Promise<Offer> {
        return this._offerDriver.getOffer(offerId);
    }

    async getOffersByCompany(companyAddress: string): Promise<Offer[]> {
        const offerIds = await this.getOfferIdsByCompany(companyAddress);
        return Promise.all(offerIds.map(async (id) => this.getOffer(id)));
    }

    async getAllOffers(): Promise<Offer[]> {
        const counter = await this._offerDriver.getLastId();
        const offers = [];
        for (let i = 1; i <= counter; i++) {
            try {
                offers.push(await this.getOffer(i));
            } catch (e) {
                console.log(`Offer with id ${i} has been deleted`);
            }
        }
        return offers;
    }

    async updateOffer(offerId: number, productCategoryId: number): Promise<void> {
        await this._offerDriver.updateOffer(offerId, productCategoryId);
    }

    async deleteOffer(offerId: number): Promise<void> {
        await this._offerDriver.deleteOffer(offerId);
    }

    async addAdmin(address: string): Promise<void> {
        await this._offerDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._offerDriver.removeAdmin(address);
    }
}
