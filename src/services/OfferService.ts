import { OfferDriver } from '../drivers/OfferDriver';
import { Offer } from '../entities/Offer';
import { RoleProof } from '../types/RoleProof';

export class OfferService {
    private _offerDriver: OfferDriver;

    constructor(offerDriver: OfferDriver) {
        this._offerDriver = offerDriver;
    }

    async registerSupplier(companyAddress: string, name: string): Promise<void> {
        await this._offerDriver.registerSupplier(companyAddress, name);
    }

    async registerOffer(
        roleProof: RoleProof,
        companyAddress: string,
        productCategoryId: number
    ): Promise<void> {
        await this._offerDriver.registerOffer(roleProof, companyAddress, productCategoryId);
    }

    async getOfferIdsByCompany(companyAddress: string): Promise<number[]> {
        return this._offerDriver.getOfferIdsByCompany(companyAddress);
    }

    async getSupplierName(companyAddress: string): Promise<string> {
        return this._offerDriver.getSupplierName(companyAddress);
    }

    async getOffer(roleProof: RoleProof, offerId: number): Promise<Offer> {
        return this._offerDriver.getOffer(roleProof, offerId);
    }

    async getOffersByCompany(roleProof: RoleProof, companyAddress: string): Promise<Offer[]> {
        const offerIds = await this.getOfferIdsByCompany(companyAddress);
        return Promise.all(offerIds.map(async (id) => this.getOffer(roleProof, id)));
    }

    async getAllOffers(roleProof: RoleProof): Promise<Offer[]> {
        const counter = await this._offerDriver.getLastId();

        const offersPromises = Array.from({ length: counter }, (_, i) => {
            const index = i + 1;
            return this.getOffer(roleProof, index).catch((e) => {
                console.log(`Offer with id ${index} has been deleted`);
                return null;
            });
        });

        const offers: (Offer | null)[] = await Promise.all(offersPromises);

        // Filter out null values (offers that have been deleted)
        return offers.filter((offer) => offer !== null) as Offer[];
    }

    async updateSupplier(companyAddress: string, name: string): Promise<void> {
        await this._offerDriver.updateSupplier(companyAddress, name);
    }

    async updateOffer(
        roleProof: RoleProof,
        offerId: number,
        productCategoryId: number
    ): Promise<void> {
        await this._offerDriver.updateOffer(roleProof, offerId, productCategoryId);
    }

    async deleteSupplier(companyAddress: string): Promise<void> {
        await this._offerDriver.deleteSupplier(companyAddress);
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
