import { Signer, utils } from 'ethers';
import { OfferManager, OfferManager__factory } from '../smart-contracts';
import { Offer } from '../entities/Offer';
import { EntityBuilder } from '../utils/EntityBuilder';

export class OfferDriver {
    private _contract: OfferManager;

    constructor(
        signer: Signer,
        offerManagerAddress: string,
    ) {
        this._contract = OfferManager__factory
            .connect(offerManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerOffer(companyAddress: string, productCategory: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        try {
            const tx = await this._contract.registerOffer(companyAddress, productCategory);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOffersCounter(): Promise<number> {
        const counter = await this._contract.getOffersCounter();
        return counter.toNumber();
    }

    async getOfferIdsByCompany(companyAddress: string): Promise<number[]> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        const ids = await this._contract.getOfferIdsByCompany(companyAddress);
        return ids.map((id) => id.toNumber());
    }

    async getOffer(offerId: number): Promise<Offer> {
        try {
            const rawOffer = await this._contract.getOffer(offerId);
            return EntityBuilder.buildOffer(rawOffer);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateOffer(offerId: number, productCategory: string): Promise<void> {
        try {
            const tx = await this._contract.updateOffer(offerId, productCategory);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteOffer(offerId: number): Promise<void> {
        try {
            const tx = await this._contract.deleteOffer(offerId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
