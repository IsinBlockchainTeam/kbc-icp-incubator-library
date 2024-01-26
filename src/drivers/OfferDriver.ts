/* eslint-disable camelcase */

import { Signer, utils } from 'ethers';
import {
    OfferManager,
    OfferManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory
} from '../smart-contracts';
import { Offer } from '../entities/Offer';
import { EntityBuilder } from '../utils/EntityBuilder';

export class OfferDriver {
    private _offerManagerContract: OfferManager;

    private _productCategoryManagerContract: ProductCategoryManager;

    constructor(
        signer: Signer,
        offerManagerAddress: string,
        productCategoryManagerAddress: string,
    ) {
        this._offerManagerContract = OfferManager__factory
            .connect(offerManagerAddress, signer.provider!)
            .connect(signer);
        this._productCategoryManagerContract = ProductCategoryManager__factory
            .connect(productCategoryManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerOffer(companyAddress: string, productCategoryId: number): Promise<void> {
    async registerSupplier(companyAddress: string, name: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        try {
            const tx = await this._contract.registerSupplier(companyAddress, name);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async registerOffer(companyAddress: string, productCategory: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        try {
            const tx = await this._offerManagerContract.registerOffer(companyAddress, productCategoryId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getLastId(): Promise<number> {
        const counter = await this._offerManagerContract.getLastId();
        return counter.toNumber();
    }

    async getOfferIdsByCompany(companyAddress: string): Promise<number[]> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        const ids = await this._offerManagerContract.getOfferIdsByCompany(companyAddress);
        return ids.map((id) => id.toNumber());
    }

    async getSupplierName(companyAddress: string, blockNumber?: number): Promise<string> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        try {
            return await this._contract.getSupplierName(companyAddress, { blockTag: blockNumber });
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOffer(offerId: number, blockNumber?: number): Promise<Offer> {
        try {
            const rawOffer = await this._offerManagerContract.getOffer(offerId, { blockTag: blockNumber });
            const rawProductCategory = await this._productCategoryManagerContract.getProductCategory(rawOffer.productCategoryId);
            return EntityBuilder.buildOffer(rawOffer, rawProductCategory);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateOffer(offerId: number, productCategoryId: number): Promise<void> {
    async updateSupplier(companyAddress: string, newName: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        try {
            const tx = await this._contract.updateSupplier(companyAddress, newName);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateOffer(offerId: number, productCategory: string): Promise<void> {
        try {
            const tx = await this._offerManagerContract.updateOffer(offerId, productCategoryId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteSupplier(companyAddress: string): Promise<void> {
        try {
            const tx = await this._contract.deleteSupplier(companyAddress);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteOffer(offerId: number): Promise<void> {
        try {
            const tx = await this._offerManagerContract.deleteOffer(offerId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');

        try {
            const tx = await this._offerManagerContract.addAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');

        try {
            const tx = await this._offerManagerContract.removeAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
